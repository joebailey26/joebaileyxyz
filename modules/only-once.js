import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { load } from 'cheerio'

function getDay (date) {
  date = new Date(date.substring(0, date.indexOf('T')))
  return date.getDate()
}

function getMonth (date) {
  date = new Date(date.substring(0, date.indexOf('T')))
  const monthArr = []
  monthArr[0] = 'Jan'
  monthArr[1] = 'Feb'
  monthArr[2] = 'Mar'
  monthArr[3] = 'Apr'
  monthArr[4] = 'May'
  monthArr[5] = 'Jun'
  monthArr[6] = 'Jul'
  monthArr[7] = 'Aug'
  monthArr[8] = 'Sep'
  monthArr[9] = 'Oct'
  monthArr[10] = 'Nov'
  monthArr[11] = 'Dec'
  return monthArr[date.getMonth()]
}

function getYear (date) {
  date = new Date(date.substring(0, date.indexOf('T')))
  return date.getFullYear().toString().substring(2)
}

function getReadingTime (content) {
  const avgWordsPerMin = 200
  const count = content.match(/\w+/g).length
  return Math.ceil(count / avgWordsPerMin)
}

function getRequiredInfoFromPosts (posts) {
  if (!posts.length) {
    return null
  }
  return posts.map(({ title, excerpt, slug, date, content, acf }) => ({
    title: title.rendered,
    excerpt: excerpt.rendered,
    slug,
    date: {
      fullDate: new Date(date.substring(0, date.indexOf('T'))),
      year: getYear(date),
      month: getMonth(date),
      day: getDay(date)
    },
    content: content.rendered,
    readingTime: getReadingTime(content.rendered),
    acf
  }))
}

const postsPerPage = 10

async function fetchPosts (categoryId) {
  const posts = []
  const initialCall = await fetch(
    `https://joebaileyphotography.com/Blog/wp-json/wp/v2/posts?_embed=1&status=publish&categories=${categoryId}&per_page=${postsPerPage}`,
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.WP_USER}:${process.env.WP_PASS}`).toString(
            'base64'
          )
      }
    }
  ).then((response) => {
    const totalPosts = response.headers.get('X-WP-Total')
    const totalPages = response.headers.get('X-WP-TotalPages')
    return response.json().then((posts) => ({ totalPosts, totalPages, posts }))
  })
  posts.push(getRequiredInfoFromPosts(initialCall.posts))
  for (let page = 2; page <= initialCall.totalPages; page++) {
    const paginatedCall = await fetch(
      `https://joebaileyphotography.com/Blog/wp-json/wp/v2/posts?_embed=1&status=publish&categories=${categoryId}&page=${page}&per_page=${postsPerPage}`,
      {
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(
              `${process.env.WP_USER}:${process.env.WP_PASS}`
            ).toString('base64')
        }
      }
    ).then((response) => response.json())
    posts.push(getRequiredInfoFromPosts(paginatedCall))
  }
  for (const post of posts.flat()) {
    const regex = /<img.*?>/g
    const matches = post.content.match(regex)
    if (matches) {
      console.log(post.content)
      console.log(await downloadAndReplaceImages(post.content))
      post.content = await downloadAndReplaceImages(post.content)
      throw new Error('error')
    }
  }
  return posts
}

async function downloadAndReplaceImages (htmlString) {
  const $ = load(htmlString)
  const promises = []
  $('img').each((i, elem) => {
    // Need to skip if images are already local
    // Need to set proper directory to store images
    // Need to pass images through to nuxt to allow optimised versions to be created
    // Need to remove the srcset and sizes properties
    const imgUrl = $(elem).attr('src')
    promises.push(fetch(imgUrl).then((response) => {
      const extension = path.extname(imgUrl)
      const fileName = `image-${i}${extension}`
      const localPath = path.join(__dirname, fileName)
      const dest = fs.createWriteStream(localPath)
      response.body.pipe(dest)
      $(elem).attr('src', localPath)
    }))
  })
  await Promise.all(promises)
  return $.html()
}

export default async function () {
  const state = {
    projects: await fetchPosts(96),
    blogPosts: await fetchPosts(39)
  }

  this.nuxt.hook('vue-renderer:ssr:prepareContext', (ssrContext) => {
    ssrContext.$state = state
  })
}
