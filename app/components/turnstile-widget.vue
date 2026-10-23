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

<script lang="ts">
let loading: Promise<Turnstile> | null

function loadTurnstile (): Promise<Turnstile> {
  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }
  if (!loading) {
    loading = new Promise<Turnstile>((resolve, reject) => {
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
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  siteKey?: string
}>(), {
  siteKey: ''
})

const emit = defineEmits<{
  token: [token: string]
}>()

const widget = useTemplateRef<HTMLElement>('widget')
const widgetId = ref<string | null>(null)
const error = ref('')
let disposed = false

async function renderWidget () {
  if (!props.siteKey) {
    error.value = 'Contact form is temporarily unavailable. Please email joe@joebailey.xyz.'
    return
  }
  try {
    const turnstile = await loadTurnstile()
    if (disposed || !widget.value) {
      return
    }
    widgetId.value = turnstile.render(widget.value, {
      sitekey: props.siteKey,
      action: 'contact',
      size: 'flexible',
      callback: (token) => {
        error.value = ''
        emit('token', token)
      },
      'expired-callback': () => reset(),
      'timeout-callback': () => reset(),
      'error-callback': () => {
        emit('token', '')
        error.value = 'Spam check could not complete. Please retry.'
      }
    })
  } catch {
    if (!disposed) {
      error.value = 'Spam check could not load. Please retry or email joe@joebailey.xyz.'
    }
  }
}

function reset () {
  emit('token', '')
  error.value = ''
  if (widgetId.value !== null && window.turnstile) {
    window.turnstile.reset(widgetId.value)
  }
}

function retry () {
  reset()
  if (widgetId.value === null) {
    renderWidget()
  }
}

onMounted(renderWidget)

onBeforeUnmount(() => {
  disposed = true
  if (widgetId.value !== null && window.turnstile) {
    window.turnstile.remove(widgetId.value)
  }
})

// The contact form resets the check after each submission.
defineExpose({ reset })
</script>
