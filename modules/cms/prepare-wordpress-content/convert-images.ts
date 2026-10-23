import { load } from 'cheerio'

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

// Images stay on the CMS media URLs (R2). They are only wrapped in the markup the post styles expect.
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
    img.attr('src', $img.attr('src'))
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
