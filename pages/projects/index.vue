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
                <template v-for="project in paginatedPosts">
                  <article v-if="project && project.slug" :id="project.slug" :key="project.title" class="post-index__post">
                    <header class="post__header">
                      <h2 class="post__title">
                        <NuxtLink :to="`/projects/${project.slug}/`" v-text="project.title" />
                      </h2>
                      <TechStack v-if="project.acf && project.acf.icons" class="post__tech-stack" :tech-stack="project.acf.icons" />
                    </header>
                    <div class="post__content" v-html="project.excerpt.trim()" />
                    <div class="post__buttons buttonsContainer">
                      <NuxtLink class="btn" :to="`/projects/${project.slug}/`">
                        Continue Reading
                      </NuxtLink>
                      <a v-if="project.acf && project.acf.project_url" class="btn" :href="project.acf.project_url">View project</a>
                      <a v-if="project.acf && project.acf.github" class="btn" :href="project.acf.github">View repo</a>
                    </div>
                  </article>
                </template>
                <Pagination
                  :page-count="pageCount"
                  link-prefix="projects"
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
import TechStack from '~/components/global/techStack'

export default {
  components: {
    Pagination,
    TechStack
  },
  data () {
    return {
      head: {
        title: 'Projects',
        description: 'Some loose notes on tech demonstrations and projects that I have created.'
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
        { hid: 'canonical', rel: 'canonical', href: 'https://joebailey.xyz/projects/' }
      ]
    }
  },
  computed: {
    ...mapState([
      'projects'
    ]),
    pageCount () {
      return this.projects.length
    },
    currentPage () {
      return parseInt(this.$route.params.page) || 1
    },
    paginatedPosts () {
      return this.projects[this.currentPage - 1]
    }
  },
  created () {
    if (parseInt(this.$route.params.page) === 1) {
      this.$router.push('/projects/')
    }
    if (!this.currentPage || this.currentPage < 1 || this.currentPage > this.pageCount) {
      this.$nuxt.context.error({ statusCode: 404, message: 'Page not found' })
    }
  }
}
</script>
