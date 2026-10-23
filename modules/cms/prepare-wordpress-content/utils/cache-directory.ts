import { fileURLToPath } from 'node:url'

// Cloudflare Workers Builds only preserves node_modules/.cache/nuxt between builds for Nuxt projects,
// so anything that should survive a build lives under it.
export const cacheDirectory = fileURLToPath(new URL('../../../../node_modules/.cache/nuxt/cms/', import.meta.url))
