// This module runs only during Nuxt generation. Never expose the token in runtimeConfig.
async function fetchCmsContent ({ baseUrl, token, fetchImpl, perPage = 10 }) {
  if (!baseUrl || !token) { throw new Error('CMS_API_URL and CMS_BUILD_TOKEN are required for the CMS content source') }
  const root = new URL(baseUrl)
  if (root.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(root.hostname)) { throw new Error('CMS_API_URL must use HTTPS') }
  const get = async (path) => {
    const response = await fetchImpl(new URL(path, root), { headers: { Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(60000) })
    if (!response.ok) {
      const challenge = response.headers?.get('cf-mitigated') === 'challenge' ? ' (Cloudflare blocked the build with an interactive challenge)' : ''
      throw new Error(`CMS content request failed: HTTP ${response.status}${challenge}`)
    }
    return response.json()
  }
  const manifest = await get('/api/content/manifest')
  if (typeof manifest.revision !== 'string' || !manifest.counts) { throw new Error('Invalid CMS manifest') }
  const sections = {}
  for (const section of ['blog', 'projects']) {
    const total = manifest.counts[section]
    if (!Number.isSafeInteger(total) || total < 0) { throw new Error(`Invalid CMS ${section} count`) }
    const pages = []
    const seen = new Set()
    for (let page = 1; page <= Math.max(1, Math.ceil(total / perPage)); page++) {
      const payload = await get(`/api/content/posts?revision=${encodeURIComponent(manifest.revision)}&section=${section}&page=${page}&per_page=${perPage}`)
      if (payload.revision !== manifest.revision || payload.total !== total || payload.totalPages !== Math.ceil(total / perPage) || !Array.isArray(payload.items)) { throw new Error(`Inconsistent CMS ${section} revision or pagination`) }
      const expected = Math.min(perPage, Math.max(0, total - (page - 1) * perPage))
      if (payload.items.length !== expected) { throw new Error(`Incomplete CMS ${section} page ${page}`) }
      for (const post of payload.items) {
        if (post.status !== 'publish' || post.section !== section || !post.slug || seen.has(post.slug) || !post.title || !post.excerpt || !post.content) { throw new Error(`Invalid CMS ${section} record`) }
        seen.add(post.slug)
      }
      pages.push(payload.items)
    }
    // Keep an empty first page so existing page components can show an empty section.
    sections[section] = pages
  }
  return sections
}

module.exports = { fetchCmsContent }
