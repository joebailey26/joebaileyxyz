import he from 'he'
import { load } from 'cheerio'
import striptags from 'striptags'
import type { CmsContent, CmsFeedPost, CmsSection } from '../../shared/types/cms'
import cmsContent from '../cms-content.cjs'
import prepareWordPressContent from './prepare-wordpress-content'
import type { UnpreparedPost } from './prepare-wordpress-content'

function getReadingTime (content: string, isHtml = false): number {
  const avgWordsPerMin = 200
  let contentToProcess = content
  if (isHtml) {
    const $ = load(contentToProcess, null, false)
    $('pre').remove()
    contentToProcess = $.html()
    contentToProcess = striptags(contentToProcess)
  }
  const count = (contentToProcess.match(/\w+/g) || []).length

  return Math.ceil(count / avgWordsPerMin)
}

function getRequiredInfoFromPosts (posts: CmsFeedPost[]): UnpreparedPost[] {
  if (!posts.length) {
    return []
  }

  return posts.map(({ title, excerpt, slug, date, content, acf, featured_media: featuredMedia, featured_media_url: featuredMediaUrl }) => {
    const convertedExcerpt = excerpt.rendered.replace(/(<p class="link-more">.*<\/p>)/g, '').replace(' &hellip; ', '&hellip;').trim()

    return {
      title: he.decode(title.rendered),
      excerpt: {
        raw: convertedExcerpt,
        plain: he.decode(striptags(convertedExcerpt))
      },
      slug,
      rawDate: date,
      // Serialised as an ISO string; the app turns it back into a Date.
      date: new Date(date.substring(0, date.indexOf('T'))).toISOString(),
      content: content.rendered.trim(),
      readingTime: getReadingTime(content.rendered, true),
      acf,
      featuredMedia: featuredMediaUrl || featuredMedia
    }
  })
}

export const postsPerPage = 10

const concurrency = 4

// Runs `task` over every item with a few in flight at once, keeping the order; the first failure rejects.
async function mapConcurrently<T, R> (items: T[], task: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  // The workers share one iterator, so each item is taken once.
  const entries = items.entries()
  const worker = async () => {
    for (const [index, item] of entries) {
      results[index] = await task(item)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker))

  return results
}

// Fetches both sections from the CMS feed, paginated as the site shows them, and prepares post content.
export async function loadCmsContent (): Promise<CmsContent> {
  const sections = await cmsContent.fetchCmsContent({ baseUrl: process.env.CMS_API_URL, token: process.env.CMS_BUILD_TOKEN, fetchImpl: fetch, perPage: postsPerPage })
  const state: CmsContent = { blog: [], projects: [] }
  for (const section of ['blog', 'projects'] as CmsSection[]) {
    const pages = sections[section].map(getRequiredInfoFromPosts)
    const prepared = await mapConcurrently(pages.flat(), prepareWordPressContent)
    // Back into the pages that the site paginates by.
    let offset = 0
    state[section] = pages.map((page) => prepared.slice(offset, offset += page.length))
  }

  return state
}
