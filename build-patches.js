/**
 * This script applies patches to the built files to ensure compatibility 
 * with Vercel's serverless environment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverIndexPath = path.resolve(__dirname, 'build', 'server', 'index.js');

// Only run if the file exists
if (fs.existsSync(serverIndexPath)) {
  console.log('Patching server index file for Vercel compatibility...');
  
  let serverIndex = fs.readFileSync(serverIndexPath, 'utf8');
  
  // Replace any direct imports from react-dom/server with our shim
  serverIndex = serverIndex.replace(
    /import\s+?{\s*?(\w+(?:\s*?,\s*?\w+)*?)\s*?}\s+?from\s+?['"]react-dom\/server['"];?/g,
    `import { $1 } from '../../react-dom-server-shim.js';`
  );
  
  // Replace dynamic imports too
  serverIndex = serverIndex.replace(
    /import\(['"]react-dom\/server['"]\)/g,
    `import('../../react-dom-server-shim.js')`
  );
  
  fs.writeFileSync(serverIndexPath, serverIndex, 'utf8');
  console.log('Server index patched successfully!');
} else {
  console.log('Server index file not found, skipping patch.');
} 