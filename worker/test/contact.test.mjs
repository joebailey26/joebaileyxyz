import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

// Only replace the Workers-only email constructor; exercise the real request handler.
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'cloudflare:email') {
      return { url: 'data:text/javascript,export class EmailMessage { constructor(...args) { this.args = args; } }', shortCircuit: true };
    }
    return next(specifier, context);
  }
});
const { handleContact, default: worker } = await import('../index.mjs');
hooks.deregister();

function request(token = 'valid-token', options = {}) {
  const body = new FormData();
  body.set('name', 'Test Visitor');
  body.set('email', 'visitor@example.com');
  body.set('message', 'A contact message');
  if (token !== null) body.set('cf-turnstile-response', token);
  return new Request('https://joebailey.xyz/api/contact', { method: 'POST', body, ...options });
}

function setup(t, result = { success: true, action: 'contact', hostname: 'joebailey.xyz' }) {
  const send = t.mock.fn(async () => {});
  const verify = t.mock.method(globalThis, 'fetch', async () => Response.json(result));
  return { send, verify, env: { TURNSTILE_SECRET_KEY: 'private-test-key', CONTACT_FROM: 'contact@joebailey.xyz', CONTACT_EMAIL: { send } } };
}

test('verified contact sends email after checking the token', async (t) => {
  const { env, send, verify } = setup(t);
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(send.mock.callCount(), 1);
  const [url, options] = verify.mock.calls[0].arguments;
  assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.deepEqual(JSON.parse(options.body), { secret: 'private-test-key', response: 'valid-token' });
  assert.equal(options.method, 'POST');
  assert.ok(options.signal instanceof AbortSignal);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match(send.mock.calls[0].arguments[0].args[2], /Reply-To: visitor@example.com/);
});

for (const token of [null, '', '   ', 'x'.repeat(2049), new Blob(['file'])]) {
  test(`missing or invalid token is blocked (${token === null ? 'missing' : typeof token === 'string' ? token.length : 'file'})`, async (t) => {
    const { env, send, verify } = setup(t);
    assert.equal((await handleContact(request(token), env)).status, 400);
    assert.equal(send.mock.callCount(), 0);
    assert.equal(verify.mock.callCount(), 0);
  });
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
    const { env, send } = setup(t, result);
    assert.ok([403, 503].includes((await handleContact(request(), env)).status));
    assert.equal(send.mock.callCount(), 0);
  });
}

test('missing secret fails closed without calling verification', async (t) => {
  const { env, send, verify } = setup(t);
  delete env.TURNSTILE_SECRET_KEY;
  assert.equal((await handleContact(request(), env)).status, 503);
  assert.equal(send.mock.callCount(), 0);
  assert.equal(verify.mock.callCount(), 0);
});

for (const failure of ['network', 'timeout', 'http', 'json']) {
  test(`verification ${failure} failure cannot send email`, async (t) => {
    const { env, send, verify } = setup(t);
    verify.mock.mockImplementation(async () => {
      if (failure === 'http') return new Response('unavailable', { status: 503 });
      if (failure === 'json') return new Response('invalid JSON');
      throw new DOMException('Unavailable', failure === 'timeout' ? 'TimeoutError' : 'NetworkError');
    });
    assert.equal((await handleContact(request(), env)).status, 503);
    assert.equal(send.mock.callCount(), 0);
  });
}

test('a token cannot be reused for a second email', async (t) => {
  const { env, send, verify } = setup(t);
  assert.equal((await handleContact(request(), env)).status, 200);
  verify.mock.mockImplementation(async () => Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }));
  assert.equal((await handleContact(request(), env)).status, 403);
  assert.equal(send.mock.callCount(), 1);
});

test('method and origin guards run before verification', async (t) => {
  const { env, send, verify } = setup(t);
  assert.equal((await handleContact(new Request('https://joebailey.xyz/api/contact'), env)).status, 405);
  assert.equal((await handleContact(request('valid-token', { headers: { Origin: 'https://other.example' } }), env)).status, 403);
  assert.equal(send.mock.callCount(), 0);
  assert.equal(verify.mock.callCount(), 0);
});
