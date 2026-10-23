export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const post = getSection(event).flat().find((item) => item.slug === slug)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return post
})
