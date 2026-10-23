# Browser WordPress CMS

WordPress executes locally in the editor's browser. The editor Worker authenticates users, stores complete SQLite snapshots in D1 and stores user-owned files in R2. The same Worker exposes a token-protected, revision-pinned feed to the Nuxt build, which runs in Cloudflare Workers Builds and is hosted as a Workers static-assets site. No PHP server runs in Cloudflare.

## Local setup

Use Node **24.18.0**, shared with the site and pinned in the root `.nvmrc`, for the Playground packages and pnpm **10.11.1** (pinned in `package.json`). CMS dependencies use their own pnpm lockfile and installation, separate from the Nuxt site. Enable Corepack once with `corepack enable`.

```powershell
pnpm --dir cms install --frozen-lockfile
pnpm --dir cms run runtime
Copy-Item cms/.dev.vars.example cms/.dev.vars
pnpm --dir cms run build
pnpm --dir cms run db:local
pnpm --dir cms run dev
```

The runtime command streams the official Playground archive from the permanent GitHub release URL pinned in `runtime.lock.json`, verifies its SHA-256, and extracts it. It needs neither GitHub CLI nor a GitHub token. The release contains the unchanged upstream artifact; its repository, commit and artifact ID remain in the lock as provenance. An already downloaded, matching ZIP can be supplied with `pnpm --dir cms run runtime C:/path/playground.zip`. The archive is approximately 685 MiB and is excluded from Git. Failed downloads leave no reusable partial archive. ZIP extraction uses Node on Windows and Linux; the enclosed gzip tarball uses the system `tar` command.

Prepared runtime reuse checks its pinned checksum and file inventory. Missing or truncated files cause preparation to run again from the verified archive. If a partial Cloudflare cache restore corrupts the generated ZIP, preparation discards it and downloads a fresh, checksum-verified copy. A mismatched ZIP supplied explicitly by the user fails without being changed. Every asset build reconstructs `dist` so stale or incomplete build output cannot be deployed.

Open the localhost address printed by Wrangler. `.dev.vars` enables a localhost-only authentication bypass. It cannot bypass Access on a deployed hostname. Use a local build token of at least 32 random characters. Never put production secrets in tracked files.

The upstream artifact includes WordPress 7.0.7, PHP 8.5 (older 8.3 snapshots restore unchanged; the database is PHP-version independent), its bundled SQLite integration, and Playground 3.1.60. These versions are restored together; changing WordPress or the SQLite driver requires a tested snapshot upgrade, rather than silently loading a newer runtime.

The CMS uses the bundled **Joe Bailey Headless** theme: three files, 523 bytes, with featured-image, wide-block and responsive-embed support. It loads no fonts, patterns, scripts or stylesheets and serves no WordPress frontend; Nuxt remains the public website. Opening an older snapshot skips Twenty Twenty-Five's 235 theme files (8.6 MB), installs the minimal theme and marks the migration pending for the next two-minute or manual sync. The existing 390-file snapshot becomes 158 files after synchronization. The pinned upstream core archive is unchanged; these savings apply to snapshot-file restoration.

Historical snapshots and downloadable backups remain complete, including their original theme files. Editing or importing a backup migrates the retired theme locally; the previous committed revision stays available until the new checkpoint succeeds. Posts, settings, media, project fields and theme-specific options remain in the database.

The build adapts the pinned, bundled service worker to a classic script and changes its registration to match. Chrome omits cookies on module service-worker script requests, causing Access to redirect them to login; classic script requests include the cookie. This compatibility step keeps all runtime assets behind Access. The build fails if the expected upstream registration changes, so runtime upgrades require reviewing this adaptation.

During startup the editor shows the current stage, runtime download progress, database chunks, file counts and elapsed time. The progress bar describes the current stage, rather than an estimated overall completion percentage. After 30 seconds without progress it offers a reload. Startup registration failures and runtime timeouts appear as errors and release the lease. Plugins, themes and other private files download six at a time; restore creates all required directories in one PHP call before writing the verified files. Saved uploads are not downloaded (see below).

The service worker bypasses Playground's offline cache for CMS APIs, the editor shell, media and Access routes. Activation removes any such responses cached by older builds. Runtime assets retain their offline cache. Startup activates the current service worker before reading status or acquiring a lease, so refreshing after a checkpoint compares current revisions. IndexedDB recovery data is unaffected.

## Cloudflare deployment

1. Production uses the existing D1 database `joebailey-cms` and R2 bucket `joebailey-cms-files`; their IDs are checked into `wrangler.jsonc`. Preview storage is separate: `joebailey-cms-preview` and `joebailey-cms-preview-files`.
2. Create a Cloudflare Access self-hosted application for `cms.joebailey.xyz`. Allow `joe@joebailey.xyz` and `billybidley26@gmail.com`. Use the account's standard email PIN provider, not a connection belonging to an older Pages application. The existing Google provider is also enabled for these same email addresses. Set `ACCESS_TEAM_DOMAIN` and the application audience in Wrangler. Require Access for the editor, runtime and `/api/editor/*`. Exclude `/media/*` and `/api/content/*` from Access's interactive login: media is publicly readable; the Worker independently enforces the build token on the feed. Test these exclusions before cutover.
3. Create a user-scoped API token with **Workers Builds Configuration: Edit** (the CMS Worker lists the site Worker's Workers Builds triggers itself, using `CF_WORKER_TAG` in `wrangler.jsonc`; set `CF_BUILD_TRIGGER_ID` only to override). Set Worker secrets from `cms/`: `pnpm exec wrangler secret put CMS_BUILD_TOKEN` and `pnpm exec wrangler secret put CF_BUILD_API_TOKEN`. Set the same `CMS_API_URL` and `CMS_BUILD_TOKEN` as build variables on the site's Workers Builds configuration.
4. Run `pnpm --dir cms run build:ci`, then `pnpm --dir cms run deploy:production`. Deployment applies production migrations, uploads oversized runtime assets to the production bucket, and deploys the Worker, in that order. Any failed step stops deployment. `pnpm --dir cms run deploy` remains available to rebuild prepared assets before running the same deployment sequence.
5. This attaches the editor to `cms.joebailey.xyz`. Production `workers.dev` is disabled; branch Preview URLs are enabled and Access protected. Do not set `LOCAL_DEV` in production or previews. Workers Builds runs on Cloudflare, so the site build reads `/api/content/*` (build-token authenticated) directly from the editor hostname, and rendered content references `cms.joebailey.xyz/media/*` directly. If a zone security rule challenges the build, add a skip rule for `/api/content/*` and `/media/*`.

### Automatic builds and feature previews

Configure the CMS Worker in Cloudflare Workers Builds with root `/cms`, production branch `master`, build command `pnpm run build:ci`, production deploy command `pnpm run deploy:production`, and Preview command `pnpm run deploy:preview`. Keep Node `24.18.0`, pnpm `10.11.1` and automatic dependency installation enabled; do not add another install command. Watch paths are `cms/**` and `.nvmrc` relative to the repository root.

The CMS uses Worker Previews rather than legacy version previews. For an existing legacy connection, prepare the Preview bindings and secrets, then complete Cloudflare's one-time **Set up Worker Previews** switch. This switch cannot be reversed. Configure the custom Preview command after switching.

`previews` explicitly binds the staging database and bucket. `wrangler.preview-migrations.jsonc` must match that database; the deployment script refuses mismatches or production storage. `runtime:upload --preview` selects the staging bucket. Plain `runtime:upload --local` remains available for local R2. A conflicting `CMS_R2_BUCKET` fails instead of redirecting a deployment to another bucket.

Protect the CMS's Preview `workers.dev` hostnames with Cloudflare Access using the existing two-editor allowlist. Set the Preview application's audience in `previews.vars.ACCESS_AUD`, and set a separate `CMS_BUILD_TOKEN` secret in Previews Base. Do not copy production website-build API credentials to previews.

All branch previews share staging content and the single-editor lease; they do not have independent datasets. Start with test content in the preview editor. Preview syncs preserve complete database snapshots and files, but `CMS_TRIGGER_BUILDS=false` prevents pending website builds, outbound requests and retries. Production defaults to enabled when this variable is absent. Cron triggers apply only to production.

To upgrade the runtime, obtain a reviewed official archive, record its commit/artifact provenance, verify its checksum and publish it under a new dedicated release tag. Update the locked URL and checksum together. Never replace bytes behind an existing pinned release URL. Run the Windows/Linux runtime CI jobs, WordPress restore checks and an Access-protected preview before merging.

The Worker validates Access signatures, issuer, audience and expiration. The build token has no editor/snapshot access. Mutations require a same-origin request and, for synchronization, an unexpired editing lease.

## Migrate existing content

The supplied SQL/full-site backup can be converted without executing its SQL, PHP or installer:

```powershell
pnpm --dir cms run migrate:backup --archive "H:\Website Backups\joe-bailey-photography-blog.zip" --uploads "H:\Website Backups\DEC_2019\joeblog" --recovered cms/migration/recovered
```

The `--uploads` directory supplements missing files using exact relative upload paths. `--recovered` is optional and reads the checksum-verified output from `scripts/recover-public-media.mjs`. Source category **39 (News)** maps to **blog**, and **96 (Projects)** maps to **projects**. This selects 55 editorial posts (50 published blog, four published projects, one draft), 46 attachments and 153 media files, excluding 165 unrelated posts. The older backup supplies all 14 previously missing originals. Missing generated image sizes are removed from attachment metadata during import; all original attachments must be present. Provenance and missing-size details are recorded in the ignored `migration/migration-report.json`.

The generated `migration/joebailey-content.zip`, all source content, browser backups, local databases and credentials are ignored by Git. This converter copies only required editorial media; the native project controls replace ACF for the three fields consumed by this website. None of the selected posts require source-plugin shortcodes. Do not activate the unrelated plugins from the full-site backup.

From the source WordPress, export **Tools → Export → All content**, and obtain a complete `wp-content` directory, including original uploads, thumbnails, required plugins and themes. Export ACF field groups as JSON if used. Credentials and source exports are not committed here.

```powershell
pnpm --dir cms run migrate --wxr C:/backups/export.xml --content C:/backups/wp-content --acf C:/backups/acf-fields.json
```

Omit `--acf` when it is not needed. The tool writes the ignored `cms/migration/export.zip`. It rejects missing original attachments and symlinks. Import this ZIP using **Import migration/backup** in the staging editor. It imports through WordPress APIs, maps taxonomy slugs and attachment IDs, preserves publication dates, statuses, serialized post metadata and author names, and rewrites source upload/content links. Reimporting the same source IDs updates the same imported records.

WXR does not contain source options, account passwords or plugin-specific database tables. This migration intentionally imports editorial content into a fresh CMS. The supplied files and ACF definitions preserve the site's required editor fields; audit any additional plugin requirements before production cutover. Once imported, subsequent D1 snapshots preserve the *entire* new database, including users, options and plugin tables.

Set `BLOG_CATEGORY` and `PROJECTS_CATEGORY` to the source category **slugs** before the first sync. The old Nuxt category IDs were 39 and 96; imported IDs may differ. The native project editor supports `icons`, `project_url`, and `github` when ACF is absent. When ACF is present, its imported field groups supply those controls. Only explicitly required plugins should be activated; source plugins that require a permanent server need separate compatibility checks.

Import pauses automatic cloud synchronization so content can be reviewed. Use **Sync now** when ready. A recovery backup is retained before import, and CMS backup ZIPs can also be imported through the same control. Verify post/project counts, slugs, dates, drafts, custom fields, featured images, inline images, galleries, videos, and internal links before switching production. The new WordPress installation's original sample content is uncategorized and is excluded from both feeds; remove it during migration review.

## Connect the site build

The site always builds from the CMS. Workers Builds needs these server-side variables:

```text
CMS_API_URL=https://cms.joebailey.xyz
CMS_BUILD_TOKEN=<same secret configured on the Worker>
```

Do not expose the token through Nuxt public runtime configuration.

Every CMS build fetches `/api/content/manifest` once, then loads `/api/content/posts` with that revision, section, and page. Feed authentication, pagination, missing data and expired revisions fail the build rather than publish empty sections. A revision pruned while a long build is running returns HTTP 410; restart that build against the latest revision.

## Synchronization and recovery

- Automatic synchronization checks for pending changes every two minutes while the editor is open. Individual WordPress actions do not trigger a cloud sync; **Sync now** and **Close editor** still sync immediately. The pending status and navigation warning cover changes waiting for the next sync. During capture the bridge briefly rejects other WordPress requests with a retryable 503, so database/file copies correspond to a consistent editor state. Each checkpoint stores the full SQLite DB in 256 KiB D1 chunks with SHA-256 checksums; restore verifies the complete database hash.
- Saved uploads stay in R2 while editing. Startup records them in a map outside `wp-content`, and the bridge redirects a request for a missing `wp-content/uploads/...` file to its public `/media/<hash>/...` URL, so the media library, post content and responsive image sets work without rewriting stored content. The service worker serves that redirect from the network. Capture keeps unopened uploads in the manifest, so later snapshots still list them; deleting an attachment removes its entry. Image edits need the original pixels, which PHP cannot fetch: the bridge asks the editor for them, which downloads and verifies the files within about three seconds, and the user reopens the editor. New uploads exist locally and are hashed into R2 at sync as before. Backups and saved-version downloads still contain every file.
- Files are addressed by SHA-256 in R2. Uploads have stable public media URLs; plugins/themes have authenticated file endpoints. Executable/unsupported upload formats download as attachments with a restrictive CSP. The existing Nuxt image/video processing remains in place.
- A local IndexedDB recovery checkpoint is persisted before upload. A failed upload never activates partial data. Cloud activation is a guarded D1 transaction that requires the current lease and expected base revision. Losing the lease pauses editing; recovery cannot overwrite a newer cloud revision.
- One browser session holds a two-minute lease, renewed every 30 seconds. The tab stores its lease secret in sessionStorage, so refreshing resumes immediately and rotates the secret to reject requests from the old document. A browser Web Lock prevents duplicated tabs from resuming the same secret concurrently. **Close editor** syncs and releases it. After an abrupt close, wait for expiry before opening another device. Last synced refers to Cloudflare persistence, not a completed site deployment. Pending edits before a recovery checkpoint finishes are still browser-local; use **Sync now** and wait for success before leaving.
- Keep the latest three completed database snapshots. **Saved versions → Download saved version** downloads any retained revision; **Download backup** captures current local work. Failed staging uploads are cleaned after one day once their lease is no longer current. R2 objects are retained so older deployed pages and recovery backups do not lose media; budget/clean them separately once deployments and backups no longer reference them.
- A hash of published output controls builds. Draft-only saves do not request a new build. Publishing, modifying, deleting or unpublishing visible content triggers a Cloudflare Workers Build after commit. Failures remain retryable through the editor and a five-minute Worker cron; that cron retries builds and cleans snapshots, and does not run WordPress.
- Scheduled WordPress publishing while the editor is closed is unsupported. WordPress cron is disabled. Publish manually. This is a single-editor CMS, without collaborative merging.

Current request/storage guardrails are a 128 MiB database, 50 MiB per user-owned file, a 1.5 MB manifest, a 1.5 MB rendered record and a 24 MiB complete rendered feed. Three database snapshots must fit the selected D1 plan. Imports and ZIP backups are assembled in browser memory; use a desktop browser for large libraries.

## Verification

```powershell
pnpm --dir cms test
pnpm --dir cms run check
pnpm --dir cms run test:wordpress
pnpm --dir cms run build
# With Wrangler running locally; install Playwright Chromium first:
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/cms/.cache/ms-playwright"
pnpm --dir cms exec playwright install chromium
pnpm --dir cms run test:browser
# With the migrated staging snapshot and emulator running on port 8788:
node cms/scripts/loading-browser.mjs
# Read-only inspection of a generated preview:
node cms/scripts/preview-smoke.mjs https://joebailey.xyz
```

The tests cover incomplete uploads, checksum failures, transaction rollback on lease loss, stale sessions, file privacy, auth boundaries, feed pagination, build retries, snapshot retention and MySQL/PHP metadata parsing. The PHP smoke check boots the pinned WordPress runtime twice and verifies restoration of drafts, settings, users, rendered content and project fields, plus HTTP login to the restored admin. The browser test requires the root Nuxt dependencies too (it uses the existing `sharp` image processor).

`scripts/loading-browser.mjs` places a local cookie-gated proxy in front of the real emulator. It verifies that service-worker requests carry the authentication cookie, restore progress is visible, file downloads use bounded concurrency, refresh immediately resumes, duplicated tabs and other browser profiles remain excluded, old lease tokens cannot release the resumed session, and an authentication redirect releases a failed startup's lease and allows retrying. Screenshots and measured timings are written under the ignored `.cache` directory.

`scripts/migration-browser.mjs` validates the real migration against an isolated local Worker at port 8788, compares source IDs/slugs/statuses, verifies every attachment and retained image size, restores into a second browser profile, and downloads `migration/verified-staging-snapshot.zip`. `--restore-only` verifies an existing local revision without importing again.

For initial cloud promotion, run `node --experimental-wasm-jspi cms/scripts/prepare-promotion.mjs cms/migration/verified-staging-snapshot.zip https://cms.joebailey.xyz http://127.0.0.1:8788/scope:joebailey-cms`, then `node cms/scripts/seed-cloud.mjs cms/migration/cloud-snapshot.zip`. The first command relocates the snapshot through pinned WordPress APIs. The second uses account-admin Cloudflare authentication, refuses an initialized database or open editor, uploads checksum-verified files/database chunks, verifies the stored chunks and atomically activates the initial revision. Subsequent changes must use the authenticated editor. It does not trigger a build.

Verified on 22 October 2026: 17 automated tests; full pinned PHP/SQLite restore; real browser import and fresh-profile restore of all 55 posts and 46 attachments; all 54 published routes and five blog pagination pages generated from the live cloud feed; all seven published featured images served successfully from R2. The editor login was confirmed by the permitted user after correcting the identity provider. Nuxt's build cache excludes `cms/**` to avoid reading the separate runtime and dependency tree. Workers Builds uses the root `.nvmrc` Node version.


References: [Playground self-hosting](https://developer.wordpress.org/playground/developers/architecture/host-your-own-playground/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Access JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/).
