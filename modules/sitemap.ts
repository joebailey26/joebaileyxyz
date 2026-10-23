import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'

const origin = 'https://joebailey.xyz'

// Writes sitemap.xml from the HTML pages that prerendering generated, with trailing slashes.
export default defineNuxtModule({
  meta: { name: 'sitemap' },
  setup (_options, nuxt) {
    nuxt.hook('nitro:init', (nitro) => {
      const routes = new Set<string>()
      nitro.hooks.hook('prerender:route', ({ route, error, contentType }) => {
        if (error || !contentType?.startsWith('text/html') || /^\/(?:404|200)(?:\.html|\/)?$/.test(route)) {
          return
        }
        routes.add(route.endsWith('/') ? route : `${route}/`)
      })
      nitro.hooks.hook('prerender:done', async () => {
        if (!routes.size) {
          return
        }
        const body = [...routes].sort().map((route) => `  <url><loc>${origin}${route}</loc></url>`).join('\n')
        const dir = nitro.options.output.publicDir
        await mkdir(dir, { recursive: true })
        await writeFile(path.join(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`)
      })
    })
  }
})
