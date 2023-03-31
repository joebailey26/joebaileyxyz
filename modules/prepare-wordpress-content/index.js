import downloadAndReplaceImages from './convert-images'
import downloadAndReplaceVideos from './convert-videos'

export default async function prepareWordPressContent (post) {
  post.content = await downloadAndReplaceImages(post.content)
  post.content = await downloadAndReplaceVideos(post.content)
  return post
}
