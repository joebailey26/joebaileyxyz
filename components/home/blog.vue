<template>
  <section id="section-blog" class="section section-blog">
    <h2 class="text-center title">
      <nuxt-link to="/blog/">
        Blog
      </nuxt-link>
    </h2>
    <Items :items="blogPosts[0].slice(0, 6)" link-prefix="blog" :show-tech-stack="false" />
  </section>
</template>

<script>
import { mapState } from 'vuex'
import Items from '~/components/home/items'

export default {
  components: {
    Items
  },
  computed: {
    ...mapState([
      'blogPosts'
    ])
  }
}
</script>
