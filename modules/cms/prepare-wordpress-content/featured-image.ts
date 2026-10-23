import { transformImageUrl } from './utils/image-transformations.ts'

// Featured images are only used for og:image, which needs an absolute URL; 1200px suits social cards.
const featuredImageWidth = 1200

export default function getFeaturedImageUrl (mediaId: unknown): string | null {
  if (!mediaId) {
    return null
  }
  // CMS records carry the absolute media URL (served from R2 by the CMS); anything else cannot be resolved.
  if (typeof mediaId !== 'string' || !/^https?:\/\//.test(mediaId)) {
    throw new Error(`Unsupported featured media reference: ${String(mediaId)}`)
  }

  return transformImageUrl(mediaId, featuredImageWidth, { origin: 'https://joebailey.xyz' })
}
