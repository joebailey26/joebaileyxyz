<style lang="scss" scoped>
  .navigation {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    &:first-of-type {
      margin-bottom: 30px
    }
    &:last-of-type {
      margin-top: 30px
    }
    .navIndex {
      display: block;
      text-align: center
    }
    .next {
      justify-self: end;
      text-align: right
    }
  }

  @media (max-width: 992px) {
    .navigation {
      grid-gap: 1em;
      grid-template-rows: repeat(3, 1fr);
      grid-template-columns: 1fr;
      text-align: center;
      .next,
      .previous {
        justify-self: center;
        text-align: center
      }
      &:first-of-type {
        margin-bottom: 40px
      }
      &:last-of-type {
        margin-top: 40px;
        margin-bottom: 0
      }
    }
  }
  @media (max-width: 768px) {
    .navigation:last-of-type {
      margin-bottom: 60px
    }
  }
  @media (max-width: 576px) {
    .navigation {
      grid-gap: 0;
      &:first-of-type {
        margin-bottom: 24px
      }
      &:last-of-type {
        margin-top: 24px
      }
    }
  }
</style>

<template>
  <div class="navigation">
    <span class="previous"><nuxt-link :to="`blog/${post.previous.slug}`" class="previous">
      <strong>Previous Article </strong>
      <span v-html="post.previous.title" />
    </nuxt-link></span>
    <span class="navIndex"><nuxt-link to="blog">Back to Blog</nuxt-link></span>
    <span class="next"><nuxt-link :to="`blog/${post.next.slug}`" class="next">
      <strong>Next Article </strong>
      <span v-html="post.next.title" />
    </nuxt-link></span>
  </div>
</template>
