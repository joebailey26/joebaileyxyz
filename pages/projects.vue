<template>
  <div>
    <header class="page-header">
      <div class="container ml-auto mr-auto page-header__wrapper">
        <div class="row">
          <div class="col-md-8 ml-auto mr-auto page-header__content">
            <h1 class="page-header__title">
              Projects
            </h1>
            <p class="page-header__description">
              Some loose notes on tech demonstrations and projects that I have created.
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
                <template v-for="project in projects">
                  <article :id="project.slug" :key="project.title" class="post-index__post">
                    <header class="post__header">
                      <h2 class="post__title" v-html="project.title" />
                      <TechStack class="post__tech-stack" :tech-stack="project.acf.icons" />
                    </header>
                    <div class="post__content" v-html="project.content" />
                    <div class="post__buttons buttonsContainer">
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
  computed: {
    ...mapState([
      'projects'
    ])
  },
  head () {
    return {
      title: 'Projects',
      meta: [
        { hid: 'description', name: 'description', content: 'Some loose notes on tech demonstrations and projects that I have created.' },
        { hid: 'og:title', property: 'og:title', content: 'Projects' },
        { hid: 'og:description', property: 'og:description', content: 'Some loose notes on tech demonstrations and projects that I have created.' },
        { hid: 'twitter:title', name: 'twitter:title', content: 'Projects' },
        { hid: 'twitter:description', name: 'twitter:description', content: 'Some loose notes on tech demonstrations and projects that I have created.' }
      ]
    }
  }
}
</script>
