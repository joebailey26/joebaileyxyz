import fetch from 'node-fetch'
import he from 'he'
import { load } from 'cheerio'
import striptags from 'striptags'
import prepareWordPressContent from './prepare-wordpress-content'
import cmsContent from './cms-content.cjs'

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
      date: new Date(date.substring(0, date.indexOf('T'))),
      content: content.rendered.trim(),
      readingTime: getReadingTime(content.rendered, true),
      acf,
      featured_media: featuredMediaUrl || featuredMedia
    }
  })
}

const postsPerPage = 10

async function fetchPosts (categoryId) {
  const posts = []
  const initialCall = await fetch(
    `${process.env.WP_API_URL}posts?_embed=1&status=publish&categories=${categoryId}&per_page=${postsPerPage}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_PASS}`).toString('base64')}`
      }
    }
  ).then((response) => {
    if (!response.ok) {
      throw new Error(`WordPress posts request failed: HTTP ${response.status}`)
    }
    const totalPosts = response.headers.get('X-WP-Total')
    const totalPages = response.headers.get('X-WP-TotalPages')
    return response.json().then((posts) => ({ totalPosts, totalPages, posts }))
  })
  posts.push(getRequiredInfoFromPosts(initialCall.posts))
  for (let page = 2; page <= initialCall.totalPages; page++) {
    const paginatedCall = await fetch(
      `${process.env.WP_API_URL}posts?_embed=1&status=publish&categories=${categoryId}&page=${page}&per_page=${postsPerPage}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_PASS}`).toString('base64')}`
        }
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`WordPress posts request failed: HTTP ${response.status}`)
      }
      return response.json()
    })
    posts.push(getRequiredInfoFromPosts(paginatedCall))
  }
  for (const post of posts.flat()) {
    await prepareWordPressContent(post)
  }
  return posts
}

export default async function () {
  const source = process.env.CONTENT_SOURCE || 'wordpress'
  if (!['wordpress', 'cms'].includes(source)) {
    throw new Error('CONTENT_SOURCE must be wordpress or cms')
  }
  let state
  if (source === 'cms') {
    const sections = await cmsContent.fetchCmsContent({ baseUrl: process.env.CMS_API_URL, token: process.env.CMS_BUILD_TOKEN, fetchImpl: fetch, perPage: postsPerPage })
    state = {}
    for (const section of ['blog', 'projects']) {
      state[section] = sections[section].map(getRequiredInfoFromPosts)
      for (const post of state[section].flat()) {
        await prepareWordPressContent(post)
      }
    }
  } else {
    state = {
      projects: await fetchPosts(96),
      blog: await fetchPosts(39)
    }
  }

  this.nuxt.hook('generate:extendRoutes', (routes) => {
    for (let page = 2; page <= state.blog.length; page++) {
      routes.push({ route: `/blog/page/${page}/` })
    }
    for (const section of ['blog', 'projects']) {
      for (const post of state[section].flat()) {
        routes.push({ route: `/${section}/${post.slug}/` })
      }
    }
  })

  this.nuxt.hook('vue-renderer:ssr:prepareContext', (ssrContext) => {
    ssrContext.$state = state
  })
}
