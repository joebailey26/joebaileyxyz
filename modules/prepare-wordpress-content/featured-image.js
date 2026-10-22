import path from 'path'
import fetch from 'node-fetch'
import HandleExternalImage from './utils/handle-external-image'

export default async function getFeaturedImageUrl (mediaId) {
  if (!mediaId) {
    return null
  }
  let sourceUrl = typeof mediaId === 'string' && /^https?:\/\//.test(mediaId) ? mediaId : null
  if (!sourceUrl) {
    const media = await fetch(`${process.env.WP_API_URL}media/${mediaId}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_PASS}`).toString('base64')}`
        }
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`WordPress media request failed: HTTP ${response.status}`)
      }
      return response.json()
    })
    sourceUrl = media.source_url
  }
  const localMedia = new HandleExternalImage(sourceUrl, 'wordpress', null, 1200, 630)
  await localMedia.loadImage()
  return `/img/${localMedia.outputDirectory}/${path.basename(localMedia.fullOutputPath)}`
}
