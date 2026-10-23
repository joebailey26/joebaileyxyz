import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

function component(path, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  // defineComponent is auto-imported in the app, and only returns its argument.
  const sandbox = { defineComponent: (definition) => definition, ...globals };
  const script = stripTypeScriptTypes(source.match(/<script lang="ts">([\s\S]*?)<\/script>/)[1]);
  runInNewContext(script.replace('export default', 'globalThis.component ='), sandbox);
  const definition = sandbox.component;
  const instance = { ...definition.data(), ...globals.instance };
  for (const [key, method] of Object.entries(definition.methods)) instance[key] = method.bind(instance);
  return { definition, instance };
}

function widget(t) {
  const events = [];
  const api = {
    render: t.mock.fn(() => 'widget-1'),
    reset: t.mock.fn(),
    remove: t.mock.fn()
  };
  const loaded = component('../../app/components/turnstile-widget.vue', {
    window: { turnstile: api },
    instance: { siteKey: 'public-test-key', $refs: { widget: {} }, $emit: (...args) => events.push(args) }
  });
  return { ...loaded, api, events };
}

test('widget issues tokens, clears expired tokens, retries, and cleans up on navigation', async (t) => {
  const { instance, definition, api, events } = widget(t);
  await instance.renderWidget();
  const options = api.render.mock.calls[0].arguments[1];
  assert.equal(options.action, 'contact');
  options.callback('solved-token');
  assert.deepEqual(events.at(-1), ['token', 'solved-token']);
  options['expired-callback']();
  assert.deepEqual(events.at(-1), ['token', '']);
  assert.equal(api.reset.mock.callCount(), 1);
  options['error-callback']();
  assert.ok(instance.error);
  assert.deepEqual(events.at(-1), ['token', '']);
  instance.retry();
  assert.equal(instance.error, '');
  assert.equal(api.reset.mock.callCount(), 2);
  definition.beforeUnmount.call(instance);
  assert.equal(api.remove.mock.calls[0].arguments[0], 'widget-1');
});

test('widget does not render after navigating away while the script loads', async (t) => {
  const { instance, definition, api } = widget(t);
  const pending = instance.renderWidget();
  definition.beforeUnmount.call(instance);
  await pending;
  assert.equal(api.render.mock.callCount(), 0);
});

test('missing public key leaves an email fallback and never renders', async (t) => {
  const { instance, api } = widget(t);
  instance.siteKey = '';
  await instance.renderWidget();
  assert.match(instance.error, /joe@joebailey.xyz/);
  assert.equal(api.render.mock.callCount(), 0);
});

test('a blocked script can be retried successfully', async (t) => {
  const api = { render: t.mock.fn(() => 'widget-2'), ready: callback => callback() };
  const window = {};
  let attempts = 0;
  const { instance } = component('../../app/components/turnstile-widget.vue', {
    window, setTimeout, clearTimeout,
    document: {
      createElement: () => ({ remove() {} }),
      head: {
        appendChild(script) {
          queueMicrotask(() => {
            if (++attempts === 1) script.onerror();
            else { window.turnstile = api; script.onload(); }
          });
        }
      }
    },
    instance: { siteKey: 'public-test-key', $refs: { widget: {} }, $emit() {} }
  });
  await instance.renderWidget();
  assert.match(instance.error, /could not load/);
  await instance.renderWidget();
  assert.equal(api.render.mock.callCount(), 1);
});

function contact(t, ok = true) {
  const fetch = t.mock.fn(async () => ({ ok, json: async () => ({ error: 'Please retry verification' }) }));
  const reset = t.mock.fn();
  const { definition, instance } = component('../../app/components/home/contact.vue', {
    fetch,
    FormData: class {
      constructor() { this.values = new Map(); }
      set(key, value) { this.values.set(key, value); }
    },
    instance: { $refs: { contactForm: { reportValidity: () => true }, turnstile: { reset } } }
  });
  Object.defineProperty(instance, 'canSubmit', { get: () => definition.computed.canSubmit.call(instance) });
  instance.form = { name: 'Visitor', email: 'visitor@example.com', message: 'Hello' };
  return { instance, fetch, reset };
}

test('contact requires all fields and a solved token before sending', async (t) => {
  const { instance, fetch } = contact(t);
  await instance.submit();
  assert.equal(fetch.mock.callCount(), 0);
  instance.turnstileToken = 'solved-token';
  instance.form.name = '  ';
  assert.equal(instance.canSubmit, false);
  instance.form.name = 'Visitor';
  assert.equal(instance.canSubmit, true);
});

test('successful contact includes the token, prevents double submits, and refreshes verification', async (t) => {
  const { instance, fetch, reset } = contact(t);
  instance.turnstileToken = 'solved-token';
  const pending = instance.submit();
  await instance.submit();
  await pending;
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(fetch.mock.calls[0].arguments[1].body.values.get('cf-turnstile-response'), 'solved-token');
  assert.equal(instance.form.message, '');
  assert.equal(instance.sending, false);
  assert.match(instance.submitted, /successfully/);
  assert.equal(reset.mock.callCount(), 1);
});

test('failed contact retains the draft and refreshes the consumed token for retry', async (t) => {
  const { instance, reset } = contact(t, false);
  instance.turnstileToken = 'solved-token';
  await instance.submit();
  assert.equal(instance.form.message, 'Hello');
  assert.equal(instance.sending, false);
  assert.match(instance.submitted, /Please try again/);
  assert.equal(reset.mock.callCount(), 1);
});
