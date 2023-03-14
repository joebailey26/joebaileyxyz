<template>
  <section id="section-projects" class="section section-projects">
    <h2 class="text-center title">
      <nuxt-link to="projects">
        Projects
      </nuxt-link>
    </h2>
    <Items :items="projects.slice(0, 6)" link-prefix="projects" :show-links="false" />
    <Git />
  </section>
</template>

<script>
import { mapState } from 'vuex'
import Git from '~/components/home/git'
import Items from '~/components/home/items'

export default {
  components: {
    Git,
    Items
  },
  computed: {
    ...mapState(['projects'])
  }
}
</script>
