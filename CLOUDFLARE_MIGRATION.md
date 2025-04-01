# Migrating from Vercel to Cloudflare Pages

This document outlines the process and considerations for migrating the bolt.diy application from Vercel to Cloudflare Pages.

## Why Cloudflare Pages?

- **Built-in Integration**: The codebase already uses Remix with Cloudflare adapter
- **Edge Functions**: Similar to Vercel's Edge Functions but with better integration with Cloudflare Workers
- **Global CDN**: Cloudflare's extensive CDN network provides low-latency access worldwide
- **Free Tier**: Generous free tier with competitive pricing for higher usage
- **DDoS Protection**: Built-in protection against distributed denial-of-service attacks

## Migration Steps

### 1. Configuration Changes

The project has been updated with the following changes:
- Enhanced `wrangler.toml` configuration
- Updated deployment documentation in `CONTRIBUTING.md`
- Removed Vercel-specific references in documentation

### 2. Deployment Process

#### One-Time Setup

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Initial Deployment**:
   ```bash
   pnpm run deploy
   ```

4. **Configure Environment Variables**:
   After the first deployment, set up your environment variables in the Cloudflare Dashboard:
   - Go to Cloudflare Dashboard → Pages → Your Project → Settings → Environment Variables
   - Add all required API keys and configurations from your `.env.local` file

#### Ongoing Deployments

For subsequent deployments, simply run:
```bash
pnpm run deploy
```

### 3. Environment Variables

Cloudflare Pages handles environment variables differently than Vercel:

1. **Production Variables**: Set in the Cloudflare Dashboard
2. **Development Variables**: Can be set in `.dev.vars` file or through the Wrangler CLI

### 4. Custom Domains

To set up custom domains:
1. Go to Cloudflare Dashboard → Pages → Your Project → Custom Domains
2. Add your domain and follow the verification steps
3. Update DNS settings as instructed

### 5. Monitoring and Logs

Access logs and monitor your application:
1. Cloudflare Dashboard → Pages → Your Project → Logs
2. For more detailed monitoring, consider integrating with Cloudflare Analytics

## Potential Issues and Solutions

1. **Environment Variable Limitations**:
   - Cloudflare Pages has a limit on the size and number of environment variables
   - Solution: For large configurations, consider using KV storage

2. **Build Command Differences**:
   - The build process in Cloudflare Pages might differ slightly from Vercel
   - Solution: The `wrangler.toml` file has been updated to address this

3. **Cold Start Times**:
   - Edge functions might have different cold start characteristics
   - Solution: Implement appropriate caching strategies

## Support Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Remix on Cloudflare Guide](https://remix.run/docs/en/main/guides/deployment/cloudflare-pages)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/) 