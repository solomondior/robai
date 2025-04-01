import * as build from '../build/server/index.js';
import { createRequestHandler } from '@vercel/remix';

export default createRequestHandler({ build }); 