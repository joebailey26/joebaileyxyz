<template>
  <section id="section-blog" class="section section-blog">
    <h2 class="text-center title">
      <NuxtLink to="/blog/">
        Blog
      </NuxtLink>
    </h2>
    <HomeItems :items="blog[0].slice(0, 6)" link-prefix="blog" :show-tech-stack="false" />
  </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'blog'
    ])
  }
}
</script>
