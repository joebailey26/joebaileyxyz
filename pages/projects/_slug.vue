<template>
  <div v-if="project">
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <div class="navigation-index">
              <NuxtLink :to="'/projects/'" class="navigation-index__link">
                <font-awesome-icon :icon="['fa-regular', 'fa-hand-point-left']" class="navigation-link__icon" />
                Back to projects
              </NuxtLink>
            </div>
            <h1 class="page-header__title" v-text="project.title" />
            <TechStack v-if="project.acf && project.acf.icons" class="page-header__tech-stack page-header__description" :tech-stack="project.acf.icons" :show-post-name="true" />
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
                <div class="post__content" v-html="project.content" />
                <div v-if="project.acf && (project.acf.project_url || project.acf.github)" class="post__buttons buttonsContainer">
                  <a v-if="project.acf.project_url" class="btn" :href="project.acf.project_url">View project</a>
                  <a v-if="project.acf.github" class="btn" :href="project.acf.github">View repo</a>
                </div>
                <ClientOnly>
                  <GalexiaShare :title="$nuxt.$options.head.titleTemplate.replace('%s', project.title)" :description="project.excerpt.plain" />
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
          <Navigation post-type="projects" next-post-text="Next Project" previous-post-text="Previous Project" :show-post-name="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Navigation from '~/components/posts/navigation'
import TechStack from '~/components/global/techStack'

export default {
  components: {
    Navigation,
    TechStack
  },
  head () {
    const meta = []
    let title = ''
    if (this.project) {
      if (this.project.title) {
        title = this.project.title
        meta.push({ hid: 'og:title', property: 'og:title', content: this.project.title })
        meta.push({ hid: 'twitter:title', name: 'twitter:title', content: this.project.title })
      }
      if (this.project.excerpt.plain) {
        meta.push({ hid: 'description', name: 'description', content: this.project.excerpt.plain })
        meta.push({ hid: 'og:description', property: 'og:description', content: this.project.excerpt.plain })
        meta.push({ hid: 'twitter:description', name: 'twitter:description', content: this.project.excerpt.plain })
      }
      if (this.project.featured_media) {
        meta.push({ hid: 'og:image', property: 'og:image', content: this.project.featured_media })
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
      'projects'
    ]),
    project () {
      return this.projects.flat().find((item) => item.slug === this.$route.params.slug)
    }
  },
  created () {
    if (!this.project) {
      this.$nuxt.context.error({ statusCode: 404, message: 'Project not found' })
    }
  },
  mounted () {
    this.registerCopyToClipboardContainers()
  }
}
</script>
