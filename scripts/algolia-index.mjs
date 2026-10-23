/* eslint-disable no-console */
// Pushes the generated pages in ./dist to the Algolia index used by the site search.
// Runs after `nuxt generate`. Only production (master) builds write to the index.
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'
import algoliasearch from 'algoliasearch'

const origin = 'https://joebailey.xyz'
const dist = fileURLToPath(new URL('../dist', import.meta.url))
// Matches the index name computed by packages/algolia-search-netlify (siteId and branch in the search component).
const indexName = 'netlify_0f6be2d7-6002-4d40-870b-9f3ad6ba7c49_master_all'
const appId = 'UFETFF29BD'
const titleSuffix = / \| Joe Bailey \| Software Engineer \| Cambridge, UK$/
// Algolia's smaller plans cap records at 10 KB.
const maxContentLength = 7000

async function* htmlFiles (dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== '_nuxt') { yield * htmlFiles(path) }
    } else if (entry.name === 'index.html') {
      yield path
    }
  }
}

async function buildRecord (file) {
  const $ = load(await readFile(file, 'utf8'))
  if (/noindex/i.test($('meta[name="robots"]').attr('content') || '')) { return null }
  const route = `/${relative(dist, file).split(sep).slice(0, -1).join('/')}`
  const url = route === '/' ? '/' : `${route}/`
  const body = $('main').first().length ? $('main').first() : $('body')
  body.find('script, style, nav, footer, svg, form, noscript').remove()
  body.find('h1, h2, h3, h4, h5, h6, p, li, div, br, pre, td, th, blockquote').after(' ')
  const content = body.text().replace(/\s+/g, ' ').trim()
  const title = ($('title').first().text() || $('h1').first().text()).replace(titleSuffix, '').trim()
  if (!title || !content) { return null }
  return {
    objectID: url,
    url: `${origin}${url}`,
    origin,
    title,
    description: ($('meta[name="description"]').attr('content') || '').trim(),
    content: content.slice(0, maxContentLength),
    lang: $('html').attr('lang') || 'en-GB',
    urlDepth: url.split('/').filter(Boolean).length
  }
}

async function main () {
  const dryRun = process.argv.includes('--dry-run')
  const branch = process.env.WORKERS_CI_BRANCH
  const forced = process.env.ALGOLIA_INDEX === '1'
  if (!dryRun && !forced && branch !== 'master') {
    console.log(`Skipping Algolia indexing (branch: ${branch || 'local build'}). Set ALGOLIA_INDEX=1 to force.`)
    return
  }
  const apiKey = process.env.ALGOLIA_ADMIN_API_KEY
  if (!dryRun && !apiKey) { throw new Error('ALGOLIA_ADMIN_API_KEY is required to index the site') }

  const records = []
  for await (const file of htmlFiles(dist)) {
    const record = await buildRecord(file)
    if (record) { records.push(record) }
  }
  if (!records.length) { throw new Error('No pages found to index; refusing to empty the search index') }

  if (dryRun) {
    console.log(JSON.stringify(records.map(({ content, ...rest }) => ({ ...rest, content: content.slice(0, 80) })), null, 2))
    return
  }

  const index = algoliasearch(appId, apiKey).initIndex(indexName)
  await index.setSettings({
    searchableAttributes: ['title', 'description', 'content'],
    attributesToSnippet: ['description:20', 'content:20'],
    attributesToRetrieve: ['url', 'title', 'description', 'content', 'hierarchy'],
    attributesForFaceting: ['lang']
  }).wait()
  // safe: true keeps the old records until the replacement is complete.
  await index.replaceAllObjects(records, { safe: true })
  console.log(`Indexed ${records.length} pages in Algolia`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
