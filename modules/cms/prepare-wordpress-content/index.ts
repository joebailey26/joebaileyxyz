import type { Post } from '../../../shared/types/cms'
import { removeLinksAroundImages, prepareImages } from './convert-images.ts'
import prepareVideos from './convert-videos.ts'
import addFaviconToLinks from './convert-links.ts'
import syntaxHighlightCodeWithTorchlight from './convert-code.ts'
import getFeaturedImageUrl from './featured-image.ts'

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
