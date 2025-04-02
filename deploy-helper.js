// Cross-platform deployment helper for Cloudflare
// This handles deploying a Remix app to Cloudflare

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);
const isWindows = platform() === 'win32';

// Simple function to extract name from wrangler.toml without requiring the toml package
async function extractNameFromWranglerToml(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const nameMatch = content.match(/^\s*name\s*=\s*["']([^"']+)["']/m);
    return nameMatch ? nameMatch[1] : null;
  } catch (error) {
    console.warn('⚠️ Error reading wrangler.toml:', error.message);
    return null;
  }
}

async function run() {
  console.log('📦 Starting Cloudflare deployment process...');
  
  try {
    // Read wrangler.toml to get the name
    let workerName = 'nexusai'; // Default name
    const extractedName = await extractNameFromWranglerToml('./wrangler.toml');
    if (extractedName) {
      workerName = extractedName;
      console.log(`✅ Using Worker name from wrangler.toml: ${workerName}`);
    } else {
      console.log(`ℹ️ Using default Worker name: ${workerName}`);
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

    // Try multiple deployment methods in sequence until one works
    const deploymentMethods = [
      // Method 1: Use the name from wrangler.toml with entry point
      async () => {
        console.log(`🚀 Trying deployment method 1: Using explicit entry point with name "${workerName}"...`);
        const entryPoint = isWindows 
          ? './functions/\\[\\[path\\]\\].ts' 
          : './functions/[[path]].ts';
        return await execAsync(`npx wrangler deploy ${entryPoint} --config wrangler.toml --name ${workerName}`);
      },
      
      // Method 2: Let wrangler figure out the entry point based on wrangler.toml
      async () => {
        console.log('🚀 Trying deployment method 2: Using wrangler.toml configuration...');
        return await execAsync('npx wrangler deploy --config wrangler.toml');
      },
      
      // Method 3: Just deploy the worker without specifying entry point or name
      async () => {
        console.log('🚀 Trying deployment method 3: Simple deploy...');
        return await execAsync('npx wrangler deploy');
      },
      
      // Method 4: Try Pages deployment instead
      async () => {
        console.log('🚀 Trying deployment method 4: Cloudflare Pages deployment...');
        return await execAsync('npx wrangler pages deploy build/client --project-name nexusai');
      }
    ];
    
    let deploymentSucceeded = false;
    let lastError = null;
    
    for (let i = 0; i < deploymentMethods.length; i++) {
      try {
        const result = await deploymentMethods[i]();
        console.log(`✅ Deployment method ${i+1} succeeded!`);
        console.log(result.stdout);
        
        if (result.stderr) {
          console.warn('⚠️ Stderr output:');
          console.warn(result.stderr);
        }
        
        deploymentSucceeded = true;
        break;
      } catch (error) {
        console.error(`❌ Deployment method ${i+1} failed:`, error.message);
        lastError = error;
      }
    }
    
    if (deploymentSucceeded) {
      console.log('🎉 Cloudflare deployment completed successfully!');
    } else {
      console.error('❌ All deployment methods failed.');
      if (lastError) {
        console.error('Last error:', lastError.message);
        
        // Provide helpful error analysis for the last error
        if (lastError.message.includes('Missing entry-point')) {
          console.error('The error is related to the entry point configuration.');
          console.error('Please check that the path to the function file is correct in both wrangler.toml and the deploy command.');
        } else if (lastError.message.includes('provide a name')) {
          console.error('The error is related to the Worker name not being specified.');
          console.error('Please make sure the name is set in wrangler.toml or passed as --name parameter.');
        } else if (lastError.message.includes('must match the name of your Worker')) {
          console.error('The name in wrangler.toml does not match the name of your Worker.');
          console.error('Please update the name in wrangler.toml to match your Worker name.');
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