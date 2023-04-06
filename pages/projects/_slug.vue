<template>
  <div v-if="project">
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <h1 class="page-header__title" v-html="project.title" />
            <TechStack v-if="project.acf && project.acf.icons" class="page-header__tech-stack page-header__description" :tech-stack="project.acf.icons" />
          </div>
        </div>
      </div>
    </header>
    <main class="project-single">
      <div class="container ml-auto mr-auto">
        <section class="section">
          <div class="row">
            <div class="col-md-8 ml-auto mr-auto">
              <article>
                <!-- TO DO: Add Navigation -->
                <div class="post__content" v-html="project.content" />
                <div v-if="project.acf && (project.acf.project_url || project.acf.github)" class="post__buttons buttonsContainer">
                  <a v-if="project.acf.project_url" class="btn" :href="project.acf.project_url">View project</a>
                  <a v-if="project.acf.github" class="btn" :href="project.acf.github">View repo</a>
                </div>
                <Share :title="project.title" :excerpt="project.excerpt" />
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
import Share from '~/components/posts/share'
import TechStack from '~/components/global/techStack'

export default {
  components: {
    Share,
    TechStack
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
        { hid: 'canonical', rel: 'canonical', href: `https://joebailey.xyz/projects/${this.$route.params.slug}/` },
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
    project () {
      return this.$store.state.projects.flat().find((item) => item.slug === this.$route.params.slug)
    },
    head () {
      return {
        title: this.project ? this.project.title : '',
        description: this.project ? this.project.excerpt : ''
      }
    }
  },
  created () {
    if (!this.project) {
      this.$nuxt.context.error({ statusCode: 404, message: 'Project not found' })
    }
  }
}
</script>
