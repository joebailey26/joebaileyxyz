import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const origin = 'https://joebailey.xyz'

export default function () {
  const routes = new Set()
  this.nuxt.hook('generate:routeCreated', ({ route }) => {
    if (!/^\/(?:404|200)\/?$/.test(route)) {
      routes.add(route.endsWith('/') ? route : `${route}/`)
    }
  })
  this.nuxt.hook('generate:done', async (generator) => {
    const body = [...routes].sort().map((route) => `  <url><loc>${origin}${route}</loc></url>`).join('\n')
    const dir = generator.distPath || generator.options.generate.dir
    await mkdir(dir, { recursive: true })
    await writeFile(path.join(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`)
  })
}
