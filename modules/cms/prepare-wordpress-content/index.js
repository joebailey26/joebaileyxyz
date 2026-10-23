import { removeLinksAroundImages, prepareImages } from './convert-images.js'
import prepareVideos from './convert-videos.js'
import addFaviconToLinks from './convert-links.js'
import syntaxHighlightCodeWithTorchlight from './convert-code.js'
import getFeaturedImageUrl from './featured-image.js'

export default async function prepareWordPressContent (post) {
  // The order matters here
  post.featured_media = getFeaturedImageUrl(post.featured_media)
  post.content = removeLinksAroundImages(post.content)
  post.content = prepareImages(post.content)
  post.content = prepareVideos(post.content)
  post.content = await addFaviconToLinks(post.content)
  post.content = await syntaxHighlightCodeWithTorchlight(post.content)

  return post
}
