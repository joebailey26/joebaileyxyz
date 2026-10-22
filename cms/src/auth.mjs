import { createRemoteJWKSet, jwtVerify } from 'jose';
import { assert } from './shared.mjs';

const keySets = new Map();

export async function editorIdentity(request, env) {
  const host = new URL(request.url).hostname;
  if (env.LOCAL_DEV === 'true' && ['localhost', '127.0.0.1', '[::1]'].includes(host)) return 'local-editor';
  assert(env.ACCESS_TEAM_DOMAIN && !env.ACCESS_TEAM_DOMAIN.includes('REPLACE') && env.ACCESS_AUD && !env.ACCESS_AUD.includes('REPLACE'), 'Cloudflare Access is not configured', 503);
  assert(/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN), 'Invalid Access team domain', 503);
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  assert(token, 'Authentication required', 401);
  const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
  if (!keySets.has(issuer)) keySets.set(issuer, createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)));
  try {
    const { payload } = await jwtVerify(token, keySets.get(issuer), { issuer, audience: env.ACCESS_AUD, algorithms: ['RS256'] });
    assert(typeof payload.email === 'string' && payload.email, 'An email identity is required', 403);
    return payload.email;
  } catch (error) {
    if (error.status) throw error;
    throw Object.assign(new Error('Invalid or expired Access session'), { status: 401 });
  }
}

export async function buildIdentity(request, env) {
  assert(typeof env.CMS_BUILD_TOKEN === 'string' && env.CMS_BUILD_TOKEN.length >= 32, 'Build token is not configured', 503);
  const supplied = request.headers.get('Authorization') || '';
  const encode = value => new TextEncoder().encode(value);
  const [actual, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', encode(supplied)),
    crypto.subtle.digest('SHA-256', encode(`Bearer ${env.CMS_BUILD_TOKEN}`))
  ]);
  let difference = 0;
  const a = new Uint8Array(actual), b = new Uint8Array(expected);
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  assert(difference === 0, 'Invalid build token', 401);
}

export function sameOrigin(request) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    assert(request.headers.get('Origin') === new URL(request.url).origin, 'Cross-origin mutations are forbidden', 403);
  }
}
