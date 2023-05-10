<style lang="scss" scoped>
@import '~assets/scss/mixins';
article {
  display: grid;
  gap: 1rem;
  max-width: 100%;
  .info-title {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 1.125rem;
    line-height: 1.25;
    @include dark-theme {
      color: white
    }
  }
  @supports selector(:has(+ * )) {
    grid-template-rows: max-content 1fr calc(5.6em + 1rem);
    &:has(.tech-stack) {
      grid-template-rows: max-content min-content 1fr calc(5.6em + 1rem)
    }
  }
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 100px;
    margin-left: 0;
    padding: 20px;
    background-color: white;
    border: 1px solid var(--grey);
    border-radius: 4px;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    @include dark-theme {
      background-color: var(--dark-grey);
      border-color: white
    }
  }
}
</style>

<template>
  <article>
    <h3 class="info-title">
      <nuxt-link v-if="showLink" :to="link" v-html="item.title" />
      <span v-else v-html="item.title" />
    </h3>
    <TechStack v-if="item.acf && item.acf.icons && showTechStack" :tech-stack="item.acf.icons" />
    <div v-html="item.excerpt" />
    <div class="buttonsContainer">
      <nuxt-link v-if="showLink" :to="link" class="btn">
        Continue Reading
      </nuxt-link>
      <a v-if="item.acf && item.acf.project_url" class="btn" :href="item.acf.project_url" target="_blank">View project</a>
      <a v-if="item.acf && item.acf.github" class="btn" :href="item.acf.github" target="_blank">View repo</a>
    </div>
  </article>
</template>

<script>
import TechStack from '~/components/global/techStack'

export default {
  components: {
    TechStack
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    linkPrefix: {
      type: String,
      required: true
    },
    showLink: {
      type: Boolean,
      default: true
    },
    showTechStack: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    link () {
      return `/${this.linkPrefix}/${this.item.slug}/`
    }
  }
}
</script>
