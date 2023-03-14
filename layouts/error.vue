<style lang="scss" scoped>
.error {
  padding-top: 5rem;
  text-align: center;
  h1 {
    font-size: clamp(1.75rem, 1vw + 1rem, 3rem)
  }
  .btn {
    margin-top: 2rem;
    margin-right: auto;
    margin-left: auto;
    font-size: 1rem
  }
}
</style>

<template>
  <main class="error">
    <div v-if="error.statusCode === 404">
      <h1>
        404 - Page not found
      </h1>
      <a class="btn" href="/">Go back home</a>
    </div>
    <div v-else>
      <h1>
        {{ error.statusCode }} - An error occurred
      </h1>
      <p>{{ message }}</p>
    </div>
  </main>
</template>

<script>
export default {
  name: 'NuxtError',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  computed: {
    statusCode () {
      return (this.error && this.error.statusCode) || 500
    },
    message () {
      return this.error.message
    }
  },
  head () {
    return {
      title: this.message
    }
  }
}
</script>
