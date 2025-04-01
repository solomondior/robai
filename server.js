/**
 * Vercel server adapter for Remix
 */

// Patch the module system to handle CommonJS/ESM incompatibilities
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Patch React DOM Server specifically
globalThis.ReactDOMServer = require('react-dom/server');
if (!globalThis.ReactDOMServer.renderToReadableStream) {
  // For React 18+
  try {
    const ReactDOMServerBrowser = require('react-dom/server.browser');
    if (ReactDOMServerBrowser.renderToReadableStream) {
      globalThis.ReactDOMServer.renderToReadableStream = ReactDOMServerBrowser.renderToReadableStream;
    }
  } catch (e) {
    console.warn('Could not load react-dom/server.browser', e);
  }
}

import * as build from './build/server/index.js';
import { createRequestHandler } from '@vercel/remix';

// Polyfill for missing Cloudflare features
globalThis.__REMIX_DEV_ORIGIN = 'https://localhost:3000';

// Polyfill Cloudflare's caches API
if (!globalThis.caches) {
  globalThis.caches = {
    default: {
      match: () => Promise.resolve(null),
      put: () => Promise.resolve(),
    },
    open: () => Promise.resolve({
      match: () => Promise.resolve(null),
      put: () => Promise.resolve(),
    }),
  };
}

// Simple KV store polyfill if used 
const memoryKV = new Map();
const kvPolyfill = {
  get: async (key) => memoryKV.get(key) || null,
  put: async (key, value) => memoryKV.set(key, value),
  delete: async (key) => memoryKV.delete(key),
  list: async () => ({ keys: Array.from(memoryKV.keys()).map(name => ({ name })) }),
};

// Load all environment variables from .env if needed
import 'dotenv/config';

export default createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext(req, res) {
    return {
      // Provide a compatibility layer for Cloudflare-specific code
      cloudflare: {
        env: {},  // Empty since we're using client-side keys
        // Add any KV namespaces your app might be expecting
        SESSIONS: kvPolyfill,
        USER_DATA: kvPolyfill,
      },
    };
  },
}); 