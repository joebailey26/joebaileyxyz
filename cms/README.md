# Browser WordPress CMS

WordPress executes locally in the editor's browser. The Worker authenticates the editor, stores complete SQLite snapshots in D1, stores user-owned files in R2, and exposes a private, revision-pinned feed to the existing Nuxt/Netlify build. No PHP server runs in Cloudflare.

## Local setup

Use Node **24.18+** and npm **11.16+**, as required by the pinned Playground packages. CMS dependencies are isolated from the root Yarn/Nuxt installation.

```powershell
npm ci --prefix cms
npm --prefix cms run runtime
Copy-Item cms/.dev.vars.example cms/.dev.vars
npm --prefix cms run build
npm --prefix cms run db:local
npm --prefix cms run dev
```

The runtime command downloads the official Playground artifact identified in `runtime.lock.json`, verifies its SHA-256, and extracts it. It requires an authenticated GitHub CLI. An already downloaded, matching ZIP can be supplied with `npm --prefix cms run runtime -- C:/path/playground.zip`. Keep a copy: GitHub workflow artifacts expire. The artifact itself is approximately 685 MiB and is excluded from Git.

Open the localhost address printed by Wrangler. `.dev.vars` enables a localhost-only authentication bypass. It cannot bypass Access on a deployed hostname. Use a local build token of at least 32 random characters. Never put production secrets in tracked files.

The upstream artifact includes WordPress 7.0.7, PHP 8.3, its bundled SQLite integration, and Playground 3.1.60. These versions are restored together; changing WordPress or the SQLite driver requires a tested snapshot upgrade, rather than silently loading a newer runtime.

## Cloudflare deployment

1. Create a D1 database named `joebailey-cms` and an R2 bucket named `joebailey-cms-files`. Set the resulting database ID in `wrangler.jsonc`; the checked-in placeholder intentionally cannot deploy as a working database.
2. Create a Cloudflare Access self-hosted application for `cms.joebailey.xyz`. Allow `joe@joebailey.xyz` and `billybidley26@gmail.com`. Use the account's standard email PIN provider, not a connection belonging to an older Pages application. The existing Google provider is also enabled for these same email addresses. Set `ACCESS_TEAM_DOMAIN` and the application audience in Wrangler. Require Access for the editor, runtime and `/api/editor/*`. Exclude `/media/*` and `/api/content/*` from Access's interactive login: media is publicly readable; the Worker independently enforces the build token on the feed. Test these exclusions before cutover.
3. Set Worker secrets using `npx --no-install wrangler secret put CMS_BUILD_TOKEN` and `npx --no-install wrangler secret put NETLIFY_BUILD_HOOK` from `cms/`. The latter must be a Netlify hook URL for the intended branch. Keep hooks pointed at a staging/preview branch until migration is accepted.
4. Run `npm --prefix cms run db:remote`, then `npm --prefix cms run build`, then `npm --prefix cms run runtime:upload`. The last command uploads runtime assets larger than Workers' static-file limit to R2; use `-- --local` for local R2 instead. `CMS_R2_BUCKET` overrides the upload script's default bucket name.
5. Run `npm --prefix cms run deploy`. This attaches the Worker to `cms.joebailey.xyz`; `workers.dev` and preview URLs are disabled. Do not set `LOCAL_DEV` in production.

The Worker validates Access signatures, issuer, audience and expiration. The build token has no editor/snapshot access. Mutations require a same-origin request and, for synchronization, an unexpired editing lease.

## Migrate existing content

The supplied SQL/full-site backup can be converted without executing its SQL, PHP or installer:

```powershell
npm --prefix cms run migrate:backup -- --archive "H:\Website Backups\joe-bailey-photography-blog.zip" --uploads "H:\Website Backups\DEC_2019\joeblog" --recovered cms/migration/recovered
```

The `--uploads` directory supplements missing files using exact relative upload paths. `--recovered` is optional and reads the checksum-verified output from `scripts/recover-public-media.mjs`. Source category **39 (News)** maps to **blog**, and **96 (Projects)** maps to **projects**. This selects 55 editorial posts (50 published blog, four published projects, one draft), 46 attachments and 153 media files, excluding 165 unrelated posts. The older backup supplies all 14 previously missing originals. Missing generated image sizes are removed from attachment metadata during import; all original attachments must be present. Provenance and missing-size details are recorded in the ignored `migration/migration-report.json`.

The generated `migration/joebailey-content.zip`, all source content, browser backups, local databases and credentials are ignored by Git. This converter copies only required editorial media; the native project controls replace ACF for the three fields consumed by this website. None of the selected posts require source-plugin shortcodes. Do not activate the unrelated plugins from the full-site backup.

From the source WordPress, export **Tools → Export → All content**, and obtain a complete `wp-content` directory, including original uploads, thumbnails, required plugins and themes. Export ACF field groups as JSON if used. Credentials and source exports are not committed here.

```powershell
npm --prefix cms run migrate -- --wxr C:/backups/export.xml --content C:/backups/wp-content --acf C:/backups/acf-fields.json
```

Omit `--acf` when it is not needed. The tool writes the ignored `cms/migration/export.zip`. It rejects missing original attachments and symlinks. Import this ZIP using **Import migration/backup** in the staging editor. It imports through WordPress APIs, maps taxonomy slugs and attachment IDs, preserves publication dates, statuses, serialized post metadata and author names, and rewrites source upload/content links. Reimporting the same source IDs updates the same imported records.

WXR does not contain source options, account passwords or plugin-specific database tables. This migration intentionally imports editorial content into a fresh CMS. The supplied files and ACF definitions preserve the site's required editor fields; audit any additional plugin requirements before production cutover. Once imported, subsequent D1 snapshots preserve the *entire* new database, including users, options and plugin tables.

Set `BLOG_CATEGORY` and `PROJECTS_CATEGORY` to the source category **slugs** before the first sync. The old Nuxt category IDs were 39 and 96; imported IDs may differ. The native project editor supports `icons`, `project_url`, and `github` when ACF is absent. When ACF is present, its imported field groups supply those controls. Only explicitly required plugins should be activated; source plugins that require a permanent server need separate compatibility checks.

Import pauses automatic cloud synchronization so content can be reviewed. Use **Sync now** when ready. A recovery backup is retained before import, and CMS backup ZIPs can also be imported through the same control. Verify post/project counts, slugs, dates, drafts, custom fields, featured images, inline images, galleries, videos, and internal links before switching production. The new WordPress installation's original sample content is uncategorized and is excluded from both feeds; remove it during migration review.

## Connect Netlify

Set server-side Netlify build environment variables:

```text
CONTENT_SOURCE=cms
CMS_API_URL=https://cms.joebailey.xyz
CMS_BUILD_TOKEN=<same secret configured on the Worker>
```

The default remains `CONTENT_SOURCE=wordpress`, using the existing `WP_API_URL`, `WP_USER`, and `WP_PASS`. Keep these for rollback. Do not expose either credential set through Nuxt public runtime configuration. First apply the new variables to a preview context and compare generated routes/content before changing production. Restore `CONTENT_SOURCE=wordpress` and redeploy to roll back.

Every CMS build fetches `/api/content/manifest` once, then loads `/api/content/posts` with that revision, section, and page. Feed authentication, pagination, missing data, expired revisions and legacy WordPress fetch errors fail the build rather than publish empty sections. A revision pruned while a long build is running returns HTTP 410; restart that build against the latest revision.

## Synchronization and recovery

- Database changes are detected through WordPress's query filter and checkpointed after a short delay. During capture the bridge briefly rejects other WordPress requests with a retryable 503, so database/file copies correspond to a consistent editor state. Each checkpoint stores the full SQLite DB in 256 KiB D1 chunks with SHA-256 checksums; restore verifies the complete database hash.
- Files are addressed by SHA-256 in R2. Uploads have stable public media URLs; plugins/themes have authenticated file endpoints. Executable/unsupported upload formats download as attachments with a restrictive CSP. The existing Nuxt image/video processing remains in place.
- A local IndexedDB recovery checkpoint is persisted before upload. A failed upload never activates partial data. Cloud activation is a guarded D1 transaction that requires the current lease and expected base revision. Losing the lease pauses editing; recovery cannot overwrite a newer cloud revision.
- One browser session holds a two-minute lease, renewed every 30 seconds. **Close editor** syncs and releases it. After an abrupt close, wait for expiry before opening another device. Last synced refers to Cloudflare persistence, not a completed Netlify deployment. Pending edits before a recovery checkpoint finishes are still browser-local; use **Sync now** and wait for success before leaving.
- Keep the latest three completed database snapshots. **Saved versions → Download saved version** downloads any retained revision; **Download backup** captures current local work. Failed staging uploads are cleaned after one day once their lease is no longer current. R2 objects are retained so older deployed pages and recovery backups do not lose media; budget/clean them separately once deployments and backups no longer reference them.
- A hash of published output controls builds. Draft-only saves do not request a new build. Publishing, modifying, deleting or unpublishing visible content queues the secret Netlify hook after commit. Failures remain retryable through the editor and a five-minute Worker cron; that cron retries builds and cleans snapshots, and does not run WordPress.
- Scheduled WordPress publishing while the editor is closed is unsupported. WordPress cron is disabled. Publish manually. This is a single-editor CMS, without collaborative merging.

Current request/storage guardrails are a 128 MiB database, 50 MiB per user-owned file, a 1.5 MB manifest, a 1.5 MB rendered record and a 24 MiB complete rendered feed. Three database snapshots must fit the selected D1 plan. Imports and ZIP backups are assembled in browser memory; use a desktop browser for large libraries.

## Verification

```powershell
npm --prefix cms test
npm --prefix cms run check
npm --prefix cms run test:wordpress
npm --prefix cms run build
# With Wrangler running locally; install Playwright Chromium first:
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/cms/.cache/ms-playwright"
node cms/node_modules/playwright/cli.js install chromium
npm --prefix cms run test:browser
```

The tests cover incomplete uploads, checksum failures, transaction rollback on lease loss, stale sessions, file privacy, auth boundaries, feed pagination, build retries, snapshot retention and MySQL/PHP metadata parsing. The PHP smoke check boots the pinned WordPress runtime twice and verifies restoration of drafts, settings, users, rendered content and project fields, plus HTTP login to the restored admin. The browser test requires the root Nuxt dependencies too (it uses the existing `sharp` image processor).

`scripts/migration-browser.mjs` validates the real migration against an isolated local Worker at port 8788, compares source IDs/slugs/statuses, verifies every attachment and retained image size, restores into a second browser profile, and downloads `migration/verified-staging-snapshot.zip`. `--restore-only` verifies an existing local revision without importing again.

For initial cloud promotion, run `node --experimental-wasm-jspi cms/scripts/prepare-promotion.mjs cms/migration/verified-staging-snapshot.zip https://cms.joebailey.xyz http://127.0.0.1:8788/scope:joebailey-cms`, then `node cms/scripts/seed-cloud.mjs cms/migration/cloud-snapshot.zip`. The first command relocates the snapshot through pinned WordPress APIs. The second uses account-admin Cloudflare authentication, refuses an initialized database or open editor, uploads checksum-verified files/database chunks, verifies the stored chunks and atomically activates the initial revision. Subsequent changes must use the authenticated editor. It does not trigger a build or change Netlify ingestion.

Verified on 22 October 2026: 15 automated tests; full pinned PHP/SQLite restore; real browser import and fresh-profile restore of all 55 posts and 46 attachments; all 54 published routes and five blog pagination pages generated from the live cloud feed; all seven published featured images served successfully from R2. The editor login was confirmed by the permitted user after correcting the identity provider. Nuxt's build cache excludes `cms/**` to avoid reading the separate runtime and dependency tree. Netlify uses Node 24.12 to match the existing root package engine.

References: [Playground self-hosting](https://developer.wordpress.org/playground/developers/architecture/host-your-own-playground/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Netlify build hooks](https://docs.netlify.com/build/configure-builds/build-hooks/).
