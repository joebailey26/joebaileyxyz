import { fileURLToPath } from 'node:url'
import { titleSuffix } from './app/utils/site'
import { imageTransformationsEnabled } from './modules/cms/prepare-wordpress-content/utils/image-transformations.ts'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-22',
  // Shared with the CMS package's tests, so it stays in modules/, but it is not a Nuxt module.
  // Everything else in modules/ (cms/, sitemap.ts) is registered automatically.
  ignore: ['modules/cms-content.cjs', 'modules/cms-content.d.cts'],
  runtimeConfig: {
    public: {
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '',
      // Decided at build time, like the CMS content, because /cdn-cgi/image only exists on the production zone.
      imageTransformations: imageTransformationsEnabled()
    }
  },
  app: {
    head: {
      titleTemplate: `%s | ${titleSuffix}`,
      htmlAttrs: {
        lang: 'en-GB'
      },
      meta: [
        { name: 'description', content: 'I deliver great websites, applications, and experiences. I’m passionate about a privacy-first internet where everyone can feel safe. By reducing page load times, not only do we improve user experience, but we also reduce our carbon footprint.' },
        { name: 'application-name', content: 'Joe Bailey' },
        { name: 'theme-color', content: '#282828' },
        { name: 'msapplication-TileColor', content: '#004c3f' },
        { name: 'msapplication-TileImage', content: 'https://joebailey.xyz/mstile-150x150.png' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'canonical', href: 'https://joebailey.xyz/' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://joebailey.xyz/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://joebailey.xyz/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://joebailey.xyz/favicon-16x16.png' },
        { rel: 'mask-icon', href: 'https://joebailey.xyz/safari-pinned-tab.svg', color: '#004c3f' }
      ],
      noscript: [
        { innerHTML: '<img src="https://analytics.galexia.agency/matomo.php?idsite=2&amp;rec=1" style="border:0;" alt="" />' }
      ],
      script: [
        // Cloudflare Web Analytics
        {
          src: 'https://static.cloudflareinsights.com/beacon.min.js',
          defer: true,
          'data-cf-beacon': '{"token": "268be12f4eae49b18b94508272cb34e4"}'
        },
        // Apply the stored or preferred colour scheme before the page paints.
        {
          tagPosition: 'bodyOpen',
          innerHTML: `
            window.darkmode = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            if (window.localStorage.getItem('darkmode')) {
              window.darkmode = JSON.parse(window.localStorage.getItem('darkmode'))
            }
            if (window.darkmode) {
              document.body.classList.add('darkTheme')
            }`
        },
        {
          src: '/js/scrollbar-width.js',
          tagPosition: 'bodyClose'
        },
        {
          innerHTML: `
            var _paq = window._paq = window._paq || [];
            /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
            _paq.push(["setDoNotTrack", true]);
            _paq.push(["disableCookies"]);
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="https://analytics.galexia.agency/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '2']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })();`
        }
      ]
    }
  },
  css: [
    '@fontsource/rammetto-one/index.css',
    '@fontsource/recursive/index.css',
    '@fontsource/roboto-slab/400.css',
    '@fontsource/roboto-slab/700.css',
    '@fontsource/roboto/400.css',
    '@fontsource/roboto/700.css',
    '@fontsource/roboto/400-italic.css',
    '@fontsource/roboto/700-italic.css',
    '~/assets/scss/style.scss'
  ],
  build: {
    // Bundled into the server build so it shares the plugin's icon library instead of loading a second copy.
    transpile: ['@fortawesome/vue-fontawesome']
  },
  hooks: {
    'pages:extend' (pages) {
      // Paginated indexes reuse the index pages, which read the page number from the route.
      pages.push({
        name: 'blog-page',
        path: '/blog/page/:page',
        file: fileURLToPath(new URL('./app/pages/blog/index.vue', import.meta.url))
      })
      pages.push({
        name: 'projects-page',
        path: '/projects/page/:page',
        file: fileURLToPath(new URL('./app/pages/projects/index.vue', import.meta.url))
      })
    }
  },
  nitro: {
    // Cloudflare's build environment makes Nitro pick a Workers preset. The site is fully static,
    // and the worker lives in worker/, so always emit plain static output.
    preset: 'static',
    prerender: {
      // Content routes and blog pagination are added by modules/cms.
      crawlLinks: true,
      routes: ['/', '/cv/'],
      failOnError: true
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // The stylesheets still use @import for the shared mixins.
          silenceDeprecations: ['import']
        }
      }
    }
  }
})
