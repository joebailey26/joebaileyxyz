<style lang="scss" scoped>
.error {
  padding-top: 5rem;
  text-align: center;
  .error-container {
    padding-right: 1rem;
    padding-left: 1rem
  }
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
  <NuxtLayout>
    <main class="error">
      <div v-if="statusCode === 404" class="error-container">
        <h1>
          404 - Page not found
        </h1>
        <a class="btn" href="/">Go back home</a>
      </div>
      <div v-else>
        <h1>
          {{ statusCode }} - An error occurred
        </h1>
        <p>{{ message }}</p>
      </div>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = withDefaults(defineProps<{
  error?: NuxtError | null
}>(), {
  error: null
})

const statusCode = computed(() => props.error?.status || props.error?.statusCode || 500)
const message = computed(() => props.error?.message || 'Error')

useHead({
  title: message
})
</script>
