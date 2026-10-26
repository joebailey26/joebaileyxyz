import assert from 'node:assert/strict'
import { test, type TestContext } from 'node:test'
import { useContactForm } from '../../app/composables/useContactForm.ts'
import { useTurnstileWidget, type Turnstile } from '../../app/composables/useTurnstileWidget.ts'

// Node has no window or document; give each test its own stand-ins.
function stubGlobals (t: TestContext, globals: Record<string, unknown>) {
  Object.assign(globalThis, globals)
  t.after(() => {
    for (const key of Object.keys(globals)) {
      Reflect.deleteProperty(globalThis, key)
    }
  })
}

function widget (t: TestContext, siteKey = 'public-test-key') {
  const tokens: string[] = []
  const api = {
    render: t.mock.fn<Turnstile['render']>(() => 'widget-1'),
    reset: t.mock.fn(),
    remove: t.mock.fn()
  }
  stubGlobals(t, { window: { turnstile: api } })
  // The widget is never inspected, so any element will do.
  const loaded = useTurnstileWidget({ siteKey, container: {} as HTMLElement, onToken: (token) => tokens.push(token) })

  return { widget: loaded, api, tokens }
}

test('widget issues tokens, clears expired tokens, retries, and cleans up on navigation', async (t) => {
  const { widget: turnstile, api, tokens } = widget(t)
  await turnstile.renderWidget()
  const options = api.render.mock.calls[0].arguments[1]
  assert.equal(options.action, 'contact')
  options.callback('solved-token')
  assert.equal(tokens.at(-1), 'solved-token')
  options['expired-callback']()
  assert.equal(tokens.at(-1), '')
  assert.equal(api.reset.mock.callCount(), 1)
  options['error-callback']()
  assert.ok(turnstile.error.value)
  assert.equal(tokens.at(-1), '')
  turnstile.retry()
  assert.equal(turnstile.error.value, '')
  assert.equal(api.reset.mock.callCount(), 2)
  turnstile.dispose()
  assert.equal(api.remove.mock.calls[0].arguments[0], 'widget-1')
})

test('widget does not render after navigating away while the script loads', async (t) => {
  const { widget: turnstile, api } = widget(t)
  const pending = turnstile.renderWidget()
  turnstile.dispose()
  await pending
  assert.equal(api.render.mock.callCount(), 0)
})

test('missing public key leaves an email fallback and never renders', async (t) => {
  const { widget: turnstile, api } = widget(t, '')
  await turnstile.renderWidget()
  assert.match(turnstile.error.value, /joe@joebailey.xyz/)
  assert.equal(api.render.mock.callCount(), 0)
})

test('a blocked script can be retried successfully', async (t) => {
  const api = { render: t.mock.fn(() => 'widget-2') }
  const browserWindow: { turnstile?: typeof api } = {}
  let attempts = 0
  stubGlobals(t, {
    window: browserWindow,
    document: {
      createElement: () => ({ remove () {} }),
      head: {
        appendChild (script: { onerror: () => void, onload: () => void }) {
          queueMicrotask(() => {
            if (++attempts === 1) {
              script.onerror()
            } else {
              browserWindow.turnstile = api
              script.onload()
            }
          })
        }
      }
    }
  })
  const turnstile = useTurnstileWidget({ siteKey: 'public-test-key', container: {} as HTMLElement, onToken () {} })
  await turnstile.renderWidget()
  assert.match(turnstile.error.value, /could not load/)
  await turnstile.renderWidget()
  assert.equal(api.render.mock.callCount(), 1)
})

function contact (t: TestContext, ok = true) {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Please retry verification' }, { status: ok ? 200 : 400 }))
  const reset = t.mock.fn()
  // FormData cannot read the stand-in form element, so start every body empty.
  t.mock.property(globalThis, 'FormData', class extends FormData {
    // Drops the form element argument
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor () {
      super()
    }
  })
  // Only reportValidity() is called before the body is built.
  const form = useContactForm({ formElement: { reportValidity: () => true } as HTMLFormElement, turnstile: { reset } })
  form.form.value = { name: 'Visitor', email: 'visitor@example.com', message: 'Hello' }

  return { form, fetch, reset }
}

test('contact requires all fields and a solved token before sending', async (t) => {
  const { form, fetch } = contact(t)
  await form.submit()
  assert.equal(fetch.mock.callCount(), 0)
  form.turnstileToken.value = 'solved-token'
  form.form.value.name = '  '
  assert.equal(form.canSubmit.value, false)
  form.form.value.name = 'Visitor'
  assert.equal(form.canSubmit.value, true)
})

test('successful contact includes the token, prevents double submits, and refreshes verification', async (t) => {
  const { form, fetch, reset } = contact(t)
  form.turnstileToken.value = 'solved-token'
  const pending = form.submit()
  await form.submit()
  await pending
  assert.equal(fetch.mock.callCount(), 1)
  const body = fetch.mock.calls[0].arguments[1]?.body
  assert.ok(body instanceof FormData)
  assert.equal(body.get('cf-turnstile-response'), 'solved-token')
  assert.equal(form.form.value.message, '')
  assert.equal(form.sending.value, false)
  assert.match(String(form.submitted.value), /successfully/)
  assert.equal(reset.mock.callCount(), 1)
})

test('failed contact retains the draft and refreshes the consumed token for retry', async (t) => {
  const { form, reset } = contact(t, false)
  form.turnstileToken.value = 'solved-token'
  await form.submit()
  assert.equal(form.form.value.message, 'Hello')
  assert.equal(form.sending.value, false)
  assert.match(String(form.submitted.value), /Please try again/)
  assert.equal(reset.mock.callCount(), 1)
})
