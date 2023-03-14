<style lang="scss" scoped>
article {
  display: grid;
  grid-template-rows: max-content 1fr min-content;
  gap: 1rem;
  max-width: 100%;
  .info-title {
    margin-top: 0;
    margin-bottom: 0;
    font-size: 1.125rem;
    line-height: 1.25;
    @media (prefers-color-scheme: dark) {
      color: white
    }
  }
  &:has(.tech-stack) {
    grid-template-rows: max-content min-content 1fr min-content
  }
  @media (max-width: 768px) {
    margin-right: 15px;
    margin-bottom: 100px;
    margin-left: 15px;
    padding: 20px;
    background-color: white;
    border: 1px solid var(--grey);
    border-radius: 4px;
    scroll-snap-align: center;
    scroll-snap-stop: always;
    @media (prefers-color-scheme: dark) {
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
    <TechStack v-if="item.acf && item.acf.icons" :tech-stack="item.acf.icons" />
    <div v-html="item.excerpt" />
    <div class="buttonsContainer">
      <a v-if="item.acf && item.acf.project_url" class="btn" :href="item.acf.project_url">View the project</a>
      <a v-if="item.acf && item.acf.github" class="btn" :href="item.acf.github">View on GitHub</a>
      <nuxt-link v-if="!item.acf || (item.acf && (!item.acf.github && !item.acf.project_url))" :to="link" class="btn">
        Continue Reading
      </nuxt-link>
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
      default () {
        return {}
      }
    },
    linkPrefix: {
      type: String,
      default: ''
    },
    showLink: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    link () {
      return `/${this.linkPrefix}/${this.item.slug}`
    }
  }
}
</script>
