/**
 * Vercel API handler for Remix
 */

// Import our patch first to ensure React DOM Server is correctly set up
import './_vercel-patch.js';

// Now import our server build after ReactDOMServer is patched globally
import * as build from '../build/server/index.js';
import { createRequestHandler } from '@vercel/remix';

// Set default environment variables
process.env.REMIX_DEV_ORIGIN = 'https://localhost:3000';

// Create a handler with proper error handling
export default function handler(request, context) {
  try {
    return createRequestHandler({
      build,
      mode: 'production',
      getLoadContext(req, context) {
        return {
          // Provide a compatibility layer for Cloudflare-specific code
          cloudflare: {
            env: {},
            // Add any KV namespaces your app might be expecting
            SESSIONS: {
              get: async () => null,
              put: async () => {},
              delete: async () => {},
              list: async () => ({ keys: [] }),
            },
            USER_DATA: {
              get: async () => null,
              put: async () => {},
              delete: async () => {},
              list: async () => ({ keys: [] }),
            },
          },
        };
      },
    })(request, context);
  } catch (error) {
    console.error('Remix handler error:', error);
    return new Response('Server Error', { status: 500 });
  }
} 