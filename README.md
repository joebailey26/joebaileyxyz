<h1 style="text-align: center">Welcome to the Joe Bailey Website repo</h1>
<p style="text-align: center">This website showcases Joe Bailey's work.</p>
<p style="text-align: center"><a href="https://joebailey.xyz">Live Site</a></p>
## Install

Use pnpm **10.11.1**, pinned in `package.json`. Both the site and CMS use Node **24.18.0**, pinned in `.nvmrc`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec wrangler login
```

## Development

The browser-based WordPress CMS integration is documented in [cms/README.md](cms/README.md).

```sh
pnpm dev
```

## Build and deploy

```sh
pnpm generate     # build ./.output/public (needs CMS_API_URL and CMS_BUILD_TOKEN)
pnpm build        # same as generate; the Workers Builds build command
pnpm deploy       # build, then wrangler deploy
```

Production builds run in Cloudflare Workers Builds, connected to this repository's `master` branch. Its production build command is `pnpm build` and its deploy command is `pnpm exec wrangler deploy`. Preview builds use `pnpm build` and `pnpm exec wrangler preview`. Both build triggers set `NODE_VERSION=24.18.0`. These commands and build variables are stored in the Cloudflare Workers Builds settings, separately from `wrangler.jsonc`. Set `CMS_API_URL=https://cms.joebailey.xyz`, `CMS_BUILD_TOKEN` and `TORCHLIGHT_TOKEN` as build variables/secrets.

## Contact form spam protection

The contact form requires a Cloudflare Turnstile widget. Create a **Managed** widget
for `joebailey.xyz` in the Cloudflare dashboard. Add any preview hostnames you intend
to test as well.

- Set `TURNSTILE_SITE_KEY` as a Workers Builds **build variable** before generating
  the static site. Nuxt publishes this public key in its runtime config.
- Set `TURNSTILE_SECRET_KEY` as a **Worker runtime secret** (`pnpm exec wrangler secret put
  TURNSTILE_SECRET_KEY`). Never put the secret in Nuxt config or a committed file.
- Configure the matching keys for preview deployments too. The Worker checks both
  the token's `contact` action and its hostname against the request hostname.

Rebuild the static site after changing the public key. Missing keys disable sending;
verification failures never send email. Visitors can still use the email link.

For local testing, set the build variable `TURNSTILE_SITE_KEY` to Cloudflare's public
test key `1x00000000000000000000AA` and put the matching test secret
`TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` in the ignored root
`.dev.vars` file. These keys let you exercise the widget; dummy validation metadata
may fail the Worker's strict action/hostname checks. For a complete submission test,
use a dedicated development widget/key pair that allows your local hostname. Use
`pnpm exec wrangler dev` to serve the generated site and API together. Nuxt's development
server alone does not serve `/api/contact`. Use dummy keys only locally. Preview
emails use the configured contact inbox, so use the automated tests for mail-free
verification.

Run `pnpm test:contact` to test the API and widget lifecycle without sending email
or calling Cloudflare. Implementation references:
[client rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/),
[server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
and [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/).

## Visual Style Guide

![Style Guide](docs/img/StyleGuide.jpg)

## Coding Style Guide

### HTML

#### HTML5 Doctype

```sh
<!DOCTYPE html>
```

#### HTML Lang Attribute

```sh
<html lang=”en-GB”>
```

#### Syntax

HTML will be indented consistently by a tab character or 4 spaces.
Nested elements will be indented once.
Self closing elements need a trailing slash such as the ```<img />``` element

#### Attributes

Attributes and elements should always be lowercase
Double quotes should always be used, never single

##### Attribute Order

HTML attributes should come in this particular order for easier reading of code.
```id```
```class```
```data-*```
```for | type | href | src```

#### HTML5 Tags

HTML5 tags such as ```<header>```, ```<footer>```, ```<nav>```, and ```<time>``` are preferred over standard ```<div>``` tags.

### SCSS

CSS Files are not needed as Node Sass compiles the SCSS.

SCSS should be included in a CSS folder in the same directory as the component/element

Use one tab to indent each property

Add one blank line between code blocks

Multiple selectors can be on one line and must end with a curly brace

Property-balue pairs should be on their own line with one tab of indentation and ending in a semicolon

The closing brace should be flush left using the same amount of indentation as the opening selector

Colors should use names where possible rather than hex values

```sh
.Foo, #Bar {
  background: white;
  color: black
}

#Bar {
  width: 100%;
  height: auto;
}
```

## Git

### Commit Messages

1. Specify the type of commit:

* feat: The new feature you're adding to a particular application

* fix: A bug fix

* style: Feature and updates related to styling

* refactor: Refactoring a specific section of the codebase

* test: Everything related to testing

* docs: Everything related to documentation

* chore: Regular code maintenance.

1. Separate the subject from the body with a blank line

2. Your commit message should not contain any whitespace errors

3. Remove unnecessary punctuation marks

4. Do not end the subject line with a period

5. Capitalize the subject line and each paragraph

6. Use the body to explain what changes you have made and why you made them.

7. Do not assume the reviewer understands what the original problem was, ensure you add it.

8. Do not think your code is self-explanatory

#### Command Line

```sh
git commit -m "Subject" -m "Description..."
```

#### Text Editor Template

Capitalized, short (50 chars or less) summary

More detailed explanatory text, if necessary.  Wrap it to about 72
characters or so.  In some contexts, the first line is treated as the
subject of an email and the rest of the text as the body.  The blank
line separating the summary from the body is critical (unless you omit
the body entirely).

Write your commit message in the imperative: "Fix bug" and not "Fixed bug"
or "Fixes bug."  This convention matches up with commit messages generated
by commands like git merge and git revert.

Further paragraphs come after blank lines.

* Bullet points are okay, too, use a hyphen or asterisk for the bullet, followed by a
  single space, with blank lines in between

### Branching Strategy

Master branch is for tested code and is deployed directly to **Cloudflare**. Do not push anything to master. Always create pull requests and test code.

Dev branch is for development work on the site. Should always contain close to production ready code requiring minimal commits to get to production status.

Branches should be created for big projects requiring more than one commit such as adding a new page. They should be titled the project name and then a pull request should be made with dev in order to test it.

## Testing

Use a local environment if possible otherwise use **Browserstack** to manually test the site by navigating to all pages and performing all actions

### List of browsers we support

* Last 2 versions of **Mozilla Firefox**
* Last 2 versions of **Microsoft Edge**
* Last 2 versions of **Google Chrome**
* Last 2 versions of **Opera**
* Last 1 versions of **Safari**
* Last 1 versions of **iOS Safari**
* Last 2 versions of **Chrome for Android**
* Last 2 versions of **Firefox for Android**
* Last 1 versions of **Samsung Internet**

## Author

👤 **Joe Bailey**

* Website: [joebailey.xyz](joebailey.xyz)
* Github: [@joebailey26](https://github.com/joebailey26)
* LinkedIn: [@joe-bailey-b68b17171](https://linkedin.com/in/joe-bailey-b68b17171)
