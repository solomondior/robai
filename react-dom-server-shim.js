/**
 * This is a shim to handle incompatibilities between ESM and CommonJS for react-dom/server
 * It ensures that all necessary exports, especially renderToReadableStream, are properly available.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// First try patching the global object if it's not already patched
if (typeof globalThis !== 'undefined' && !globalThis.ReactDOMServer) {
  // Set up a global to use in case other files need it
  globalThis.ReactDOMServer = require('react-dom/server');
}

// Load the CommonJS module
const reactDomServer = require('react-dom/server');
console.log('[react-dom-server-shim] Loaded react-dom/server with exports:', Object.keys(reactDomServer));

// Function to get additional exports from server.browser
function loadServerBrowser() {
  try {
    const reactDomServerBrowser = require('react-dom/server.browser');
    console.log('[react-dom-server-shim] Loaded react-dom/server.browser with exports:', Object.keys(reactDomServerBrowser));
    return reactDomServerBrowser;
  } catch (e) {
    console.warn('[react-dom-server-shim] Could not load react-dom/server.browser:', e.message);
    return null;
  }
}

// For React 18+, we need to get renderToReadableStream from server.browser in some environments
const serverBrowser = loadServerBrowser();

// Create a combined object with all exports available
const combinedExports = {
  ...reactDomServer,
  ...(serverBrowser || {})
};

// Ensure renderToReadableStream is available from server.browser if it's not in the main module
if (!reactDomServer.renderToReadableStream && serverBrowser?.renderToReadableStream) {
  combinedExports.renderToReadableStream = serverBrowser.renderToReadableStream;
  
  // Also patch the global object
  if (typeof globalThis !== 'undefined' && globalThis.ReactDOMServer) {
    globalThis.ReactDOMServer.renderToReadableStream = serverBrowser.renderToReadableStream;
  }
  
  console.log('[react-dom-server-shim] Successfully patched renderToReadableStream from server.browser');
}

// Additional fallback for renderToReadableStream if everything else fails
if (!combinedExports.renderToReadableStream) {
  console.warn('[react-dom-server-shim] renderToReadableStream is STILL missing, creating a fallback implementation');
  
  // Implement a minimal version that won't crash but will show an error
  combinedExports.renderToReadableStream = function fallbackRenderToReadableStream(element, options) {
    console.error('Using fallback renderToReadableStream - SSR will not work properly!');
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('<div>Error: renderToReadableStream not available</div>'));
        controller.close();
      }
    });
    
    // Add the allReady property expected by Remix
    Object.defineProperty(readable, 'allReady', {
      value: Promise.resolve()
    });
    
    return readable;
  };
  
  // Patch global object with our fallback
  if (typeof globalThis !== 'undefined' && globalThis.ReactDOMServer) {
    globalThis.ReactDOMServer.renderToReadableStream = combinedExports.renderToReadableStream;
  }
}

// Create explicit named exports
export const {
  renderToString,
  renderToStaticMarkup,
  renderToNodeStream,
  renderToStaticNodeStream,
  renderToPipeableStream,
  renderToReadableStream,
  version
} = combinedExports;

// Also export the patched default
export default combinedExports; 