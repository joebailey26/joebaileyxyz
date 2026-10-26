import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

export interface ContactFormFields {
  name: string
  email: string
  message: string
}

interface ContactFormOptions {
  formElement: MaybeRefOrGetter<HTMLFormElement | null>
  // The Turnstile widget, reset after every attempt
  turnstile: MaybeRefOrGetter<{ reset: () => void } | null>
}

const fields: (keyof ContactFormFields)[] = ['name', 'email', 'message']

const errorMessage =(body: unknown) => (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string' ? body.error : '')

// The contact form's draft, kept in localStorage, and its submission to the Worker's /api/contact.
export function useContactForm ({ formElement, turnstile }: ContactFormOptions) {
  const submitted = ref<string | false>(false)
  const sending = ref(false)
  const turnstileToken = ref('')
  const form = ref<ContactFormFields>({
    name: '',
    email: '',
    message: ''
  })

  const canSubmit = computed(() => !sending.value && !!turnstileToken.value &&
    !!form.value.name.trim() && !!form.value.email.trim() && !!form.value.message.trim())

  watch(form, (value) => {
    try {
      localStorage.setItem('contactForm', JSON.stringify(value))
    } catch {
      // Storage can be unavailable; the draft is then not kept
    }
  }, { deep: true })

  // Called once mounted, as storage is only in the browser.
  function restoreDraft () {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('contactForm') ?? 'null')
      if (typeof saved !== 'object' || saved === null) {
        return
      }
      for (const key of fields) {
        const value: unknown = Reflect.get(saved, key)
        if (typeof value === 'string') {
          form.value[key] = value
        }
      }
    } catch {
      // Storage can be unavailable or hold an invalid draft
    }
  }

  async function submit () {
    const element = toValue(formElement)
    if (!canSubmit.value || !element?.reportValidity()) {
      return
    }
    sending.value = true
    submitted.value = false
    try {
      const body = new FormData(element)
      body.set('cf-turnstile-response', turnstileToken.value)
      const response = await fetch('/api/contact', {
        method: 'POST',
        body
      })
      if (!response.ok) {
        throw new Error(errorMessage(await response.json().catch(() => ({}))) || `HTTP ${response.status}`)
      }
      form.value = { name: '', email: '', message: '' }
      submitted.value = 'Message sent successfully! We\'ll be in touch within 2-3 working days'
    } catch (e) {
      submitted.value = `${String(e)} Please try again.`
    } finally {
      sending.value = false
      // Tokens are single-use, including when email delivery fails after verification.
      toValue(turnstile)?.reset()
    }
  }

  return { submitted, sending, turnstileToken, form, canSubmit, restoreDraft, submit }
}
