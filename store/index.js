export const state = () => ({
  projects: [],
  blog: []
})
export const actions = {
  nuxtServerInit ({ state }, context) {
    state.projects = context.ssrContext.$state.projects
    state.blog = context.ssrContext.$state.blog
  }
}
