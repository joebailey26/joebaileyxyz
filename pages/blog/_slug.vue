<template>
  <div v-if="post">
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <div class="navigation-index">
              <NuxtLink :to="'/blog/'" class="navigation-index__link">
                <font-awesome-icon :icon="['fa-regular', 'fa-hand-point-left']" class="navigation-link__icon" />
                Back to blog
              </NuxtLink>
            </div>
            <h1 class="page-header__title" v-text="post.title" />
            <p class="page-header__description">
              <span>Published </span><time :datetime="post.date" v-text="`${getDay(post.date)} ${getMonth(post.date)} '${getYear(post.date)}`" />
            </p>
          </div>
        </div>
      </div>
    </header>
    <main class="post-single">
      <div class="container ml-auto mr-auto">
        <section class="section">
          <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
              <article>
                <div class="post__content" v-html="post.content" />
                <div v-if="post.acf && (post.acf.project_url || post.acf.github)" class="post__buttons buttonsContainer">
                  <a v-if="post.acf.project_url" class="btn" :href="post.acf.project_url">View project</a>
                  <a v-if="post.acf.github" class="btn" :href="post.acf.github">View repo</a>
                </div>
                <ClientOnly>
                  <GalexiaShare :title="$nuxt.$options.head.titleTemplate.replace('%s', post.title)" :description="post.excerpt.plain" />
                </ClientOnly>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
    <div class="container ml-auto mr-auto">
      <div class="row">
        <div class="col-md-8 ml-auto mr-auto">
          <PostsNavigation post-type="blog" next-post-text="Next Blog Post" previous-post-text="Previous Blog Post" :show-post-name="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  head () {
    const meta = []
    let title = ''
    if (this.post) {
      if (this.post.title) {
        title = this.post.title
        meta.push({ hid: 'og:title', property: 'og:title', content: this.post.title })
        meta.push({ hid: 'twitter:title', name: 'twitter:title', content: this.post.title })
      }
      if (this.post.excerpt.plain) {
        meta.push({ hid: 'description', name: 'description', content: this.post.excerpt.plain })
        meta.push({ hid: 'og:description', property: 'og:description', content: this.post.excerpt.plain })
        meta.push({ hid: 'twitter:description', name: 'twitter:description', content: this.post.excerpt.plain })
      }
      if (this.post.featured_media) {
        meta.push({ hid: 'og:image', property: 'og:image', content: this.post.featured_media })
      }
    }
    return {
      title,
      meta,
      link: [
        { hid: 'canonical', rel: 'canonical', href: `https://joebailey.xyz/blog/${this.$route.params.slug}/` }
      ]
    }
  },
  computed: {
    ...mapState([
      'blog'
    ]),
    post () {
      return this.blog.flat().find((item) => item.slug === this.$route.params.slug)
    }
  },
  created () {
    if (!this.post) {
      this.$nuxt.context.error({ statusCode: 404, message: 'Post not found' })
    }
  },
  mounted () {
    this.registerCopyToClipboardContainers()
  },
  methods: {
    getDay (date) {
      return date.getDate()
    },
    getMonth (date) {
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
    },
    getYear (date) {
      return date.getFullYear().toString().substring(2)
    }
  }
}
</script>
