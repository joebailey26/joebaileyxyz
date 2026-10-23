import { addTypeTemplate, defineNuxtModule } from '@nuxt/kit'
import type { CmsContent } from '../../shared/types/cms'
import { loadCmsContent } from './load-content'

// Loads the CMS content once per build and hands it to the Nitro routes in server/routes/_content,
// which the pages read through useAsyncData. Prerendering stores the result in each page's payload.
export default defineNuxtModule({
  meta: { name: 'cms' },
  async setup (_options, nuxt) {
    // `nuxt prepare` (postinstall, typecheck) only generates types, so it needs no content or CMS credentials.
    const content: CmsContent = nuxt.options._prepare ? { blog: [[]], projects: [[]] } : await loadCmsContent()

    const routes: string[] = []
    for (let page = 2; page <= content.blog.length; page++) {
      routes.push(`/blog/page/${page}/`)
    }
    for (const section of ['blog', 'projects'] as const) {
      for (const post of content[section].flat()) {
        routes.push(`/${section}/${post.slug}/`)
      }
    }

    // The virtual module below only exists at build time, so its types are declared here.
    addTypeTemplate({
      filename: 'types/cms-content.d.ts',
      // Generated into .nuxt/types, two levels below the project root.
      getContents: () => `declare module '#cms-content' {
  const content: import('../../shared/types/cms').CmsContent

  export default content
}
`
    }, { nuxt: true, nitro: true })

    nuxt.hook('nitro:config', (config) => {
      config.virtual = { ...config.virtual, '#cms-content': `export default ${JSON.stringify(content)}` }
      config.prerender = { ...config.prerender, routes: [...(config.prerender?.routes || []), ...routes] }
    })
  }
})
