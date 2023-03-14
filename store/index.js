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

export const actions = {
  async nuxtServerInit ({ commit }, { error }) {
    try {
      let projects = await fetch('https://joebaileyphotography.com/Blog/wp-json/wp/v2/posts?_embed=1&categories=96&per_page=99').then(res => res.json())
      projects = projects
        .filter(el => el.status === 'publish')
        // eslint-disable-next-line camelcase
        .map(({ title, excerpt, content, slug, acf, yoast_head_json }) => ({
          title: title.rendered,
          excerpt: excerpt.rendered,
          content: content.rendered,
          slug,
          acf,
          yoast_head_json
        }))
      let blogPosts = await fetch('https://joebaileyphotography.com/Blog/wp-json/wp/v2/posts?_embed=1&categories=39&per_page=99').then(res => res.json())
      blogPosts = blogPosts
        .filter(el => el.status === 'publish')
        // eslint-disable-next-line camelcase
        .map(({ title, excerpt, slug, date, content }) => ({
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
          readingTime: getReadingTime(content.rendered)
        }))
      commit('updateProjects', projects)
      commit('updateBlogPosts', blogPosts)
    } catch (err) {
      error({ statusCode: 500, message: err })
    }
  }
}
