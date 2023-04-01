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

    const fetchFavicon = (url) => {
      const FaviconFetcher = new FetchFavicon(url)
      if (url && FaviconFetcher.isFullUrl(url)) {
        return FaviconFetcher.getFavicon()
      }
      return Promise.resolve()
    }
    const width = 16
    const height = 16
    const alt = url
    const outputDirectory = 'favicons'

    if (url.startsWith('http')) {
      promises.push(
        fetchFavicon(url)
          .then((externalImgUrl) => {
            if (externalImgUrl) {
              const outputFileName = new URL(url).hostname
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
    }
  })
  // Load all links
  await Promise.all(promises)
  // Return the blog post html
  return $.html()
}
