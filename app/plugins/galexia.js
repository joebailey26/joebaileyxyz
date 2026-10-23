// eslint-disable-next-line camelcase
import Galexia_NuxtComponent_Date from 'nuxt-component-date/index.vue'
// eslint-disable-next-line camelcase
import Galexia_NuxtComponent_Pagination from 'nuxt-component-pagination/index.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('GalexiaDate', Galexia_NuxtComponent_Date)
  nuxtApp.vueApp.component('GalexiaPagination', Galexia_NuxtComponent_Pagination)
})
