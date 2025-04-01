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

// Get the environment variables regardless of platform
export function getEnvVar(name: string, context?: any): string | undefined {
  // For Cloudflare
  if (context?.cloudflare?.env && context.cloudflare.env[name]) {
    return context.cloudflare.env[name];
  }
  
  // For Vercel and others
  if (typeof process !== 'undefined' && process.env[name]) {
    return process.env[name];
  }
  
  return undefined;
} 