// Cloudflare Image Transformations (/cdn-cgi/image) for CMS media and the site's own images. Each width is a billed unique transformation, so keep this list short.
export const imageWidths = [480, 800, 1200, 1600]
export const defaultImageWidth = 800
const imageOptions = 'format=auto,quality=80,fit=scale-down'
// SVG and GIF are served as they are (vector, or possibly animated); ICO is not a supported input.
const untransformedExtensions = /\.(svg|gif|ico)$/i

// /cdn-cgi/image only exists on the production zone, not in `nuxt dev`, `wrangler dev` or workers.dev previews.
// IMAGE_TRANSFORMATIONS=true/false overrides; otherwise only the Workers Builds master build opts in.
export function imageTransformationsEnabled (env = process.env) {
  if (env.IMAGE_TRANSFORMATIONS) {
    return env.IMAGE_TRANSFORMATIONS === 'true'
  }

  return env.WORKERS_CI_BRANCH === 'master'
}

function cmsMediaHost (env) {
  try {
    return new URL(env.CMS_API_URL).host
  } catch {
    return 'cms.joebailey.xyz'
  }
}

export function isTransformableImage (src, env = process.env) {
  if (!src) {
    return false
  }
  // Root-relative paths are files in public/, on the same zone
  if (src.startsWith('/') && !src.startsWith('//')) {
    return !src.startsWith('/cdn-cgi/') && !untransformedExtensions.test(src.split(/[?#]/)[0])
  }
  let url
  try {
    url = new URL(src)
  } catch {
    return false
  }

  return url.host === cmsMediaHost(env) && !untransformedExtensions.test(url.pathname)
}

// Relative by default so it follows the host; pass an origin where an absolute URL is needed (og:image).
export function transformImageUrl (src, width, { origin = '', env = process.env } = {}) {
  if (!imageTransformationsEnabled(env) || !isTransformableImage(src, env)) {
    return src
  }

  return cdnImageUrl(src, width, origin)
}

// Builds the URL without checking the source or the build, for callers that have already decided (the Vue pages).
export function cdnImageUrl (src, width, origin = '') {
  return `${origin}/cdn-cgi/image/${imageOptions},width=${width}/${src.replace(/^\//, '')}`
}

// Widths above the image's own width would only return the original, so cap them at it when it is known.
export function imageSrcset (src, intrinsicWidth, { env = process.env } = {}) {
  if (!imageTransformationsEnabled(env) || !isTransformableImage(src, env)) {
    return null
  }
  const maxWidth = Number.parseInt(intrinsicWidth, 10)
  const widths = maxWidth > 0 && maxWidth < imageWidths.at(-1) ? [...imageWidths.filter((width) => width < maxWidth), maxWidth] : imageWidths

  return widths.map((width) => `${transformImageUrl(src, width, { env })} ${width}w`).join(', ')
}
