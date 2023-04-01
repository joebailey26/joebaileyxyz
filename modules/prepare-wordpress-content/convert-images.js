import { load } from 'cheerio'
import HandleExternalImage from './utils/handle-external-image'

export function removeLinksAroundImages (postContent) {
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

export async function downloadAndReplaceImages (postContent) {
  const regex = /<img.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  // add class to <figure> elements that contain an <img>
  $('figure:has(img)').addClass('wp-block-image')

  const promises = []
  // Loop through all images
  $('img').each((i, elem) => {
    // Get the attributes from the image
    const width = null
    const height = 300
    const alt = $(elem).attr('alt')
    // Work out the image url and path
    const externalImgUrl = $(elem).attr('src')
    const outputDirectory = 'wordpress'
    const handleExternalImage = new HandleExternalImage(externalImgUrl, outputDirectory, null, width, height, alt)

    promises.push(handleExternalImage.generatePictureElement().then((pictureElement) => $(elem).replaceWith(pictureElement)))
  })
  // Load all images
  await Promise.all(promises)
  // Return the blog post html
  return $.html()
}
