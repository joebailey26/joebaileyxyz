# joebailey.xyz CMS

The browser WordPress CMS at `cms.joebailey.xyz` runs [`@joebailey26/static-wordpress`](https://github.com/joebailey26/static-wordpress/tree/master/packages/cms). This folder holds only what belongs to this site; the package README covers the editor, synchronisation, imports, deployment and limits.

- `cms.config.json`: sections `blog` and `projects` (category slugs `blog` and `projects`, public paths `/blog/` and `/projects/`) and the **Project details** fields `project_url`, `github` and `icons`.
- `worker.mjs`: the Worker entry, `createCms(config)`.
- `wrangler.jsonc`: production uses D1 `joebailey-cms` and R2 `joebailey-cms-files`; previews use `joebailey-cms-preview` and `joebailey-cms-preview-files` with website builds disabled. Migrations come from the package.
- `access-policy.json`: the Access allowlist (`joe@joebailey.xyz`, `billybidley26@gmail.com`).

## Local setup

GitHub Packages needs a token with `read:packages` even for public packages; set `GITHUB_PACKAGES_TOKEN` (for example `$env:GITHUB_PACKAGES_TOKEN = gh auth token` once `gh auth refresh -s read:packages` has been run).

```powershell
pnpm --dir cms install --frozen-lockfile
pnpm --dir cms run runtime
Copy-Item cms/.dev.vars.example cms/.dev.vars
pnpm --dir cms run db:local
pnpm --dir cms run dev
```

## Workers Builds

Root `/cms`, build command `pnpm run build:ci`, deploy command `pnpm run deploy:production`, Preview command `pnpm run deploy:preview`, watch paths `cms/**` and `.nvmrc`. Variables: `NODE_VERSION=24.18.0` and `GITHUB_PACKAGES_TOKEN`. Worker secrets: `CMS_BUILD_TOKEN` (a separate one in Previews) and `CF_BUILD_API_TOKEN` (production only).

Snapshots made before the package keep restoring unchanged: `id: "joebailey"` keeps the Playground scope `joebailey-cms`, the `joebailey-headless` theme and the browser storage names. Migration `0002` (applied by the deploy command) removes the old section constraint. The first sync after upgrading requests one site rebuild, because records now also carry `modified`, `tags` and `author`.
