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
    line-height: 1.25
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
    scroll-snap-stop: always
  }
}
@include dark-theme {
  article {
    .info-title {
      color: white
    }
    @media (max-width: 768px) {
      background-color: var(--dark-grey);
      border-color: white
    }
  }
}
</style>

<template>
  <article>
    <h3 class="info-title">
      <NuxtLink v-if="showLink" :to="link">
        {{ item.title }}
      </NuxtLink>
      <span v-else v-text="item.title" />
    </h3>
    <LayoutTechStack v-if="item.acf && item.acf.icons && showTechStack" :tech-stack="item.acf.icons" />
    <p v-text="item.excerpt.plain" />
    <div class="buttonsContainer">
      <NuxtLink v-if="showLink" :to="link" class="btn">
        Continue Reading
      </NuxtLink>
      <a v-if="item.acf && item.acf.project_url" class="btn" :href="item.acf.project_url" target="_blank">View project</a>
      <a v-if="item.acf && item.acf.github" class="btn" :href="item.acf.github" target="_blank">View repo</a>
    </div>
  </article>
</template>

<script>
export default {
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
