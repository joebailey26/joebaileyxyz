import { handleRequest } from './worker.mjs';

// A separate read-only host for build servers that the editor domain's edge rules reject.
export async function handleBuildRequest(request, env, ctx) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/content/') && !url.pathname.startsWith('/media/')) {
    return new Response('Not found', { status: 404 });
  }
  const response = await handleRequest(request, env, ctx);
  if (!response.ok || !url.pathname.startsWith('/api/content/')) return response;
  const source = `${env.EDITOR_ORIGIN}/media/`;
  const payload = (await response.text()).replaceAll(source, `${url.origin}/media/`);
  return new Response(payload, { status: response.status, headers: response.headers });
}

export default { fetch: handleBuildRequest };
