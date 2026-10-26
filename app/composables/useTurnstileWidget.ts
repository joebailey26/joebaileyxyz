import { ref, toValue, type MaybeRefOrGetter } from 'vue'

// The parts of Cloudflare Turnstile's explicit rendering API that the contact form uses.
interface TurnstileRenderOptions {
  sitekey: string
  action: string
  size: 'normal' | 'compact' | 'flexible'
  callback: (token: string) => void
  'expired-callback': () => void
  'timeout-callback': () => void
  'error-callback': () => void
}

export interface Turnstile {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let loading: Promise<Turnstile> | null = null

export function loadTurnstile (): Promise<Turnstile> {
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

interface TurnstileWidgetOptions {
  siteKey: MaybeRefOrGetter<string>
  container: MaybeRefOrGetter<HTMLElement | null>
  onToken: (token: string) => void
}

// Renders the contact form's Turnstile widget; tokens (or '' once a token is no longer usable) go to onToken.
export function useTurnstileWidget ({ siteKey, container, onToken }: TurnstileWidgetOptions) {
  const error = ref('')
  let widgetId: string | null = null
  let disposed = false

  function reset () {
    onToken('')
    error.value = ''
    if (widgetId !== null && window.turnstile) {
      window.turnstile.reset(widgetId)
    }
  }

  async function renderWidget () {
    if (!toValue(siteKey)) {
      error.value = 'Contact form is temporarily unavailable. Please email joe@joebailey.xyz.'

      return
    }
    try {
      const turnstile = await loadTurnstile()
      const element = toValue(container)
      if (disposed || !element) {
        return
      }
      widgetId = turnstile.render(element, {
        sitekey: toValue(siteKey),
        action: 'contact',
        size: 'flexible',
        callback: (token) => {
          error.value = ''
          onToken(token)
        },
        'expired-callback': () => reset(),
        'timeout-callback': () => reset(),
        'error-callback': () => {
          onToken('')
          error.value = 'Spam check could not complete. Please retry.'
        }
      }) ?? null
    } catch {
      if (!disposed) {
        error.value = 'Spam check could not load. Please retry or email joe@joebailey.xyz.'
      }
    }
  }

  function retry () {
    reset()
    if (widgetId === null) {
      renderWidget()
    }
  }

  // Called before unmounting; a script that is still loading then never renders a widget.
  function dispose () {
    disposed = true
    if (widgetId !== null && window.turnstile) {
      window.turnstile.remove(widgetId)
    }
  }

  return { error, renderWidget, reset, retry, dispose }
}
