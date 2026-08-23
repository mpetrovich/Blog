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
  site/            # Eleventy app, Render Blueprint, build output
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

Infra lives in [`site/render.yaml`](site/render.yaml): static site and Medium → new-path **301** routes.

A root [`scripts/build.sh`](scripts/build.sh) shim keeps the existing Render service settings working (`buildCommand: bash scripts/build.sh`, publish `./_site`) by building `site/` and copying `site/dist` → `_site`.

### One-time setup after this layout

1. In the [Render Dashboard](https://dashboard.render.com), open the Blueprint for this repo.
2. Optionally set **Blueprint Path** to `site/render.yaml` (Render defaults to repo-root `render.yaml`). After that sync, build/publish paths come from the Blueprint and the root shim is unused.
3. Confirm the unused **`WRITING_GITHUB_TOKEN`** env var is gone (cleared during cutover).
4. Deploy. A push to `main` that touches `site/**` or `posts/published/**` rebuilds the site (once Blueprint Path / build filters are applied).

Do not edit redirects in the Render UI — keep [`site/render.yaml`](site/render.yaml) as the source of truth.

### Cutover: Medium → petro.blog

Do **not** point DNS until redirects work on the Render `*.onrender.com` URL.

1. Confirm preview: home, one post, `/feed.xml`, and a sample redirect.
2. In Medium, remove the custom domain `petro.blog`.
3. In Render, add custom domain `petro.blog` (and `www` if you use it); set DNS as Render shows.
4. Spot-check an old Medium path returns `301` to `/posts/<slug>/`.
5. Optional: on `medium.com/@…` posts, link to the new URLs / set Medium canonicals (those hosts cannot 301).
