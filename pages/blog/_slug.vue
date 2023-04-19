<template>
  <div v-if="post">
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <div class="navigation-index">
              <nuxt-link :to="'/blog/'" class="navigation-index__link">
                <font-awesome-icon :icon="['fa-regular', 'fa-hand-point-left']" class="navigation-link__icon" />
                Back to blog
              </nuxt-link>
            </div>
            <h1 class="page-header__title" v-html="post.title" />
            <p class="page-header__description">
              <span>Published </span><time :datetime="post.date.fullDate" v-html="`${post.date.day} ${post.date.month} '${post.date.year}`" />
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
                <div class="post__content" v-html="post.content.trim()" />
                <div v-if="post.acf && (post.acf.project_url || post.acf.github)" class="post__buttons buttonsContainer">
                  <a v-if="post.acf.project_url" class="btn" :href="post.acf.project_url">View project</a>
                  <a v-if="post.acf.github" class="btn" :href="post.acf.github">View repo</a>
                </div>
                <Share :title="post.title" :excerpt="post.excerpt" />
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
    <div class="container ml-auto mr-auto">
      <div class="row">
        <div class="col-md-8 ml-auto mr-auto">
          <Navigation post-type="blog" next-post-text="Next Blog Post" previous-post-text="Previous Blog Post" :show-post-name="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Navigation from '~/components/posts/navigation'
import Share from '~/components/posts/share'

export default {
  components: {
    Navigation,
    Share
  },
  head () {
    return {
      title: this.head.title,
      meta: [
        { hid: 'description', name: 'description', content: this.head.description },
        { hid: 'og:title', property: 'og:title', content: this.head.title },
        { hid: 'og:description', property: 'og:description', content: this.head.description },
        { hid: 'twitter:title', name: 'twitter:title', content: this.head.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.head.description }
      ],
      link: [
        { hid: 'canonical', rel: 'canonical', href: `https://joebailey.xyz/blog/${this.$route.params.slug}/` },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Recursive&display=swap' },
        { rel: 'stylesheet', media: 'print', onload: 'this.media="all"', href: 'https://fonts.googleapis.com/css2?family=Recursive&display=swap' }
      ],
      __dangerouslyDisableSanitizers: ['script', 'noscript'],
      noscript: [
        { innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Recursive&display=swap" />' }
      ]
    }
  },
  computed: {
    head () {
      return {
        title: this.post ? this.post.title : '',
        description: this.post ? this.post.excerpt : ''
      }
    },
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
  }
}
</script>
