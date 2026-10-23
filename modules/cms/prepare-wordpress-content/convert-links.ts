import { existsSync } from 'node:fs'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import FetchFavicon from './utils/fetch-favicon.ts'
import { cacheDirectory } from './utils/cache-directory.ts'
import { transformImageUrl } from './utils/image-transformations.ts'

const faviconDirectory = fileURLToPath(new URL('../../../public/img/favicons/', import.meta.url))
const faviconCacheDirectory = path.join(cacheDirectory, 'favicons')
const manifestPath = path.join(faviconCacheDirectory, 'manifest.json')
const fetchTimeout = 10000
// Sites without a usable favicon are retried occasionally rather than on every build.
const missingFaviconTtl = 7 * 24 * 60 * 60 * 1000

// What is known about each hostname's favicon; `file` is null when the site has none.
type Manifest = Record<string, { file: string | null, checkedAt: number }>

// hostname -> Promise<string | null>, so each host is looked up once per build however many links point at it.
const lookups = new Map<string, Promise<string | null>>()
let manifestPromise: Promise<Manifest> | undefined

function getManifest (): Promise<Manifest> {
  manifestPromise ||= readFile(manifestPath, 'utf8').then((contents): Manifest => JSON.parse(contents)).catch((): Manifest => ({}))

  return manifestPromise
}

// Writes are chained so concurrent lookups never interleave on the same file.
let manifestWrite = Promise.resolve()

function saveManifest (manifest: Manifest) {
  manifestWrite = manifestWrite.then(async () => {
    await mkdir(faviconCacheDirectory, { recursive: true })
    await writeFile(manifestPath, JSON.stringify(manifest))
  }).catch(() => {})

  return manifestWrite
}

// Favicons come from third-party sites, so they are copied into the build rather than hotlinked.
async function downloadFavicon (faviconUrl: string, hostname: string): Promise<string> {
  const extension = path.extname(new URL(faviconUrl).pathname).toLowerCase() || '.png'
  const fileName = encodeURIComponent(`${hostname}${extension}`).toLowerCase()
  const cachedPath = path.join(faviconCacheDirectory, fileName)
  if (!existsSync(cachedPath)) {
    const response = await fetch(faviconUrl, { signal: AbortSignal.timeout(fetchTimeout) })
    if (!response.ok) {
      throw new Error('Could not fetch the favicon')
    }
    await mkdir(faviconCacheDirectory, { recursive: true })
    await writeFile(cachedPath, Buffer.from(await response.arrayBuffer()))
  }

  return fileName
}

async function resolveFavicon (url: string, hostname: string): Promise<string | null> {
  const manifest = await getManifest()
  const entry = manifest[hostname]
  let fileName: string | null
  if (entry && (entry.file ? existsSync(path.join(faviconCacheDirectory, entry.file)) : Date.now() - entry.checkedAt < missingFaviconTtl)) {
    fileName = entry.file
  } else {
    try {
      const faviconUrl = await new FetchFavicon(url).getFavicon()
      fileName = faviconUrl ? await downloadFavicon(faviconUrl, hostname) : null
    } catch {
      fileName = null
    }
    manifest[hostname] = { file: fileName, checkedAt: Date.now() }
    await saveManifest(manifest)
  }
  if (!fileName) {
    return null
  }
  await mkdir(faviconDirectory, { recursive: true })
  await copyFile(path.join(faviconCacheDirectory, fileName), path.join(faviconDirectory, fileName))

  return `/img/favicons/${fileName}`
}

function getFavicon (url: string, hostname: string): Promise<string | null> {
  if (!lookups.has(hostname)) {
    lookups.set(hostname, resolveFavicon(url, hostname).catch(() => null))
  }

  return lookups.get(hostname) ?? Promise.resolve(null)
}

export default async function addFaviconToLinks (postContent: string): Promise<string> {
  const regex = /<a.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  const promises: Promise<void>[] = []
  // Loop through all links
  $('a').each((i, elem) => {
    // Work out the url
    const url = $(elem).attr('href')
    // If there's no URL, don't go any further
    if (!url) {
      return
    }
    const parsedUrl = new FetchFavicon(url).isFullUrl(url)
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
      getFavicon(url, parsedUrl.hostname).then((src) => {
        // A link without a favicon is fine
        if (src) {
          // Shown at 16px, so a single 32px transformation covers high-density screens
          const img = $('<img decoding="async" loading="lazy" width="16" height="16">').attr('src', transformImageUrl(src, 32)).attr('alt', alt)
          $(elem).append($('<picture>').append(img))
        }
      })
    )
  })
  // Load all links
  await Promise.all(promises)

  // Return the blog post html
  return $.html()
}
