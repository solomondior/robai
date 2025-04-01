import * as build from './build/server/index.js';
import { createRequestHandler } from '@vercel/remix';

// Polyfill for missing Cloudflare features
globalThis.__REMIX_DEV_ORIGIN = 'https://localhost:3000';

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

// Load all environment variables from .env if needed
import 'dotenv/config';

export default createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext(req, res) {
    return {
      // Provide a compatibility layer for Cloudflare-specific code
      cloudflare: {
        env: process.env,
      },
    };
  },
}); 