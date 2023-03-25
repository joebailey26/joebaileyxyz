export const state = () => ({
  projects: [],
  blogPosts: []
})
export const actions = {
  nuxtServerInit ({ state }, context) {
    state.projects = context.ssrContext.$state.projects
    state.blogPosts = context.ssrContext.$state.blogPosts
  }
}
