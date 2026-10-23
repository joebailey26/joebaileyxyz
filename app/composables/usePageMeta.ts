import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue, useHead, useSeoMeta } from '#imports'
import { fullTitle } from '~/utils/site'

interface PageMeta {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string | undefined>
  canonical?: string
  image?: MaybeRefOrGetter<string | undefined>
}

// The title, description, image and canonical URL tags that pages set. Values may be refs or getters.
export function usePageMeta ({ title, description, canonical, image }: PageMeta) {
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
