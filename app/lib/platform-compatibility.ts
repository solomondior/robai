/**
 * Platform compatibility layer for Cloudflare and Vercel
 */

// Detect which platform we're running on
export function getPlatform() {
  if (typeof process !== 'undefined' && process.env.VERCEL) {
    return 'vercel';
  }
  
  if (typeof globalThis.caches !== 'undefined') {
    return 'cloudflare';
  }
  
  return 'unknown';
}

// Since the app uses client-side API keys, this function serves mainly
// as a compatibility layer for any code that might try to access
// environment variables directly
export function getEnvVar(name: string, context?: any): string | undefined {
  // For client-side API keys, we don't expect to find them in env variables
  return undefined;
}

// Polyfill for any Cloudflare-specific API calls
export const cloudflareCompat = {
  // KV namespace operations
  getKVValue: async (namespace: string, key: string, context?: any): Promise<any> => {
    if (context?.cloudflare?.[namespace]) {
      return await context.cloudflare[namespace].get(key);
    }
    return null;
  },
  
  setKVValue: async (namespace: string, key: string, value: any, context?: any): Promise<void> => {
    if (context?.cloudflare?.[namespace]) {
      await context.cloudflare[namespace].put(key, value);
    }
  },
  
  // Add other Cloudflare-specific APIs as needed
} 