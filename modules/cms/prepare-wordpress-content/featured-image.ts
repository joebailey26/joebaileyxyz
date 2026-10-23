export default function getFeaturedImageUrl (mediaId: unknown): string | null {
  if (!mediaId) {
    return null
  }
  // CMS records carry the absolute media URL (served from R2 by the CMS); anything else cannot be resolved.
  if (typeof mediaId !== 'string' || !/^https?:\/\//.test(mediaId)) {
    throw new Error(`Unsupported featured media reference: ${String(mediaId)}`)
  }

  return mediaId
}
