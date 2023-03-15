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
              <div class="post-index__loop">
                <template v-for="project in projects">
                  <article :id="project.slug" :key="project.title" class="post-index__post">
                    <header class="post__header">
                      <h2 class="post__title">
                        <nuxt-link :to="`/projects/${project.slug}/`" v-html="project.title" />
                      </h2>
                      <TechStack class="post__tech-stack" :tech-stack="project.acf.icons" />
                    </header>
                    <div class="post__content" v-html="project.excerpt" />
                    <div class="post__buttons buttonsContainer">
                      <nuxt-link class="btn" :to="`/projects/${project.slug}/`">
                        Continue Reading
                      </nuxt-link>
                      <a v-if="project.acf.project_url" class="btn" :href="project.acf.project_url">View the project</a>
                      <a v-if="project.acf.github" class="btn" :href="project.acf.github">View on GitHub</a>
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
import TechStack from '~/components/global/techStack'

export default {
  components: {
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
  computed: {
    ...mapState([
      'projects'
    ])
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
