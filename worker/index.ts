import { createForms, type FormsEnv } from '@joebailey26/turnstile-forms'

// The bindings and variables from wrangler.jsonc, plus the TURNSTILE_SECRET_KEY secret.
/* eslint-disable @typescript-eslint/naming-convention -- binding names are fixed by wrangler.jsonc */
export interface Env {
  ASSETS: { fetch (request: Request): Promise<Response> }
  CONTACT_EMAIL: FormsEnv['email']
  CONTACT_FROM: string
  TURNSTILE_SECRET_KEY?: string
}
/* eslint-enable @typescript-eslint/naming-convention */

// The home page's contact form; its Turnstile action is "contact".
const handleForm = createForms({
  senderName: 'Website',
  contactEmail: 'joe@joebailey.xyz',
  forms: {
    contact: { title: 'Contact form', subject: (data) => `Message from ${data.name}`, fields: ['name', 'email', 'message'], required: ['name', 'message'] }
  }
})

export default {
  async fetch (request, env) {
    if (new URL(request.url).pathname === '/api/contact') {
      return handleForm(request, 'contact', { email: env.CONTACT_EMAIL, from: env.CONTACT_FROM, to: 'joe@joebailey.xyz', turnstileSecret: env.TURNSTILE_SECRET_KEY })
    }

    return env.ASSETS.fetch(request)
  }
} satisfies ExportedHandler<Env>
