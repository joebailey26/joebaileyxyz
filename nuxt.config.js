export default {
  target: 'static',
  components: true,
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s | Joe Bailey | Software Engineer | Cambridge, UK',
    htmlAttrs: {
      lang: 'en-GB'
    },
    meta: [
      { name: 'viewport', content: 'width=device-width,initial-scale=1' },
      { name: 'description', content: 'I deliver great websites, applications, and experiences. I’m passionate about a privacy-first internet where everyone can feel safe. By reducing page load times, not only do we improve user experience, but we also reduce our carbon footprint.' },
      { name: 'application-name', content: 'Joe Bailey' },
      { name: 'theme-color', content: '#282828' },
      { name: 'msapplication-TileColor', content: '#004c3f' },
      { name: 'msapplication-TileImage', content: 'https://joebailey.xyz/mstile-150x150.png' },

      // Twitter Card data
      { hid: 'twitter:title', name: 'twitter:title', template: (chunk) => `${chunk} | Joe Bailey | Software Engineer | Cambridge, UK` },
      { hid: 'twitter:description', name: 'twitter:description' },

      // Open Graph data
      { hid: 'og:title', property: 'og:title', template: (chunk) => `${chunk} | Joe Bailey | Software Engineer | Cambridge, UK` },
      { hid: 'og:description', property: 'og:description' },
      { property: 'og:type', content: 'website' }
    ],
    link: [
      { hid: 'canonical', rel: 'canonical', href: 'https://joebailey.xyz/' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://joebailey.xyz/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://joebailey.xyz/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://joebailey.xyz/favicon-16x16.png' },
      { rel: 'mask-icon', href: 'https://joebailey.xyz/safari-pinned-tab.svg', color: '#004c3f' }
    ],
    __dangerouslyDisableSanitizers: ['script', 'noscript'],
    noscript: [
      { innerHTML: '<img src="https://analytics.galexia.agency/matomo.php?idsite=2&amp;rec=1" style="border:0;" alt="" />' }
    ],
    script: [
      {
        src: '/js/scrollbar-width.js',
        body: true
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
  },
  /*
   ** Customize the progress-bar color
   */
  loading: false,
  /*
   ** Global CSS
   */
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
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~plugins/fontAwesome',
    '~plugins/galexia/components/image.js',
    '~plugins/galexia/components/share.js',
    '~plugins/mixins/copyToClipboard'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    '@nuxt/typescript-build'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '~/modules/only-once.js',
    '@aceforth/nuxt-optimized-images',
    '@nuxtjs/sentry'
  ],
  optimizedImages: {
    optimizeImages: true,
    optimizeImagesInDev: true
  },
  sentry: {
    lazy: true,
    tracing: {
      tracesSampleRate: 0.1,
      vueOptions: {
        trackComponents: true
      },
      clientIntegrations: {
        Replay: {}
      },
      clientConfig: {
        // This sets the sample rate to be 10%. You may want this to be 100% while
        // in development and sample at a lower rate in production
        replaysSessionSampleRate: 0.1,
        // If the entire session is not sampled, use the below sample rate to sample
        // sessions when an error occurs.
        replaysOnErrorSampleRate: 1.0
      }
    }
  },
  generate: {
    fallback: true
  },
  router: {
    trailingSlash: true,
    extendRoutes (routes, resolve) {
      routes.push({
        path: '/blog/page/:page',
        component: resolve(__dirname, 'pages/blog/index.vue')
      })
      routes.push({
        path: '/projects/page/:page',
        component: resolve(__dirname, 'pages/projects/index.vue')
      })
    }
  },
  extensions: ['ts', 'tsx', 'js'],
  /*
   ** Build configuration
   */
  build: {
    html: {
      minify: {
        collapseBooleanAttributes: true,
        decodeEntities: true,
        minifyCSS: false,
        minifyJS: false,
        processConditionalComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        trimCustomFragments: true,
        useShortDoctype: true
      }
    },
    babel: {
      presets ({ isClient }, preset) {
        if (isClient) {
          // https://babeljs.io/docs/en/babel-preset-env
          preset[1].targets = {
            chrome: '58'
          }
        }
        return [preset]
      }
    }
  }
}
