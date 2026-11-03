// eslint-disable-next-line camelcase
import Galexia_NuxtComponent_Date from 'nuxt-component-date/index.vue'
// eslint-disable-next-line camelcase
import Galexia_NuxtComponent_Pagination from 'nuxt-component-pagination/index.vue'
import { defineNuxtPlugin } from '#imports'

// Types the globally registered components in templates.
/* eslint-disable @typescript-eslint/naming-convention, camelcase -- component names */
declare module 'vue' {
  interface GlobalComponents {
    GalexiaDate: typeof Galexia_NuxtComponent_Date
    GalexiaPagination: typeof Galexia_NuxtComponent_Pagination
  }
}
/* eslint-enable @typescript-eslint/naming-convention, camelcase */

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('GalexiaDate', Galexia_NuxtComponent_Date)
  nuxtApp.vueApp.component('GalexiaPagination', Galexia_NuxtComponent_Pagination)
})
