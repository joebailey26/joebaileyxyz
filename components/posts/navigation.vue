<style lang="scss" scoped>
  .navigation-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    color: var(--grey);
    :any-link {
      color: var(--grey);
      &:hover {
        color: var(--green)
      }
      @media (prefers-color-scheme: dark) {
        color: white;
        &:hover {
          color: var(--light-green)
        }
      }
    }
    .navigation-item {
      width: min(250px, calc(50% - .5rem))
    }
    .navigation-link__arrow-wrapper {
      display: flex;
      gap: .5rem;
      align-items: center;
      margin-bottom: .25rem
    }
    .navigation-link__title {
      font-weight: 700
    }
    .navigation-link__article-name {
      margin-top: 1rem;
      font-weight: 400
    }
    .next {
      text-align: right;
      .navigation-link__arrow-wrapper {
        justify-content: end
      }
    }
  }
</style>

<template>
  <div class="navigation-wrapper">
    <div class="navigation-item previous">
      <nuxt-link v-if="previousPage" :to="`/${postType}/${previousPage.slug}/`" class="navigation-link">
        <div class="navigation-link__arrow-wrapper">
          <font-awesome-icon :icon="['fa-solid', 'fa-long-arrow-alt-left']" class="navigation-link__icon" />
          <span class="navigation-link__title" v-html="previousPostText" />
        </div>
        <span v-if="showPostName" class="navigation-link__article-name" v-text="previousPage.title" />
      </nuxt-link>
    </div>
    <div class="navigation-item next">
      <nuxt-link v-if="nextPage" :to="`/${postType}/${nextPage.slug}/`" class="navigation-link">
        <div class="navigation-link__arrow-wrapper">
          <span class="navigation-link__title" v-html="nextPostText" />
          <font-awesome-icon :icon="['fa-solid', 'fa-long-arrow-alt-right']" class="navigation-link__icon" />
        </div>
        <span v-if="showPostName" class="navigation-link__article-name" v-text="nextPage.title" />
      </nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    postType: {
      type: String,
      required: true
    },
    nextPostText: {
      type: String,
      required: true
    },
    previousPostText: {
      type: String,
      required: true
    },
    showPostName: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    flattenedPosts () {
      return this.$store.state[this.postType].flat()
    },
    postIndex () {
      return this.flattenedPosts.findIndex((item) => item.slug === this.$route.params.slug)
    },
    previousPage () {
      const previous = this.flattenedPosts[this.postIndex - 1]
      if (!previous) {
        return false
      }
      return previous
    },
    nextPage () {
      const next = this.flattenedPosts[this.postIndex + 1]
      if (!next) {
        return false
      }
      return next
    }
  }
}
</script>
