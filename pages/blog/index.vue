<template>
  <div>
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <h1 class="page-header__title">
              Blog
            </h1>
            <p class="page-header__description">
              Some of my ramblings on tech, websites, and self-development.
            </p>
          </div>
        </div>
      </div>
    </header>
    <main class="post-index">
      <div class="container ml-auto mr-auto">
        <section class="section">
          <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
              <div class="post-index__loop">
                <template v-for="post in blogPosts">
                  <article :id="post.slug" :key="post.title" class="post-index__post post-index__post--with-date">
                    <Date class="post__date" :date="post.date" />
                    <header class="post__header">
                      <h2 class="post__title">
                        <nuxt-link :to="`blog/${post.slug}`" v-html="post.title" />
                      </h2>
                      <span class="post__read-time">{{ post.readingTime }} minute read</span>
                    </header>
                    <div class="post__content" v-html="post.excerpt" />
                    <div class="post__buttons buttonsContainer">
                      <nuxt-link class="btn" :to="`blog/${post.slug}`">
                        Continue Reading
                      </nuxt-link>
                    </div>
                  </article>
                </template>
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
import Date from '~/components/posts/date'

export default {
  components: {
    Date
  },
  computed: {
    ...mapState([
      'blogPosts'
    ])
  },
  head () {
    return {
      title: 'Blog',
      meta: [
        { hid: 'description', name: 'description', content: 'Some of my ramblings on tech, websites, and self-development.' },
        { hid: 'og:title', property: 'og:title', content: 'Blog' },
        { hid: 'og:description', property: 'og:description', content: 'Some of my ramblings on tech, websites, and self-development.' },
        { hid: 'twitter:title', name: 'twitter:title', content: 'Blog' },
        { hid: 'twitter:description', name: 'twitter:description', content: 'Some of my ramblings on tech, websites, and self-development.' }
      ]
    }
  }
}
</script>
