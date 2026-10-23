<style>
.share-button-group {
  display: flex;
  flex-wrap: wrap;
  column-gap: .5rem;
  row-gap: 1rem
}
</style>

<template>
  <div class="share">
    <h4 class="share-title">
      Share:
    </h4>
    <div v-if="!nativeShareEnabled" class="share-button-group">
      <a
        v-for="network in networks"
        :key="network.name"
        class="share-button share-button--social"
        :href="network.href"
        target="_blank"
        rel="noopener noreferrer"
        @click.prevent="openPopup(network.href)"
      >
        <FontAwesomeIcon :icon="['fab', network.icon]" /> {{ network.name }}
      </a>
    </div>
    <a v-else class="share-button share-button--native" href="javascript:void(0)" @click="nativeShare">
      <FontAwesomeIcon :icon="['fas', 'share-alt']" /> Share this
    </a>
  </div>
</template>

<script setup>
// Stands in for nuxt-component-share, which only has a Vue 2 build (vue-social-sharing 3,
// vue-fontawesome 2). Same markup, classes and networks, without the extra dependencies.
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
})

const route = useRoute()
const url = computed(() => (import.meta.client ? window.location.origin + route.fullPath : ''))
const shareObject = computed(() => ({ title: props.title, text: props.description, url: url.value }))

const nativeShareEnabled = computed(() => {
  if (!import.meta.client) {
    return false
  }
  try {
    return navigator.canShare(shareObject.value)
  } catch {
    return false
  }
})

const networks = computed(() => {
  const u = encodeURIComponent(url.value)
  const t = encodeURIComponent(props.title)
  const d = encodeURIComponent(props.description)

  return [
    { name: 'Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}&title=${t}&description=${d}` },
    { name: 'LinkedIn', icon: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: 'Twitter', icon: 'twitter', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { name: 'WhatsApp', icon: 'whatsapp', href: `https://api.whatsapp.com/send?text=${t}%0D%0A${u}%0D%0A${d}` }
  ]
})

function openPopup (href) {
  const width = 626
  const height = 436
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2
  window.open(href, 'sharer', `width=${width},height=${height},left=${left},top=${top}`)
}

function nativeShare () {
  navigator.share(shareObject.value)
}
</script>
