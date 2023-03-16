export const state = () => ({
  projects: [],
  blogPosts: []
})

export const mutations = {
  updateProjects: (state, projects) => {
    state.projects = projects
  },
  updateBlogPosts: (state, blogPosts) => {
    state.blogPosts = blogPosts
  }
}

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
  if (!posts) {
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
  return posts
}

export const actions = {
  async nuxtServerInit ({ commit }) {
    commit('updateProjects', await fetchPosts(96))
    commit('updateBlogPosts', await fetchPosts(39))
  }
}
