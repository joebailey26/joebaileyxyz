<template>
  <section id="section-projects" class="section section-projects">
    <h2 class="text-center title">
      <NuxtLink to="/projects/">
        Projects
      </NuxtLink>
    </h2>
    <HomeItems :items="projects[0].slice(0, 6)" link-prefix="projects" />
    <HomeGit />
  </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['projects'])
  }
}
</script>
