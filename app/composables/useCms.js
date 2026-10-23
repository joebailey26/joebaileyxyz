import { createError, useAsyncData } from '#imports'

// CMS content is loaded at build time by modules/cms and served by server/routes/_content.
// Prerendering stores each result in the page payload, so the static site never calls those routes.

const withDate = (post) => ({ ...post, date: new Date(post.date) })

// The paginated post summaries of a section ('blog' or 'projects').
export function useCmsIndex (section) {
  return useAsyncData(`cms-${section}`, () => $fetch(`/_content/${section}`), {
    transform: (pages) => pages.map((page) => page.map(withDate)),
    default: () => []
  })
}

// A single post, or a fatal 404 when the section has no post with that slug.
export async function useCmsPost (section, slug) {
  const { data, error } = await useAsyncData(`cms-${section}-${slug}`, () => $fetch(`/_content/${section}/${encodeURIComponent(slug)}`), {
    transform: withDate
  })
  if (error.value || !data.value) {
    throw createError({ status: 404, message: section === 'blog' ? 'Post not found' : 'Project not found', fatal: true })
  }

  return data
}
