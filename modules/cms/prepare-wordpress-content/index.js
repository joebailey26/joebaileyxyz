import { removeLinksAroundImages, downloadAndReplaceImages } from './convert-images'
import downloadAndReplaceVideos from './convert-videos'
import addFaviconToLinks from './convert-links'
import syntaxHighlightCodeWithTorchlight from './convert-code'
import getFeaturedImageUrl from './featured-image'

export default async function prepareWordPressContent (post) {
  // The order matters here
  post.featured_media = await getFeaturedImageUrl(post.featured_media)
  post.content = await removeLinksAroundImages(post.content)
  post.content = await downloadAndReplaceImages(post.content)
  post.content = await downloadAndReplaceVideos(post.content)
  post.content = await addFaviconToLinks(post.content)
  post.content = await syntaxHighlightCodeWithTorchlight(post.content)
  return post
}
