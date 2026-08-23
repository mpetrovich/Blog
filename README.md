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
  site/            # Eleventy app + build output (dist/)
  render.yaml      # Render Blueprint (mirrors site/render.yaml)
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

## Deploy (Render)

[`render.yaml`](render.yaml) (kept in sync with [`site/render.yaml`](site/render.yaml)) defines the static site and Medium → new-path **301** routes.

- **Build:** `bash site/scripts/build.sh`
- **Publish:** `./site/dist`
- **Filters:** rebuilds on `site/**` and `posts/published/**`

Do not edit redirects in the Render UI — keep the Blueprint YAML as the source of truth.

### Cutover: Medium → petro.blog

Do **not** point DNS until redirects work on the Render `*.onrender.com` URL.

1. Confirm preview: home, one post, `/feed.xml`, and a sample redirect.
2. In Medium, remove the custom domain `petro.blog`.
3. In Render, add custom domain `petro.blog` (and `www` if you use it); set DNS as Render shows.
4. Spot-check an old Medium path returns `301` to `/posts/<slug>/`.
5. Optional: on `medium.com/@…` posts, link to the new URLs / set Medium canonicals (those hosts cannot 301).
