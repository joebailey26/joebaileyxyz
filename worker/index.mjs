import { EmailMessage } from 'cloudflare:email';

const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const clean = value => String(value ?? '').replace(/\r/g, '').trim();
const header = value => clean(value).replace(/\n/g, ' ').slice(0, 200);
const base64 = text => btoa(String.fromCharCode(...new TextEncoder().encode(text)));

export async function handleContact(request, env) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Forbidden' }, 403);
  const data = await request.formData().catch(() => null);
  if (!data) return json({ error: 'Invalid form' }, 400);
  const name = header(data.get('name')), email = header(data.get('email')), message = clean(data.get('message')).slice(0, 5000);
  if (!name || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !message) return json({ error: 'Name, a valid email and a message are required' }, 400);
  const destination = 'joe@joebailey.xyz';
  const raw = [
    `From: Website <${env.CONTACT_FROM}>`,
    `To: ${destination}`,
    `Reply-To: ${email}`,
    `Subject: =?UTF-8?B?${base64(`Message from ${name}`)}?=`,
    `Message-ID: <${crypto.randomUUID()}@joebailey.xyz>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64(`Name: ${name}\nEmail: ${email}\n\n${message}\n`).replace(/.{76}/g, '$&\r\n')
  ].join('\r\n');
  try {
    await env.CONTACT_EMAIL.send(new EmailMessage(env.CONTACT_FROM, destination, raw));
  } catch (error) {
    console.error('Contact email failed', error.name);
    return json({ error: 'Message could not be sent' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/api/contact') return handleContact(request, env);
    return env.ASSETS.fetch(request);
  }
};
