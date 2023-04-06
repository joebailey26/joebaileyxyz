export default {
  target: 'static',
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: '%s | Joe Bailey | Front-End Web Developer | Cambridge, UK',
    htmlAttrs: {
      lang: 'en-GB'
    },
    meta: [
      { name: 'viewport', content: 'width=device-width,initial-scale=1' },
      { name: 'description', content: 'I deliver great websites, applications, and experiences. I’m passionate about a privacy-first internet where everyone can feel safe. I code in VueJS and like to keep things front-end, utilising Netlify wherever possible. I have a thorough understanding of PHP to call on when working with WordPress sites.' },
      { name: 'application-name', content: 'Joe Bailey' },
      { name: 'theme-color', content: '#282828' },
      { name: 'msapplication-TileColor', content: '#004c3f' },
      { name: 'msapplication-TileImage', content: 'https://joebailey.xyz/mstile-150x150.png' },

      // Twitter Card data
      { hid: 'twitter:title', name: 'twitter:title', template: (chunk) => `${chunk} | Joe Bailey | Front-End Web Developer | Cambridge, UK` },
      { hid: 'twitter:description', name: 'twitter:description' },
      { name: 'twitter:creator', content: '@JoeBailey26' },

      // Open Graph data
      { hid: 'og:title', property: 'og:title', template: (chunk) => `${chunk} | Joe Bailey | Front-End Web Developer | Cambridge, UK` },
      { hid: 'og:description', property: 'og:description' },
      { property: 'og:type', content: 'website' }
    ],
    link: [
      { hid: 'canonical', rel: 'canonical', href: 'https://joebailey.xyz/' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://joebailey.xyz/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://joebailey.xyz/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://joebailey.xyz/favicon-16x16.png' },
      { rel: 'mask-icon', href: 'https://joebailey.xyz/safari-pinned-tab.svg', color: '#004c3f' },
      // Fonts
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Rammetto+One&family=Roboto+Slab:wght@400;600;700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=block' },
      { rel: 'stylesheet', media: 'print', onload: 'this.media="all"', href: 'https://fonts.googleapis.com/css2?family=Rammetto+One&family=Roboto+Slab:wght@400;600;700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=block' }
    ],
    __dangerouslyDisableSanitizers: ['script', 'noscript'],
    noscript: [
      { innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rammetto+One&family=Roboto+Slab:wght@400;600;700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=block" />' },
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
    '~/assets/scss/style.scss'
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~plugins/fontAwesome',
    '~plugins/galexiaImage'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '~/modules/only-once.js',
    '@aceforth/nuxt-optimized-images'
  ],
  optimizedImages: {
    optimizeImages: true,
    optimizeImagesInDev: true,
    mozjpeg: {
      quality: 70
    },
    pngquant: {
      stripe: true
    },
    webp: {
      quality: 70
    },
    svgo: {
      plugins: [
        { reusePaths: true },
        { removeOffCanvasPaths: true },
        { removeScriptElement: true }
      ]
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
    }
  }
}
