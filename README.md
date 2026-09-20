# Blog

Public site for [Michael Petrovich](https://github.com/mpetrovich), built with [Eleventy](https://www.11ty.dev/) and deployed to [Render](https://render.com/) as a static site.

Canonical URL: https://petro.blog

This repo holds both published writing and the site. Posts live under `posts/`; the Eleventy app lives under `site/`.

## Layout

```text
Blog/
  posts/
    published/     # YYYY-MM-DD-<slug>.md + images/ (tracked)
    draft/         # local drafts only (gitignored)
  site/            # Eleventy app, Render Blueprint, build output (dist/)
```

Published filenames are `YYYY-MM-DD-<slug>.md` (date from frontmatter). Permalinks stay `/posts/<slug>/` — the date prefix is for filesystem sorting only.

## Local development

```bash
cd site
npm install
npm start
```

Eleventy reads posts from `../posts/published` by default. Override with `POSTS_DIR` if needed:

```bash
POSTS_DIR=/path/to/posts npm start
```

Build once:

```bash
cd site
npm run build
```

Output is `site/dist/` (gitignored).

## Email subscribe (Buttondown)

Readers can subscribe at `/subscribe/`; you notify them after publishing with `/blog-notify-subscribers`.

1. Create a Buttondown newsletter, enable double opt-in, and optionally add a custom sending domain.
2. Set `buttondownUsername` in [`site/src/_data/site.js`](site/src/_data/site.js) (or `BUTTONDOWN_USERNAME` at build time).
3. Put `BUTTONDOWN_API_KEY` in the repo-root [`.env`](.env) (see [`.env.example`](.env.example)).
4. In Buttondown, set the post-confirmation redirect to `https://petro.blog/subscribe/confirmed/` (API field `subscription_confirmation_redirect_url`, or the matching setting under Subscribing).

## Deploy (Render)

Infra lives in [`site/render.yaml`](site/render.yaml). The Render Blueprint Path is set to that file.

- **Build:** `bash site/scripts/build.sh`
- **Publish:** `./site/dist`
- **Filters:** rebuilds on `site/**` and `posts/published/**`

Do not edit redirects in the Render UI — keep [`site/render.yaml`](site/render.yaml) as the source of truth.