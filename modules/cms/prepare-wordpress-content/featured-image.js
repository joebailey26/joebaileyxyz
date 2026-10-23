import path from 'path'
import HandleExternalImage from './utils/handle-external-image'

export default async function getFeaturedImageUrl (mediaId) {
  if (!mediaId) {
    return null
  }
  // CMS records carry the absolute media URL; anything else cannot be resolved.
  if (typeof mediaId !== 'string' || !/^https?:\/\//.test(mediaId)) {
    throw new Error(`Unsupported featured media reference: ${mediaId}`)
  }
  const sourceUrl = mediaId
  const localMedia = new HandleExternalImage(sourceUrl, 'wordpress', null, 1200, 630)
  await localMedia.loadImage()
  return `/img/${localMedia.outputDirectory}/${path.basename(localMedia.fullOutputPath)}`
}
