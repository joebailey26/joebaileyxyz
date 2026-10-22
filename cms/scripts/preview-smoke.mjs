import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.env.PLAYWRIGHT_BROWSERS_PATH ||= join(root, '.cache/ms-playwright');
const { chromium } = await import('playwright');
const origin = process.argv[2] || 'https://deploy-preview-149--joebailey.netlify.app';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const paths = ['/blog/', '/blog/page/2/', '/blog/page/3/', '/blog/page/4/', '/blog/page/5/', '/projects/', '/blog/how-to-download-a-google-sheet-on-a-cron/', '/blog/adding-syntax-highlighting-to-my-blog-with-torchlight/', '/blog/dragging-to-scroll-with-javascript/', '/blog/dark-mode/', '/projects/tv-shows/'];
const media = new Set(), failures = [], headings = [];
await mkdir(join(root, '.cache'), { recursive: true });
try {
  const page = await context.newPage();
  for (const path of paths) {
    const response = await page.goto(new URL(path, origin).href, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, path);
    await page.locator('h1').waitFor();
    const heading = await page.locator('h1').first().innerText();
    assert(heading, `${path} has a heading`);
    headings.push({ path, heading });
    if (/^\/blog\/(page\/\d+\/)?$/.test(path)) assert.equal(await page.locator('article.post-index__post').count(), 10, path);
    const references = await page.locator('img,source,video').evaluateAll(elements => elements.flatMap(element => [element.getAttribute('src'), element.getAttribute('poster'), ...(element.getAttribute('srcset') || '').split(',').map(value => value.trim().split(/\s+/)[0])]).filter(value => value && /^\/(img|video)\/wordpress\//.test(value)));
    for (const reference of references) media.add(reference);
    if (['/blog/page/2/', '/projects/tv-shows/', '/blog/dark-mode/'].includes(path)) await page.screenshot({ path: join(root, `.cache/preview-${path.split('/').filter(Boolean).join('-')}.png`), fullPage: false });
  }
  for (const path of media) {
    const response = await context.request.head(new URL(path, origin).href);
    if (!response.ok()) failures.push({ path, status: response.status() });
  }
  assert.deepEqual(failures, []);
  const report = { origin, pages: headings, mediaReferences: media.size, failures };
  await writeFile(join(root, '.cache/preview-verified.json'), JSON.stringify(report, null, 2));
  console.log(`PASS: ${paths.length} rendered preview pages, all five blog pages and ${media.size} media references.`);
} finally { await browser.close(); }
