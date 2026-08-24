# Blog

Public site for [Michael Petrovich](https://github.com/mpetrovich), built with [Eleventy](https://www.11ty.dev/) and deployed to [Render](https://render.com/) as a static site.

Canonical URL: https://petro.blog

This repo holds both published writing and the site. Posts live under `posts/`; the Eleventy app lives under `site/`.

## Layout

```text
Blog/
  posts/
    published/     # live markdown + images (tracked)
    draft/         # local drafts only (gitignored)
  site/            # Eleventy app, Render Blueprint, build output (dist/)
```

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

Readers can subscribe at `/subscribe/`; you notify them after publishing with `/notify-subscribers`.

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

### Cutover: Medium → petro.blog

Do **not** point DNS until redirects work on the Render `*.onrender.com` URL.

1. Confirm preview: home, one post, `/feed.xml`, and a sample redirect.
2. In Medium, remove the custom domain `petro.blog`.
3. In Render, add custom domain `petro.blog` (and `www` if you use it); set DNS as Render shows.
4. Spot-check an old Medium path returns `301` to `/posts/<slug>/`.
5. Optional: on `medium.com/@…` posts, link to the new URLs / set Medium canonicals (those hosts cannot 301).
