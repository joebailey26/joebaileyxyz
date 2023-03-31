<template>
  <picture>
    <source type="image/avif" :srcset="avif" :width="width" :height="height">
    <source type="image/webp" :srcset="webp" :width="width" :height="height">
    <img
      :src="src"
      :decoding="decoding"
      :loading="loading"
      :alt="alt"
      :width="width"
      :height="height"
      :fetchpriority="fetchpriority"
    >
  </picture>
</template>

<script>
export default {
  name: 'GalexiaImage',
  props: {
    src: {
      type: Object,
      required: true
    },
    webp: {
      type: Object,
      required: true
    },
    avif: {
      type: Object,
      required: true
    },
    width: {
      type: [Number, String],
      default: 'auto'
    },
    height: {
      type: [Number, String],
      default: 'auto'
    },
    loading: {
      type: String,
      default: 'lazy'
    },
    decoding: {
      type: String,
      default: 'async'
    },
    fetchpriority: {
      type: String,
      default: 'auto'
    },
    alt: {
      type: String,
      default: ''
    }
  }
}
</script>
