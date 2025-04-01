import * as build from '../build/server/index.js';
import { createRequestHandler } from '@vercel/remix';

// Load environment variables that would be available in Cloudflare
// but need to be explicitly set for Vercel
process.env.REMIX_DEV_ORIGIN = 'http://localhost:3000';

export default createRequestHandler({ build }); 