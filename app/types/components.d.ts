// The Galexia packages ship their components as .vue files without usable type entries.
declare module 'nuxt-component-date/index.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}

declare module 'nuxt-component-pagination/index.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent
  export default component
}
