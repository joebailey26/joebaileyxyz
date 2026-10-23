import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { prepareImages } from '../prepare-wordpress-content/convert-images.js';
import getFeaturedImageUrl from '../prepare-wordpress-content/featured-image.js';

const media = 'https://cms.joebailey.xyz/media/abc/abc-photo.jpg';
const saved = { ...process.env };

afterEach(() => {
  process.env = { ...saved };
});

function production() {
  process.env.CMS_API_URL = 'https://cms.joebailey.xyz';
  process.env.WORKERS_CI_BRANCH = 'master';
  delete process.env.IMAGE_TRANSFORMATIONS;
}

test('production build adds srcset and sizes to CMS images', () => {
  production();
  const html = prepareImages(`<img src="${media}" alt="A photo">`);
  const t = width => `/cdn-cgi/image/format=auto,quality=80,fit=scale-down,width=${width}/${media}`;
  assert.equal(html, `<picture><img src="${t(800)}" srcset="${t(480)} 480w, ${t(800)} 800w, ${t(1200)} 1200w, ${t(1600)} 1600w" sizes="(min-width: 1200px) 1140px, 100vw" decoding="async" loading="lazy" alt="A photo"></picture>`);
});

test('srcset is capped at the image width and dimensions are kept', () => {
  production();
  const html = prepareImages(`<img src="${media}" width="1000" height="500">`);
  assert.match(html, /width=480\/\S+ 480w, \S+width=800\/\S+ 800w, \S+width=1000\/\S+ 1000w"/);
  assert.doesNotMatch(html, /1200w/);
  assert.match(html, /width="1000" height="500"/);
});

test('non-CMS, SVG and GIF images are left alone', () => {
  production();
  for (const src of ['https://example.com/a.jpg', 'https://cms.joebailey.xyz/media/a/logo.svg', 'https://cms.joebailey.xyz/media/a/anim.GIF']) {
    assert.equal(prepareImages(`<img src="${src}">`), `<picture><img src="${src}" decoding="async" loading="lazy" alt=""></picture>`);
  }
});

test('preview and local builds keep the original URLs', () => {
  production();
  process.env.WORKERS_CI_BRANCH = 'feature';
  assert.doesNotMatch(prepareImages(`<img src="${media}">`), /cdn-cgi|srcset/);
  delete process.env.WORKERS_CI_BRANCH;
  assert.doesNotMatch(prepareImages(`<img src="${media}">`), /cdn-cgi|srcset/);
  assert.equal(getFeaturedImageUrl(media), media);
});

test('IMAGE_TRANSFORMATIONS overrides the branch default', () => {
  production();
  process.env.IMAGE_TRANSFORMATIONS = 'false';
  assert.equal(getFeaturedImageUrl(media), media);
  delete process.env.WORKERS_CI_BRANCH;
  process.env.IMAGE_TRANSFORMATIONS = 'true';
  assert.match(prepareImages(`<img src="${media}">`), /srcset/);
});

test('featured images become absolute 1200px transformations', () => {
  production();
  assert.equal(getFeaturedImageUrl(media), `https://joebailey.xyz/cdn-cgi/image/format=auto,quality=80,fit=scale-down,width=1200/${media}`);
});
