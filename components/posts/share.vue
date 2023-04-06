<template>
  <div class="share">
    <h4 class="share-title">
      Share:
    </h4>
    <template v-if="!nativeShareEnabled">
      <div class="share-button-group">
        <ShareNetwork
          v-for="social in socials"
          :key="social"
          :network="social"
          :url="fullUrl"
          :title="title"
          :description="excerpt"
          :media="media"
          class="share-button share-button--social"
        >
          <font-awesome-icon :icon="['fab', social.toLowerCase()]" /> {{ social }}
        </ShareNetwork>
      </div>
    </template>
    <template v-else>
      <a class="share-button share-button--native" href="javascript:void(0)" @click="navigator.share(shareObject)">
        <font-awesome-icon :icon="['fas', 'share-alt']" /> Share this blog post
      </a>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    excerpt: {
      type: String,
      required: true
    },
    media: {
      type: String,
      default: ''
    },
    socials: {
      type: Array,
      default: () => {
        return ['Facebook', 'LinkedIn', 'Twitter', 'WhatsApp']
      }
    }
  },
  computed: {
    shareObject () {
      return {
        title: this.$nuxt.$options.head.titleTemplate.replace('%s', this.title),
        text: this.excerpt.replaceAll('<p>', '').replaceAll('</p>', '').replaceAll('[&hellip;]', '').replaceAll('\n', ''),
        url: this.fullUrl
      }
    },
    fullUrl () {
      return process.client ? window.location.origin + this.$nuxt.$route.fullPath : ''
    },
    nativeShareEnabled () {
      if (!process.client) {
        return false
      }
      try {
        return navigator.canShare(this.shareObject)
      } catch (e) {
        return false
      }
    }
  }
}

</script>
