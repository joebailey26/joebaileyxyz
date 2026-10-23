import type { Post } from '../../../shared/types/cms'
import { removeLinksAroundImages, prepareImages } from './convert-images'
import prepareVideos from './convert-videos'
import addFaviconToLinks from './convert-links'
import syntaxHighlightCodeWithTorchlight from './convert-code'
import getFeaturedImageUrl from './featured-image'

// A post whose content and featured media still have to be prepared.
export type UnpreparedPost = Omit<Post, 'featuredMedia'> & { featuredMedia: unknown }

export default async function prepareWordPressContent (post: UnpreparedPost): Promise<Post> {
  // The order matters here
  const featuredMedia = getFeaturedImageUrl(post.featuredMedia)
  let content = removeLinksAroundImages(post.content)
  content = prepareImages(content)
  content = prepareVideos(content)
  content = await addFaviconToLinks(content)
  content = await syntaxHighlightCodeWithTorchlight(content)

  return { ...post, featuredMedia, content }
}
