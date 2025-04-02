// Cross-platform deployment helper for Cloudflare Pages
// This handles deploying a Remix app to Cloudflare Pages

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function run() {
  console.log('📦 Starting Cloudflare Pages deployment process...');
  
  try {
    console.log('🚀 Deploying to Cloudflare Pages...');
    try {
      // Use the explicit path to the build output
      const result = await execAsync('npx wrangler pages deploy build/client --production');
      console.log('✅ Deployment output:');
      console.log(result.stdout);
      
      if (result.stderr) {
        console.warn('⚠️ Stderr output:');
        console.warn(result.stderr);
      }
      
      console.log('🎉 Cloudflare Pages deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      
      // Provide helpful error analysis
      if (error.message.includes('name in your wrangler.toml')) {
        console.error('The error is related to worker name configuration. This is a Pages project, not a Worker.');
        console.error('Please make sure you have removed any Worker-specific configurations from wrangler.toml');
      }
      
      process.exit(1);
    }
  } catch (generalError) {
    console.error('❌ Unexpected error:', generalError.message);
    process.exit(1);
  }
}

run(); 