import { removeLinksAroundImages, downloadAndReplaceImages } from './convert-images'
import downloadAndReplaceVideos from './convert-videos'
import addFaviconToLinks from './convert-links'
import { syntaxHighlightCodeWithTorchlight } from './convert-code'

export default async function prepareWordPressContent (post) {
  // The order matters here
  post.content = await removeLinksAroundImages(post.content)
  post.content = await downloadAndReplaceImages(post.content)
  post.content = await downloadAndReplaceVideos(post.content)
  post.content = await addFaviconToLinks(post.content)
  post.content = await syntaxHighlightCodeWithTorchlight(post.content)
  return post
}
