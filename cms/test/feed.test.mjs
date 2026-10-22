import test from 'node:test';
import assert from 'node:assert/strict';
import feed from '../../modules/cms-content.cjs';

const post = (section, slug) => ({ section, slug, status: 'publish', title: { rendered: slug }, content: { rendered: '<p>Hello</p>' }, excerpt: { rendered: '' } });

test('Nuxt loads both sections from one pinned revision, including empty sections', async () => {
  const urls = [];
  const result = await feed.fetchCmsContent({ baseUrl: 'https://cms.example.com', token: 'private', perPage: 1, async fetchImpl(url, options) {
    urls.push(url);
    assert.equal(options.headers.Authorization, 'Bearer private');
    if (url.pathname.endsWith('manifest')) return Response.json({ revision: 'fixed-revision', counts: { blog: 2, projects: 0 } });
    assert.equal(url.searchParams.get('revision'), 'fixed-revision');
    const section = url.searchParams.get('section');
    return Response.json({ revision: 'fixed-revision', total: section === 'blog' ? 2 : 0, totalPages: section === 'blog' ? 2 : 0, items: section === 'blog' ? [post(section, `post-${url.searchParams.get('page')}`)] : [] });
  } });
  assert.equal(urls.length, 4);
  assert.equal(result.blog.length, 2);
  assert.deepEqual(result.projects, [[]]);
});

test('Nuxt fails on authorization errors, expired revisions and incomplete pages', async () => {
  for (const status of [401, 410, 500]) {
    await assert.rejects(feed.fetchCmsContent({ baseUrl: 'https://cms.example.com', token: 'private', fetchImpl: async () => new Response('', { status }) }), new RegExp(`HTTP ${status}`));
  }
  await assert.rejects(feed.fetchCmsContent({ baseUrl: 'https://cms.example.com', token: 'private', fetchImpl: async url => url.pathname.endsWith('manifest') ? Response.json({ revision: 'fixed', counts: { blog: 1, projects: 0 } }) : Response.json({ revision: 'fixed', total: 1, totalPages: 1, items: [] }) }), /Incomplete/);
});
