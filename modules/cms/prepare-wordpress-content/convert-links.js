import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import FetchFavicon from './utils/fetch-favicon.js'
import { transformImageUrl } from './utils/image-transformations.js'

const faviconDirectory = fileURLToPath(new URL('../../../public/img/favicons/', import.meta.url))

// Favicons come from third-party sites, so they are copied into the build rather than hotlinked.
async function saveFavicon (faviconUrl, hostname) {
  const extension = path.extname(new URL(faviconUrl).pathname).toLowerCase() || '.png'
  const fileName = encodeURIComponent(`${hostname}${extension}`).toLowerCase()
  const filePath = path.join(faviconDirectory, fileName)
  if (!existsSync(filePath)) {
    const response = await fetch(faviconUrl, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) {
      throw new Error('Could not fetch the favicon')
    }
    await mkdir(faviconDirectory, { recursive: true })
    await writeFile(filePath, Buffer.from(await response.arrayBuffer()))
  }

  return `/img/favicons/${fileName}`
}

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
    const alt = `${parsedUrl.hostname} favicon`
    // Push into the promises to fetch the favicon
    promises.push(
      FaviconFetcher.getFavicon()
        .then((faviconUrl) => {
          if (!faviconUrl) {
            return Promise.reject(new Error('Could not get the favicon'))
          }

          return saveFavicon(faviconUrl, parsedUrl.hostname)
        })
        .then((src) => {
          // Shown at 16px, so a single 32px transformation covers high-density screens
          const img = $('<img decoding="async" loading="lazy" width="16" height="16">').attr('src', transformImageUrl(src, 32)).attr('alt', alt)
          $(elem).append($('<picture>').append(img))
        })
        .catch(() => {
          // A link without a favicon is fine
        })
    )
  })
  // Load all links
  await Promise.all(promises)

  // Return the blog post html
  return $.html()
}
