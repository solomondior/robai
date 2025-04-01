/**
 * Environment adapter that works in both Cloudflare and Vercel environments
 */

export function getEnvironment(context: any) {
  // For Cloudflare environment
  if (context?.cloudflare?.env) {
    return context.cloudflare.env;
  }
  
  // For Vercel environment, use process.env
  return process.env;
}

export function getEnvVariable(context: any, name: string): string | undefined {
  const env = getEnvironment(context);
  return env[name];
} 