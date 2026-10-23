export default defineNuxtConfig({
  compatibilityDate: '2026-10-22',
  // Shared with the CMS package's tests, so it stays in modules/, but it is not a Nuxt module.
  ignore: ['modules/cms-content.cjs']
})
