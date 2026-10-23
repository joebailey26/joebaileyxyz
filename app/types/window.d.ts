interface TurnstileRenderOptions {
  sitekey: string
  action?: string
  size?: 'normal' | 'flexible' | 'compact'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'timeout-callback'?: () => void
  'error-callback'?: () => void
}

// The part of Cloudflare's Turnstile API that the contact form uses.
interface Turnstile {
  render (container: HTMLElement, options: TurnstileRenderOptions): string
  reset (widgetId: string): void
  remove (widgetId: string): void
}

interface Window {
  // Set by the inline script in nuxt.config.ts before the page paints.
  darkmode: boolean
  turnstile?: Turnstile
}
