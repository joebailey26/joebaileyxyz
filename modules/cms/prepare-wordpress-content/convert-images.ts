import { load } from 'cheerio'
import { defaultImageWidth, imageSrcset, transformImageUrl } from './utils/image-transformations.ts'

// Post images fill the content column, which tops out at the 1140px container.
const imageSizes = '(min-width: 1200px) 1140px, 100vw'

export function removeLinksAroundImages (postContent: string): string {
  const regex = /<img.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  // Replace all links around images with just the image
  $('a').each((i, elem) => {
    if ($(elem).has('img').length) {
      $(elem).replaceWith($(elem).find('img'))
    }
  })

  // Return the blog post html
  return $.html()
}

// CMS media (R2) is resized through Cloudflare Image Transformations where enabled, and wrapped in the markup the post styles expect.
export function prepareImages (postContent: string): string {
  const regex = /<img.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  // add class to <figure> elements that contain an <img>
  $('figure:has(img)').addClass('wp-block-image')

  $('img').each((i, elem) => {
    const $img = $(elem)
    const img = $('<img>')
    const src = $img.attr('src')
    const srcset = imageSrcset(src, $img.attr('width'))
    if (src && srcset) {
      const intrinsicWidth = Number.parseInt($img.attr('width') ?? '', 10)
      img.attr('src', transformImageUrl(src, intrinsicWidth > 0 ? Math.min(defaultImageWidth, intrinsicWidth) : defaultImageWidth))
      img.attr('srcset', srcset)
      img.attr('sizes', imageSizes)
    } else {
      img.attr('src', src)
    }
    img.attr('decoding', 'async')
    img.attr('loading', 'lazy')
    img.attr('alt', $img.attr('alt') || '')
    for (const dimension of ['width', 'height']) {
      if ($img.attr(dimension)) {
        img.attr(dimension, $img.attr(dimension))
      }
    }
    $img.replaceWith($('<picture>').append(img))
  })

  // Return the blog post html
  return $.html()
}
