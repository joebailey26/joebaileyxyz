const fetch = require('node-fetch')
const { load } = require('cheerio')

export default class FetchFavicon {
  constructor (url) {
    this.url = url
  }

  isFullUrl (url) {
    try {
      // eslint-disable-next-line no-new
      new URL(url)
      return true
    } catch (e) {
      // invalid url OR local path
      return false
    }
  }

  async fetch () {
    const response = await fetch(this.url)
    if (!response.ok) {
      return Promise.reject(new Error('Could not fetch webpage'))
    }
    const body = await response.text()
    this.body = body

    this.$ = load(body)
    return Promise.resolve()
  }

  normalizePath (path) {
    let actualUrl = this.url
    const canonical = this.$('link[rel~=\'canonical\']')
    if (canonical.length) {
      actualUrl = canonical[0].attribs.href
    }
    const u = new URL(path, actualUrl)
    return u.href
  }

  findRelIcons () {
    const results = []
    const icons = this.$('link[rel~=\'icon\']')

    for (const icon of icons) {
      const sizesStr = icon.attribs.sizes
      const typeStr = icon.attribs.type
      let type
      if (typeStr) {
        if (typeStr.startsWith('image/') || typeStr.startsWith('img/')) {
          type = typeStr.split('/')[1]
        }
      }

      results.push({
        href: this.normalizePath(icon.attribs.href),
        size: sizesStr ? sizesStr.split('x') : [0, 0],
        type: type || 'auto'
      })
    }

    // TODO deprioritize "image/x-icon" if the sizes are the same
    return results.sort((a, b) => {
      const ordering = b.size[0] - a.size[0]
      if (!Number.isNaN(ordering)) { return ordering } else if (b.size[0].toLowerCase() === 'any') { return 1 } else { return -1 }
    })
  }

  findAppleTouchIcon () {
    const icon = this.$('link[rel~=\'apple-touch-icon\']')
    if (icon.length) {
      return this.normalizePath(icon[0].attribs.href)
    }

    const precomposedIcon = this.$('link[rel~=\'apple-touch-icon-precomposed\']')
    if (precomposedIcon.length) {
      return this.normalizePath(precomposedIcon[0].attribs.href)
    }
  }

  async getFavicon () {
    try {
      await this.fetch()
    } catch (e) {
      return null
    }
    const appleTouchIconHref = this.findAppleTouchIcon()
    if (appleTouchIconHref) {
      return appleTouchIconHref
    }

    const relIcons = this.findRelIcons()
    if (relIcons.length) {
      return relIcons[0].href
    }
    return null
  }
}
