import { load } from 'cheerio'
import type { CheerioAPI } from 'cheerio'

interface RelIcon {
  href: string
  // The width and height from the sizes attribute; "any" is possible for scalable icons.
  size: string[]
  type: string
}

export default class FetchFavicon {
  url: string
  body: string | null = null
  $: CheerioAPI | null = null

  constructor (url: string) {
    this.url = url
  }

  // The page, once fetch() has loaded it.
  private get page (): CheerioAPI {
    if (!this.$) {
      throw new Error('The page has not been fetched')
    }

    return this.$
  }

  isFullUrl (url: string): URL | false {
    try {
      const parsedUrl = new URL(url)

      return parsedUrl
    } catch {
      // invalid url OR local path
      return false
    }
  }

  async fetch (): Promise<void> {
    const response = await fetch(this.url, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) {
      return Promise.reject(new Error('Could not fetch webpage'))
    }
    const body = await response.text()
    this.body = body

    this.$ = load(body)

    return Promise.resolve()
  }

  normalizePath (path: string): string {
    let actualUrl = this.url
    const canonical = this.page('link[rel~=\'canonical\']')
    const canonicalHref = canonical.attr('href')
    if (canonicalHref) {
      actualUrl = canonicalHref
    }
    const u = new URL(path, actualUrl)

    return u.href
  }

  findRelIcons (): RelIcon[] {
    const results: RelIcon[] = []
    const icons = this.page('link[rel~=\'icon\']')

    for (const icon of icons) {
      const href = icon.attribs.href
      if (href === undefined) {
        continue
      }
      const sizesStr = icon.attribs.sizes
      const typeStr = icon.attribs.type
      let type
      if (typeStr) {
        if (typeStr.startsWith('image/') || typeStr.startsWith('img/')) {
          type = typeStr.split('/')[1]
        }
      }

      results.push({
        href: this.normalizePath(href),
        size: sizesStr ? sizesStr.split('x') : ['0', '0'],
        type: type || 'auto'
      })
    }

    // TODO deprioritize "image/x-icon" if the sizes are the same
    return results.sort((a, b) => {
      const ordering = Number(b.size[0]) - Number(a.size[0])
      if (!Number.isNaN(ordering)) { return ordering } else if (b.size[0]?.toLowerCase() === 'any') { return 1 } else { return -1 }
    })
  }

  findAppleTouchIcon (): string | undefined {
    const icon = this.page('link[rel~=\'apple-touch-icon\']')
    const iconHref = icon.attr('href')
    if (iconHref !== undefined) {
      return this.normalizePath(iconHref)
    }

    const precomposedIcon = this.page('link[rel~=\'apple-touch-icon-precomposed\']')
    const precomposedHref = precomposedIcon.attr('href')
    if (precomposedHref !== undefined) {
      return this.normalizePath(precomposedHref)
    }
  }

  async getFavicon (): Promise<string | null> {
    try {
      await this.fetch()
    } catch {
      return null
    }
    const appleTouchIconHref = this.findAppleTouchIcon()
    if (appleTouchIconHref) {
      return appleTouchIconHref
    }

    return this.findRelIcons()[0]?.href ?? null
  }
}
