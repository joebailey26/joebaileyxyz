import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test, type TestContext } from 'node:test'
import type { Env } from '../index.ts'
import { EmailMessage } from './cloudflare-email.ts'

// Only replace the Workers-only email constructor; exercise the real request handler.
// The handler itself is tested in @joebailey26/turnstile-forms; these cover the site's route and form.
const hooks = registerHooks({
  resolve (specifier, context, next) {
    if (specifier === 'cloudflare:email') {
      return { url: new URL('./cloudflare-email.ts', import.meta.url).href, shortCircuit: true }
    }

    return next(specifier, context)
  }
})
const { default: worker } = await import('../index.ts')
hooks.deregister()

function request (fields: Record<string, string> = { name: 'Test Visitor', email: 'visitor@example.com', message: 'A contact message' }, options: RequestInit<IncomingRequestCfProperties> = {}) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    body.set(key, value)
  }
  body.set('cf-turnstile-response', 'valid-token')

  // Typed as an incoming request, as the Worker's fetch handler receives
  return new Request<unknown, IncomingRequestCfProperties>('https://joebailey.xyz/api/contact', { method: 'POST', body, ...options })
}

function setup (t: TestContext) {
  const send = t.mock.fn<(message: unknown) => Promise<unknown>>(async () => ({ messageId: 'test-message' }))
  const verify = t.mock.method(globalThis, 'fetch', async () => Response.json({ success: true, action: 'contact', hostname: 'joebailey.xyz' }))
  const env = {
    ASSETS: { fetch: async () => new Response('asset') },
    TURNSTILE_SECRET_KEY: 'private-test-key',
    CONTACT_FROM: 'contact@joebailey.xyz',
    CONTACT_EMAIL: { send }
  } satisfies Env

  return { send, verify, env }
}

const decode = (raw: string) => new TextDecoder().decode(Uint8Array.from(atob(raw.split('\r\n\r\n')[1]?.replace(/\r\n/g, '') ?? ''), (c) => c.charCodeAt(0)))

test('a verified contact message is emailed to joe@joebailey.xyz', async (t) => {
  const { env, send, verify } = setup(t)
  const response = await worker.fetch(request({ name: 'Test Visitor', email: 'visitor@example.com', message: 'A contact message', extra: 'Not emailed' }), env)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true })
  assert.equal(verify.mock.callCount(), 1)
  const [message] = send.mock.calls[0]?.arguments ?? []
  assert.ok(message instanceof EmailMessage)
  assert.equal(message.from, 'contact@joebailey.xyz')
  assert.equal(message.to, 'joe@joebailey.xyz')
  assert.match(message.raw, /^From: Website <contact@joebailey.xyz>/)
  assert.match(message.raw, /Reply-To: visitor@example.com/)
  assert.ok(message.raw.includes(`Subject: =?UTF-8?B?${btoa('Message from Test Visitor')}?=`))
  assert.equal(decode(message.raw), 'Contact form from Test Visitor\n\nName:\nTest Visitor\n\nEmail:\nvisitor@example.com\n\nMessage:\nA contact message\n')
})

test('the name, email and message are all required', async (t) => {
  const { env, send } = setup(t)
  for (const missing of ['name', 'email', 'message']) {
    const fields: Record<string, string> = { name: 'Test Visitor', email: 'visitor@example.com', message: 'A contact message' }
    Reflect.deleteProperty(fields, missing)
    assert.equal((await worker.fetch(request(fields), env)).status, 400, missing)
  }
  assert.equal(send.mock.callCount(), 0)
})

test('an unset secret fails closed and offers the email address', async (t) => {
  const { env, verify } = setup(t)
  const response = await worker.fetch(request(), { ...env, TURNSTILE_SECRET_KEY: undefined })
  assert.equal(response.status, 503)
  assert.match(JSON.stringify(await response.json()), /joe@joebailey.xyz/)
  assert.equal(verify.mock.callCount(), 0)
})

test('other requests are served from the static assets', async (t) => {
  const { env } = setup(t)
  assert.equal(await (await worker.fetch(new Request('https://joebailey.xyz/blog/'), env)).text(), 'asset')
})
