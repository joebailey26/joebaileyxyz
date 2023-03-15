<template>
  <div v-if="post">
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
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
                <!-- TO DO: Add Navigation -->
                <div class="post__content" v-html="post.content" />
                <div class="post__buttons buttonsContainer">
                  <a v-if="post.acf && post.acf.project_url" class="btn" :href="post.acf.project_url">View the project</a>
                  <a v-if="post.acf && post.acf.github" class="btn" :href="post.acf.github">View on GitHub</a>
                </div>
                <!-- TO DO: Add Galexia Share Integration -->
                <!-- TO DO: Add Navigation -->
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  computed: {
    post () {
      return this.$store.state.blogPosts.flat().find(item => item.slug === this.$route.params.slug)
    },
    head () {
      return {
        title: this.post ? this.post.title : '',
        description: this.post ? this.post.excerpt : ''
      }
    }
  },
  created () {
    if (!this.post) {
      this.$nuxt.context.error({ statusCode: 404, message: 'Post not found' })
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
        { hid: 'canonical', rel: 'canonical', href: 'https://joebailey.xyz/projects/' }
      ]
    }
  }
}
</script>
