// Cross-platform deployment helper for Cloudflare
// This handles deploying a Remix app to Cloudflare

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import { parse } from 'toml';

const execAsync = promisify(exec);
const isWindows = platform() === 'win32';

async function run() {
  console.log('📦 Starting Cloudflare deployment process...');
  
  try {
    // Read wrangler.toml to get the name
    let workerName = 'nexusai'; // Default name
    try {
      const wranglerConfig = await fs.readFile('./wrangler.toml', 'utf-8');
      const parsedConfig = parse(wranglerConfig);
      if (parsedConfig.name) {
        workerName = parsedConfig.name;
        console.log(`✅ Using Worker name from wrangler.toml: ${workerName}`);
      }
    } catch (configError) {
      console.warn('⚠️ Could not read wrangler.toml, using default name:', configError.message);
    }

    // Copy functions to the build directory to ensure they're available
    console.log('📂 Copying function files...');
    try {
      // Create the functions directory in the build folder if it doesn't exist
      await fs.mkdir('./build/functions', { recursive: true });
      // Copy the path-based function file
      await fs.copyFile('./functions/[[path]].ts', './build/functions/[[path]].ts');
      console.log('✅ Function files copied successfully');
    } catch (copyError) {
      console.warn('⚠️ Error copying function files:', copyError.message);
    }

    console.log(`🚀 Deploying to Cloudflare as "${workerName}"...`);
    try {
      // Use the explicit path to the entry point
      // On Windows, escape the square brackets
      const entryPoint = isWindows 
        ? './functions/\\[\\[path\\]\\].ts' 
        : './functions/[[path]].ts';
        
      const result = await execAsync(`npx wrangler deploy ${entryPoint} --config wrangler.toml --name ${workerName}`);
      console.log('✅ Deployment output:');
      console.log(result.stdout);
      
      if (result.stderr) {
        console.warn('⚠️ Stderr output:');
        console.warn(result.stderr);
      }
      
      console.log('🎉 Cloudflare deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      
      // Provide helpful error analysis
      if (error.message.includes('Missing entry-point')) {
        console.error('The error is related to the entry point configuration.');
        console.error('Please check that the path to the function file is correct in both wrangler.toml and the deploy command.');
      } else if (error.message.includes('provide a name')) {
        console.error('The error is related to the Worker name not being specified.');
        console.error('Please make sure the name is set in wrangler.toml or passed as --name parameter.');
      } else if (error.message.includes('must match the name of your Worker')) {
        console.error('The name in wrangler.toml does not match the name of your Worker.');
        console.error('Please either:');
        console.error('1. Update the name in wrangler.toml to match your Worker name, or');
        console.error('2. Use the correct Worker name in the deploy command');
        
        // Try alternative deployment approach
        console.log('Attempting alternative deployment approach...');
        try {
          const altResult = await execAsync(`npx wrangler deploy --config wrangler.toml`);
          console.log('✅ Alternative deployment output:');
          console.log(altResult.stdout);
          
          if (altResult.stderr) {
            console.warn('⚠️ Stderr output:');
            console.warn(altResult.stderr);
          }
          
          console.log('🎉 Alternative deployment completed successfully!');
          return;
        } catch (altError) {
          console.error('❌ Alternative deployment failed:', altError.message);
        }
      }
      
      process.exit(1);
    }
  } catch (generalError) {
    console.error('❌ Unexpected error:', generalError.message);
    process.exit(1);
  }
}

run(); 