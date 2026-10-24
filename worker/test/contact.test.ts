import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { test, type TestContext } from 'node:test'
import type { Env } from '../index.ts'
import { EmailMessage } from './cloudflare-email.ts'

// Only replace the Workers-only email constructor; exercise the real request handler.
const hooks = registerHooks({
  resolve (specifier, context, next) {
    if (specifier === 'cloudflare:email') {
      return { url: new URL('./cloudflare-email.ts', import.meta.url).href, shortCircuit: true }
    }

    return next(specifier, context)
  }
})
const { handleContact, default: worker } = await import('../index.ts')
hooks.deregister()

function request (token: string | Blob | null = 'valid-token', options: RequestInit<IncomingRequestCfProperties> = {}) {
  const body = new FormData()
  body.set('name', 'Test Visitor')
  body.set('email', 'visitor@example.com')
  body.set('message', 'A contact message')
  if (token !== null) body.set('cf-turnstile-response', token)

  // Typed as an incoming request, as the Worker's fetch handler receives
  return new Request<unknown, IncomingRequestCfProperties>('https://joebailey.xyz/api/contact', { method: 'POST', body, ...options })
}

function setup (t: TestContext, result: unknown = { success: true, action: 'contact', hostname: 'joebailey.xyz' }) {
  const send = t.mock.fn<(message: unknown) => Promise<EmailSendResult>>(async () => ({ messageId: 'test-message' }))
  const verify = t.mock.method(globalThis, 'fetch', async () => Response.json(result))
  const env = {
    ASSETS: { fetch: async () => new Response('asset'), connect: () => assert.fail('unexpected connect') },
    TURNSTILE_SECRET_KEY: 'private-test-key',
    CONTACT_FROM: 'contact@joebailey.xyz',
    CONTACT_EMAIL: { send }
  } satisfies Env

  return { send, verify, env }
}

test('verified contact sends email after checking the token', async (t) => {
  const { env, send, verify } = setup(t)
  const response = await worker.fetch(request(), env)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true })
  assert.equal(send.mock.callCount(), 1)
  const [url, options] = verify.mock.calls[0].arguments
  assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify')
  assert.ok(typeof options?.body === 'string')
  assert.deepEqual(JSON.parse(options.body), { secret: 'private-test-key', response: 'valid-token' })
  assert.equal(options.method, 'POST')
  assert.ok(options.signal instanceof AbortSignal)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  const [message] = send.mock.calls[0].arguments
  assert.ok(message instanceof EmailMessage)
  assert.match(message.raw, /Reply-To: visitor@example.com/)
})

for (const token of [null, '', '   ', 'x'.repeat(2049), new Blob(['file'])]) {
  test(`missing or invalid token is blocked (${token === null ? 'missing' : typeof token === 'string' ? token.length : 'file'})`, async (t) => {
    const { env, send, verify } = setup(t)
    assert.equal((await handleContact(request(token), env)).status, 400)
    assert.equal(send.mock.callCount(), 0)
    assert.equal(verify.mock.callCount(), 0)
  })
}

for (const result of [
  { success: false, 'error-codes': ['invalid-input-response'] },
  { success: false, 'error-codes': ['timeout-or-duplicate'] },
  { success: true, hostname: 'joebailey.xyz', action: 'login' },
  { success: true, hostname: 'attacker.example', action: 'contact' },
  { success: true },
  { success: 'true', hostname: 'joebailey.xyz', action: 'contact' },
  null
]) {
  test(`failed or mismatched verification cannot send email: ${JSON.stringify(result)}`, async (t) => {
    const { env, send } = setup(t, result)
    assert.ok([403, 503].includes((await handleContact(request(), env)).status))
    assert.equal(send.mock.callCount(), 0)
  })
}

test('missing secret fails closed without calling verification', async (t) => {
  const { env, send, verify } = setup(t)
  assert.equal((await handleContact(request(), { ...env, TURNSTILE_SECRET_KEY: undefined })).status, 503)
  assert.equal(send.mock.callCount(), 0)
  assert.equal(verify.mock.callCount(), 0)
})

for (const failure of ['network', 'timeout', 'http', 'json']) {
  test(`verification ${failure} failure cannot send email`, async (t) => {
    const { env, send, verify } = setup(t)
    verify.mock.mockImplementation(async () => {
      if (failure === 'http') return new Response('unavailable', { status: 503 })
      if (failure === 'json') return new Response('invalid JSON')
      throw new DOMException('Unavailable', failure === 'timeout' ? 'TimeoutError' : 'NetworkError')
    })
    assert.equal((await handleContact(request(), env)).status, 503)
    assert.equal(send.mock.callCount(), 0)
  })
}

test('a token cannot be reused for a second email', async (t) => {
  const { env, send, verify } = setup(t)
  assert.equal((await handleContact(request(), env)).status, 200)
  verify.mock.mockImplementation(async () => Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }))
  assert.equal((await handleContact(request(), env)).status, 403)
  assert.equal(send.mock.callCount(), 1)
})

test('method and origin guards run before verification', async (t) => {
  const { env, send, verify } = setup(t)
  assert.equal((await handleContact(new Request('https://joebailey.xyz/api/contact'), env)).status, 405)
  assert.equal((await handleContact(request('valid-token', { headers: { Origin: 'https://other.example' } }), env)).status, 403)
  assert.equal(send.mock.callCount(), 0)
  assert.equal(verify.mock.callCount(), 0)
})
