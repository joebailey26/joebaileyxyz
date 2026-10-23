// The title, description, image and canonical URL tags that pages set. Values may be refs or getters.
export function usePageMeta ({ title, description, canonical, image }) {
  const pageTitle = computed(() => fullTitle(toValue(title)))
  useHead({
    title,
    link: canonical ? [{ rel: 'canonical', href: canonical }] : []
  })
  useSeoMeta({
    ogTitle: pageTitle,
    twitterTitle: pageTitle,
    description,
    ogDescription: description,
    twitterDescription: description,
    ogImage: image
  })
}
