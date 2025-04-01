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

console.log('Starting build patches for Vercel compatibility...');
console.log(`Looking for server index at: ${serverIndexPath}`);

// Only run if the file exists
if (fs.existsSync(serverIndexPath)) {
  console.log('Patching server index file for Vercel compatibility...');
  
  try {
    let serverIndex = fs.readFileSync(serverIndexPath, 'utf8');
    let originalIndex = serverIndex;  // Save original for comparison
    
    console.log('Replacing react-dom/server imports with our shim...');
    
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
    
    // Additional patch: ensure global patching code runs first
    if (!serverIndex.includes('globalThis.ReactDOMServer')) {
      const patchPosition = serverIndex.indexOf('import');
      if (patchPosition !== -1) {
        const globalPatch = `
// Ensure React DOM Server is properly patched at the global level
import { createRequire } from 'module';
const _require = createRequire(import.meta.url);

// Patch React DOM Server globally before any imports that might use it
if (!globalThis.ReactDOMServer) {
  globalThis.ReactDOMServer = _require('react-dom/server');
  if (!globalThis.ReactDOMServer.renderToReadableStream) {
    try {
      const ReactDOMServerBrowser = _require('react-dom/server.browser');
      if (ReactDOMServerBrowser && ReactDOMServerBrowser.renderToReadableStream) {
        globalThis.ReactDOMServer.renderToReadableStream = ReactDOMServerBrowser.renderToReadableStream;
      }
    } catch (e) {
      console.warn('Could not load react-dom/server.browser', e);
    }
  }
}

`;
        serverIndex = globalPatch + serverIndex;
      }
    }
    
    // Only write if changes were made
    if (serverIndex !== originalIndex) {
      fs.writeFileSync(serverIndexPath, serverIndex, 'utf8');
      console.log('Server index patched successfully!');
    } else {
      console.log('No changes needed for server index.');
    }
  } catch (error) {
    console.error('Error patching server index:', error);
  }
  
  // Create an additional hook file for Vercel
  try {
    const vercelPatchPath = path.resolve(__dirname, 'api', '_vercel-patch.js');
    console.log(`Creating additional patch file at: ${vercelPatchPath}`);
    const vercelPatchContent = `/**
 * This file is used by Vercel to patch React DOM Server
 * before any other imports
 */

// Patch the module system to handle CommonJS/ESM incompatibilities
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Set up React DOM Server properly before importing anything else
global.ReactDOMServer = require('react-dom/server');

// If renderToReadableStream is missing, try to get it from server.browser
if (!global.ReactDOMServer.renderToReadableStream) {
  try {
    const ReactDOMServerBrowser = require('react-dom/server.browser');
    if (ReactDOMServerBrowser && ReactDOMServerBrowser.renderToReadableStream) {
      global.ReactDOMServer.renderToReadableStream = ReactDOMServerBrowser.renderToReadableStream;
    }
  } catch (e) {
    console.error('Could not load react-dom/server.browser:', e);
  }
}

export default function patch() {
  console.log('React DOM Server patch applied successfully');
}
`;
    fs.writeFileSync(vercelPatchPath, vercelPatchContent, 'utf8');
    console.log('Created additional patch file for Vercel.');
  } catch (error) {
    console.error('Error creating additional patch file:', error);
  }
} else {
  console.log('Server index file not found, skipping patch.');
}

console.log('Build patching complete.'); 