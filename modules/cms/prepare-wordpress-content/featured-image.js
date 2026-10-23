export default function getFeaturedImageUrl (mediaId) {
  if (!mediaId) {
    return null
  }
  // CMS records carry the absolute media URL (served from R2 by the CMS); anything else cannot be resolved.
  if (typeof mediaId !== 'string' || !/^https?:\/\//.test(mediaId)) {
    throw new Error(`Unsupported featured media reference: ${mediaId}`)
  }

  return mediaId
}
