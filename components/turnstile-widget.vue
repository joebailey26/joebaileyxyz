<template>
  <div>
    <div ref="widget" />
    <p v-if="error" role="status">
      {{ error }}
      <button v-if="siteKey" class="btn" type="button" @click="retry">
        Retry spam check
      </button>
    </p>
  </div>
</template>

<script>
let loading

function loadTurnstile () {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      const fail = () => {
        clearTimeout(timeout)
        script.remove()
        loading = null
        reject(new Error('Turnstile could not load'))
      }
      const timeout = setTimeout(fail, 15000)
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      // Turnstile rejects ready() when the script has async/defer, and script
      // elements created from JS are async by default, so opt out explicitly.
      script.async = false
      script.onload = () => {
        if (!window.turnstile) {
          fail()
          return
        }
        clearTimeout(timeout)
        resolve(window.turnstile)
      }
      script.onerror = fail
      document.head.appendChild(script)
    })
  }
  return loading
}

export default {
  props: {
    siteKey: { type: String, default: '' }
  },
  data () {
    return { widgetId: null, error: '', disposed: false }
  },
  mounted () {
    this.renderWidget()
  },
  beforeDestroy () {
    this.disposed = true
    if (this.widgetId !== null && window.turnstile) {
      window.turnstile.remove(this.widgetId)
    }
  },
  methods: {
    async renderWidget () {
      if (!this.siteKey) {
        this.error = 'Contact form is temporarily unavailable. Please email joe@joebailey.xyz.'
        return
      }
      try {
        const turnstile = await loadTurnstile()
        if (this.disposed) {
          return
        }
        this.widgetId = turnstile.render(this.$refs.widget, {
          sitekey: this.siteKey,
          action: 'contact',
          size: 'flexible',
          callback: (token) => {
            this.error = ''
            this.$emit('token', token)
          },
          'expired-callback': () => this.reset(),
          'timeout-callback': () => this.reset(),
          'error-callback': () => {
            this.$emit('token', '')
            this.error = 'Spam check could not complete. Please retry.'
          }
        })
      } catch {
        if (!this.disposed) {
          this.error = 'Spam check could not load. Please retry or email joe@joebailey.xyz.'
        }
      }
    },
    reset () {
      this.$emit('token', '')
      this.error = ''
      if (this.widgetId !== null && window.turnstile) {
        window.turnstile.reset(this.widgetId)
      }
    },
    retry () {
      this.reset()
      if (this.widgetId === null) {
        this.renderWidget()
      }
    }
  }
}
</script>
