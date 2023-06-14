import path from 'path'
import fetch from 'node-fetch'
import HandleExternalImage from './utils/handle-external-image'

export default async function getFeaturedImageUrl (mediaId) {
  if (!mediaId) {
    return null
  }
  const media = await fetch(`${process.env.WP_API_URL}media/${mediaId}`,
    {
      headers: {
        Authorization:
        'Basic ' +
        Buffer.from(`${process.env.WP_USER}:${process.env.WP_PASS}`).toString(
          'base64'
        )
      }
    }
  ).then((response) => response.json())
  const localMedia = new HandleExternalImage(media.source_url, 'wordpress', null, 1200, 630)
  await localMedia.loadImage()
  return `/img/${localMedia.outputDirectory}/${path.basename(localMedia.fullOutputPath)}`
}
