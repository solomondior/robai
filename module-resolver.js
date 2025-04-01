/**
 * This module resolver helps handle compatibility between CommonJS and ESM modules
 * in the Vercel environment.
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Register paths to our shims
const SHIMS = {
  'react-dom/server': resolve(__dirname, './react-dom-server-shim.js')
};

// This function can be used to dynamically import modules
// with handling for CommonJS modules
export async function importModule(moduleName) {
  if (SHIMS[moduleName]) {
    return import(SHIMS[moduleName]);
  }
  
  try {
    return await import(moduleName);
  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      const cjsModule = require(moduleName);
      return { default: cjsModule, ...cjsModule };
    }
    throw e;
  }
} 