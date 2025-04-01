import type { WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { ITerminal } from '~/types/terminal';
import { withResolvers } from './promises';
import { atom } from 'nanostores';

export async function newShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
  const args: string[] = [];

  // we spawn a JSH process with a fallback cols and rows in case the process is not attached yet to a visible terminal
  const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
    terminal: {
      cols: terminal.cols ?? 80,
      rows: terminal.rows ?? 15,
    },
  });

  const input = process.input.getWriter();
  const output = process.output;

  const jshReady = withResolvers<void>();

  let isInteractive = false;
  output.pipeTo(
    new WritableStream({
      write(data) {
        if (!isInteractive) {
          const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

          if (osc === 'interactive') {
            // wait until we see the interactive OSC
            isInteractive = true;

            jshReady.resolve();
          }
        }

        terminal.write(data);
      },
    }),
  );

  terminal.onData((data) => {
    // console.log('terminal onData', { data, isInteractive });

    if (isInteractive) {
      input.write(data);
    }
  });

  await jshReady.promise;

  return process;
}

export type ExecutionResult = { output: string; exitCode: number } | undefined;

export class BoltShell {
  #initialized: (() => void) | undefined;
  #readyPromise: Promise<void>;
  #webcontainer: WebContainer | undefined;
  #terminal: ITerminal | undefined;
  #process: WebContainerProcess | undefined;
  executionState = atom<
    { sessionId: string; active: boolean; executionPrms?: Promise<any>; abort?: () => void } | undefined
  >();
  #outputStream: ReadableStreamDefaultReader<string> | undefined;
  #shellInputStream: WritableStreamDefaultWriter<string> | undefined;

  constructor() {
    this.#readyPromise = new Promise((resolve) => {
      this.#initialized = resolve;
    });
  }

  ready() {
    return this.#readyPromise;
  }

  async init(webcontainer: WebContainer, terminal: ITerminal) {
    this.#webcontainer = webcontainer;
    this.#terminal = terminal;

    const { process, output } = await this.newBoltShellProcess(webcontainer, terminal);
    this.#process = process;
    this.#outputStream = output.getReader();
    await this.waitTillOscCode('interactive');
    this.#initialized?.();
  }

  get terminal() {
    return this.#terminal;
  }

  get process() {
    return this.#process;
  }

  async executeCommand(sessionId: string, command: string, abort?: () => void): Promise<ExecutionResult> {
    if (!this.process || !this.terminal) {
      console.warn('Terminal or process not initialized, skipping command execution');
      return { output: 'Terminal not ready', exitCode: -1 };
    }

    const state = this.executionState.get();

    // If there's already an active execution, handle it gracefully
    if (state?.active && state.abort) {
      try {
        state.abort();
      } catch (error) {
        console.warn('Failed to abort previous command', error);
      }
    }

    try {
      // Interrupt the current execution with a safety check
      if (this.terminal && this.terminal.input) {
        this.terminal.input('\x03');
        await this.waitTillOscCode('prompt').catch(() => {
          // If waiting for prompt times out, continue anyway
          console.warn('Timeout waiting for prompt, continuing with command execution');
        });
      }

      // Wait for any previous execution to complete
      if (state && state.executionPrms) {
        try {
          await Promise.race([
            state.executionPrms,
            new Promise(resolve => setTimeout(resolve, 1000)) // 1 second timeout
          ]);
        } catch (error) {
          console.warn('Error waiting for previous command to complete', error);
        }
      }

      // Start a new execution with safety check
      if (this.terminal && this.terminal.input) {
        this.terminal.input(command.trim() + '\n');
      } else {
        return { output: 'Terminal input not available', exitCode: -1 };
      }

      // Wait for the execution to finish
      const executionPromise = this.getCurrentExecutionResult();
      this.executionState.set({ sessionId, active: true, executionPrms: executionPromise, abort });

      // Add a timeout to prevent hanging
      const resp = await Promise.race([
        executionPromise,
        new Promise<ExecutionResult>((resolve) => 
          setTimeout(() => resolve({ output: 'Command execution timed out', exitCode: -1 }), 30000)
        )
      ]);
      
      this.executionState.set({ sessionId, active: false });

      if (resp) {
        try {
          resp.output = cleanTerminalOutput(resp.output);
        } catch (error) {
          console.log('failed to format terminal output', error);
        }
      }

      return resp;
    } catch (error) {
      console.error('Error executing command:', error);
      this.executionState.set({ sessionId, active: false });
      return { 
        output: `Error executing command: ${error instanceof Error ? error.message : String(error)}`, 
        exitCode: -1 
      };
    }
  }

  async newBoltShellProcess(webcontainer: WebContainer, terminal: ITerminal) {
    const args: string[] = [];

    // we spawn a JSH process with a fallback cols and rows in case the process is not attached yet to a visible terminal
    const process = await webcontainer.spawn('/bin/jsh', ['--osc', ...args], {
      terminal: {
        cols: terminal.cols ?? 80,
        rows: terminal.rows ?? 15,
      },
    });

    const input = process.input.getWriter();
    this.#shellInputStream = input;

    const [internalOutput, terminalOutput] = process.output.tee();

    const jshReady = withResolvers<void>();

    let isInteractive = false;
    terminalOutput.pipeTo(
      new WritableStream({
        write(data) {
          if (!isInteractive) {
            const [, osc] = data.match(/\x1b\]654;([^\x07]+)\x07/) || [];

            if (osc === 'interactive') {
              // wait until we see the interactive OSC
              isInteractive = true;

              jshReady.resolve();
            }
          }

          terminal.write(data);
        },
      }),
    );

    terminal.onData((data) => {
      // console.log('terminal onData', { data, isInteractive });

      if (isInteractive) {
        input.write(data);
      }
    });

    await jshReady.promise;

    return { process, output: internalOutput };
  }

  async getCurrentExecutionResult(): Promise<ExecutionResult> {
    const { output, exitCode } = await this.waitTillOscCode('exit');
    return { output, exitCode };
  }

  async waitTillOscCode(waitCode: string) {
    let fullOutput = '';
    let exitCode: number = 0;

    if (!this.#outputStream) {
      return { output: fullOutput, exitCode };
    }

    const tappedStream = this.#outputStream;
    const startTime = Date.now();
    const timeout = 10000; // 10 second timeout

    while (true) {
      try {
        // Add a timeout for the read operation
        const readPromise = tappedStream.read();
        const timeoutPromise = new Promise<{value: string, done: boolean}>((_, reject) => {
          setTimeout(() => {
            if (Date.now() - startTime > timeout) {
              reject(new Error(`Timeout waiting for OSC code: ${waitCode}`));
            }
          }, 1000); // Check every second
        });

        // Race between the read operation and the timeout
        const { value, done } = await Promise.race([readPromise, timeoutPromise]);

        if (done) {
          break;
        }

        const text = value || '';
        fullOutput += text;

        // Check if command completion signal with exit code
        const [, osc, , , code] = text.match(/\x1b\]654;([^\x07=]+)=?((-?\d+):(\d+))?\x07/) || [];

        if (osc === 'exit') {
          exitCode = parseInt(code, 10);
        }

        if (osc === waitCode) {
          break;
        }

        // Check for overall timeout
        if (Date.now() - startTime > timeout) {
          console.warn(`Timeout waiting for OSC code: ${waitCode}`);
          break;
        }
      } catch (error) {
        console.warn(`Error waiting for terminal output: ${error instanceof Error ? error.message : String(error)}`);
        break;
      }
    }

    return { output: fullOutput, exitCode };
  }
}

/**
 * Cleans and formats terminal output while preserving structure and paths
 * Handles ANSI, OSC, and various terminal control sequences
 */
export function cleanTerminalOutput(input: string): string {
  // Step 1: Remove OSC sequences (including those with parameters)
  const removeOsc = input
    .replace(/\x1b\](\d+;[^\x07\x1b]*|\d+[^\x07\x1b]*)\x07/g, '')
    .replace(/\](\d+;[^\n]*|\d+[^\n]*)/g, '');

  // Step 2: Remove ANSI escape sequences and color codes more thoroughly
  const removeAnsi = removeOsc
    // Remove all escape sequences with parameters
    .replace(/\u001b\[[\?]?[0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1b\[[\?]?[0-9;]*[a-zA-Z]/g, '')
    // Remove color codes
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/\x1b\[[0-9;]*m/g, '')
    // Clean up any remaining escape characters
    .replace(/\u001b/g, '')
    .replace(/\x1b/g, '');

  // Step 3: Clean up carriage returns and newlines
  const cleanNewlines = removeAnsi
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n');

  // Step 4: Add newlines at key breakpoints while preserving paths
  const formatOutput = cleanNewlines
    // Preserve prompt line
    .replace(/^([~\/][^\n❯]+)❯/m, '$1\n❯')
    // Add newline before command output indicators
    .replace(/(?<!^|\n)>/g, '\n>')
    // Add newline before error keywords without breaking paths
    .replace(/(?<!^|\n|\w)(error|failed|warning|Error|Failed|Warning):/g, '\n$1:')
    // Add newline before 'at' in stack traces without breaking paths
    .replace(/(?<!^|\n|\/)(at\s+(?!async|sync))/g, '\nat ')
    // Ensure 'at async' stays on same line
    .replace(/\bat\s+async/g, 'at async')
    // Add newline before npm error indicators
    .replace(/(?<!^|\n)(npm ERR!)/g, '\n$1');

  // Step 5: Clean up whitespace while preserving intentional spacing
  const cleanSpaces = formatOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  // Step 6: Final cleanup
  return cleanSpaces
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/:\s+/g, ': ') // Normalize spacing after colons
    .replace(/\s{2,}/g, ' ') // Remove multiple spaces
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .replace(/\u0000/g, ''); // Remove null characters
}

export function newBoltShellProcess() {
  return new BoltShell();
}
