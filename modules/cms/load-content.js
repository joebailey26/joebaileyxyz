import he from 'he'
import { load } from 'cheerio'
import striptags from 'striptags'
import cmsContent from '../cms-content.cjs'
import prepareWordPressContent from './prepare-wordpress-content/index.js'

function getReadingTime (content, isHtml = false) {
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

function getRequiredInfoFromPosts (posts) {
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

// Fetches both sections from the CMS feed, paginated as the site shows them, and prepares post content.
export async function loadCmsContent () {
  const sections = await cmsContent.fetchCmsContent({ baseUrl: process.env.CMS_API_URL, token: process.env.CMS_BUILD_TOKEN, fetchImpl: fetch, perPage: postsPerPage })
  const state = {}
  for (const section of ['blog', 'projects']) {
    state[section] = sections[section].map(getRequiredInfoFromPosts)
    for (const post of state[section].flat()) {
      await prepareWordPressContent(post)
    }
  }

  return state
}
