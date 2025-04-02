// Cross-platform deployment helper for Cloudflare
// This handles deploying a Remix app to Cloudflare

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);
const isWindows = platform() === 'win32';

async function run() {
  console.log('📦 Starting Cloudflare deployment process...');
  
  try {
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

    console.log('🚀 Deploying to Cloudflare...');
    try {
      // Use the explicit path to the entry point
      // On Windows, escape the square brackets
      const entryPoint = isWindows 
        ? './functions/\\[\\[path\\]\\].ts' 
        : './functions/[[path]].ts';
        
      const result = await execAsync(`npx wrangler deploy ${entryPoint} --config wrangler.toml --name nexusai`);
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
      }
      
      process.exit(1);
    }
  } catch (generalError) {
    console.error('❌ Unexpected error:', generalError.message);
    process.exit(1);
  }
}

run(); 