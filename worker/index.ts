import { EmailMessage } from 'cloudflare:email'

// The bindings and variables from wrangler.jsonc, plus the TURNSTILE_SECRET_KEY secret.
/* eslint-disable @typescript-eslint/naming-convention -- binding names are fixed by wrangler.jsonc */
export interface Env {
  ASSETS: Fetcher
  CONTACT_EMAIL: SendEmail
  CONTACT_FROM: string
  TURNSTILE_SECRET_KEY?: string
}
/* eslint-enable @typescript-eslint/naming-convention */

// The contact handler does not serve static assets.
export type ContactEnv = Omit<Env, 'ASSETS'>

interface SiteverifyResult {
  success: boolean
  action?: unknown
  hostname?: unknown
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
const clean = (value: unknown) => String(value ?? '').replace(/\r/g, '').trim()
const header = (value: unknown) => clean(value).replace(/\n/g, ' ').slice(0, 200)
const base64 = (text: string) => btoa(String.fromCharCode(...new TextEncoder().encode(text)))
const isSiteverifyResult = (value: unknown): value is SiteverifyResult => typeof value === 'object' && value !== null && 'success' in value && typeof value.success === 'boolean'

export async function handleContact (request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const origin = request.headers.get('Origin')
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Forbidden' }, 403)
  const data = await request.formData().catch(() => null)
  if (!data) return json({ error: 'Invalid form' }, 400)
  const name = header(data.get('name')), email = header(data.get('email')), message = clean(data.get('message')).slice(0, 5000)
  if (!name || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || !message) return json({ error: 'Name, a valid email and a message are required' }, 400)
  const token = data.get('cf-turnstile-response')
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) return json({ error: 'Please complete the spam check and try again' }, 400)
  if (!env.TURNSTILE_SECRET_KEY) return json({ error: 'Contact form is temporarily unavailable. Please email joe@joebailey.xyz' }, 503)
  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
      signal: AbortSignal.timeout(10000)
    })
    if (!verification.ok) throw new Error('Turnstile unavailable')
    const result: unknown = await verification.json()
    if (!isSiteverifyResult(result)) throw new Error('Invalid Turnstile response')
    if (!result.success || result.action !== 'contact' || result.hostname !== new URL(request.url).hostname) {
      return json({ error: 'Spam check failed or expired. Please try again' }, 403)
    }
  } catch {
    return json({ error: 'Spam check is temporarily unavailable. Please try again' }, 503)
  }
  const destination = 'joe@joebailey.xyz'
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
  ].join('\r\n')
  try {
    await env.CONTACT_EMAIL.send(new EmailMessage(env.CONTACT_FROM, destination, raw))
  } catch (error) {
    // The Worker's logs are the only record of a failed delivery.
    // eslint-disable-next-line no-console
    console.error('Contact email failed', error instanceof Error ? error.name : undefined)

    return json({ error: 'Message could not be sent' }, 502)
  }

  return json({ ok: true })
}

export default {
  async fetch (request, env) {
    if (new URL(request.url).pathname === '/api/contact') return handleContact(request, env)

    return env.ASSETS.fetch(request)
  }
} satisfies ExportedHandler<Env>
