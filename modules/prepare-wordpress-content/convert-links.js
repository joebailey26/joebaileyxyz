import { load } from 'cheerio'
import FetchFavicon from './utils/fetch-favicon'
import HandleExternalImage from './utils/handle-external-image'

export default async function addFaviconToLinks (postContent) {
  const regex = /<a.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  const promises = []
  // Loop through all links
  $('a').each((i, elem) => {
    // Work out the url
    const url = $(elem).attr('href')
    // If there's no URL, don't go any further
    if (!url) {
      return
    }
    const width = 16
    const height = 16
    const outputDirectory = 'favicons'
    const FaviconFetcher = new FetchFavicon(url)
    const parsedUrl = FaviconFetcher.isFullUrl(url)
    // If the URL is not a full URL, don't go any further
    if (!parsedUrl) {
      return
    }
    // Make sure the link uses HTTPS
    if (parsedUrl.protocol === 'http:') {
      parsedUrl.protocol = 'https:'
    }
    // Update the link to open in a new tab if it is an external one
    $(elem).attr('target', '_blank')
    // Set the alt tag to the domain
    const alt = parsedUrl.hostname + ' favicon'
    // Push into the promises to fetch the favicon
    promises.push(
      FaviconFetcher.getFavicon()
        .then((externalImgUrl) => {
          if (externalImgUrl) {
            const outputFileName = parsedUrl.hostname
            return new HandleExternalImage(externalImgUrl, outputDirectory, outputFileName, width, height, alt)
          } else {
            return Promise.reject(new Error('Could not get the favicon'))
          }
        })
        .then((HandleExternalImage) => HandleExternalImage.generatePictureElement()
          .then((pictureElement) => {
            $(elem).append(pictureElement)
          })
        )
        .catch((error) => {
          // eslint-disable-next-line no-unused-vars
          const err = error
        })
    )
  })
  // Load all links
  await Promise.all(promises)
  // Return the blog post html
  return $.html()
}
