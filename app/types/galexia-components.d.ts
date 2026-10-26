// The Galexia components ship as plain .vue files without types.
declare module 'nuxt-component-date/index.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{
    date: Date
    dayTextColor: string
    dayBackgroundColor: string
    monthYearTextColor: string
    monthYearBackgroundColor: string
  }>
  export default component
}

declare module 'nuxt-component-pagination/index.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{
    pageCount: number
    currentPage?: number
    goToPage: (page: number) => void
  }>
  export default component
}
