<template>
  <div>
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <h1 class="page-header__title" v-text="head.title" />
            <p class="page-header__description" v-text="head.description" />
          </div>
        </div>
      </div>
    </header>
    <main class="post-index">
      <div class="container ml-auto mr-auto">
        <section class="section">
          <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
              <div v-if="paginatedPosts" class="post-index__loop">
                <template v-for="post in paginatedPosts">
                  <article v-if="post && post.slug" :id="post.slug" :key="post.title" class="post-index__post post-index__post--with-date">
                    <Date class="post__date" :date="post.date" />
                    <header class="post__header">
                      <h2 class="post__title">
                        <NuxtLink :to="`/blog/${post.slug}/`" v-text="post.title" />
                      </h2>
                      <span class="post__read-time">{{ post.readingTime }} minute read</span>
                    </header>
                    <div class="post__content" v-html="post.excerpt.trim()" />
                    <div class="post__buttons buttonsContainer">
                      <NuxtLink class="btn" :to="`/blog/${post.slug}/`">
                        Continue Reading
                      </NuxtLink>
                    </div>
                  </article>
                </template>
                <Pagination
                  :page-count="pageCount"
                  link-prefix="blog"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Pagination from '~/components/posts/pagination'
import Date from '~/components/posts/date'

export default {
  components: {
    Pagination,
    Date
  },
  data () {
    return {
      head: {
        title: 'Blog',
        description: 'Some of my ramblings on tech, websites, and self-development.'
      }
    }
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
        { hid: 'canonical', rel: 'canonical', href: 'https://joebailey.xyz/blog/' }
      ]
    }
  },
  computed: {
    ...mapState([
      'blog'
    ]),
    pageCount () {
      return this.blog.length
    },
    currentPage () {
      return parseInt(this.$route.params.page) || 1
    },
    paginatedPosts () {
      return this.blog[this.currentPage - 1]
    }
  },
  created () {
    if (parseInt(this.$route.params.page) === 1) {
      this.$router.push('/projects/')
    }
    if (this.currentPage < 1 || this.currentPage > this.pageCount) {
      this.$nuxt.context.error({ statusCode: 404, message: 'Page not found' })
    }
  }
}
</script>
