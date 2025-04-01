/**
 * This is a shim to handle incompatibilities between ESM and CommonJS for react-dom/server
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load the CommonJS module
const reactDomServer = require('react-dom/server');

// For React 18+, we need to get renderToReadableStream from server.browser in some environments
if (!reactDomServer.renderToReadableStream) {
  try {
    const reactDomServerBrowser = require('react-dom/server.browser');
    if (reactDomServerBrowser && reactDomServerBrowser.renderToReadableStream) {
      reactDomServer.renderToReadableStream = reactDomServerBrowser.renderToReadableStream;
    }
  } catch (e) {
    console.warn('Could not load react-dom/server.browser', e);
  }
}

// Export everything as named exports for ESM compatibility
export const {
  renderToString,
  renderToStaticMarkup,
  renderToNodeStream,
  renderToStaticNodeStream,
  renderToPipeableStream,
  renderToReadableStream,
  version
} = reactDomServer;

// Also export the default
export default reactDomServer; 