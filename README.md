# Blog

Public site for [Michael Petrovich](https://github.com/mpetrovich), built with [Eleventy](https://www.11ty.dev/) and deployed to [Render](https://render.com/) as a static site.

Canonical URL: https://petro.blog

Posts live in the separate [Writing](https://github.com/mpetrovich/Writing) repo. This repo owns templates, CSS, redirects, and deploy config only. The Blog repo can be private; the published site stays public.

## Local development

Clone **Blog** and **Writing** as siblings:

```text
Code/
  Blog/
  Writing/
```

```bash
cd Blog
npm install
npm start
```

Eleventy reads posts from `../Writing/posts` by default. Override with `POSTS_DIR` if needed.

```bash
POSTS_DIR=/path/to/Writing/posts npm start
```

Build once:

```bash
npm run build
```

Output is `_site/` (gitignored).

## Deploy (Render)

Infra lives in [`render.yaml`](render.yaml): static site, build that clones Writing, and Medium → new-path **301** routes.

### One-time setup

1. In the [Render Dashboard](https://dashboard.render.com), create a Blueprint from this repo (or connect the repo and apply `render.yaml`).
2. When prompted, set **`WRITING_GITHUB_TOKEN`**: a GitHub PAT (or fine-scoped token) with **read** access to `mpetrovich/Writing`.
3. After the first successful deploy, copy the service **Deploy Hook** URL from Settings.
4. In the **Writing** repo → Settings → Secrets and variables → Actions, add secret **`RENDER_DEPLOY_HOOK_URL`** with that URL.

### How publishes work

| Change | What happens |
|--------|----------------|
| Push to `main` on **Blog** | Render rebuilds automatically |
| Push to `main` on **Writing** (`posts/**`) | Writing Action curls the deploy hook → Render rebuilds (clones latest Writing) |

Do not edit redirects in the Render UI — keep [`render.yaml`](render.yaml) as the source of truth. Mapping notes: [`docs/redirects-medium.md`](docs/redirects-medium.md).

### Cutover: Medium → petro.blog

Do **not** point DNS until redirects work on the Render `*.onrender.com` URL.

1. Confirm preview: home, one post, `/feed.xml`, and a sample redirect, e.g.  
   `curl -sI https://YOUR-SERVICE.onrender.com/speed-drives-quality-5ccdafa0f385`  
   Expect `301` and `Location` ending in `/posts/speed-drives-quality/`.
2. In Medium, remove the custom domain `petro.blog`.
3. In Render, add custom domain `petro.blog` (and `www` if you use it); set DNS as Render shows.
4. Spot-check:  
   `curl -sI https://petro.blog/speed-drives-quality-5ccdafa0f385`  
   → `301` + `Location: https://petro.blog/posts/speed-drives-quality/`
5. Optional: on `medium.com/@…` posts, link to the new URLs / set Medium canonicals (those hosts cannot 301).

## Medium redirects

Applied as Render `routes` in `render.yaml` (HTTP 301). Human-readable table: [docs/redirects-medium.md](docs/redirects-medium.md).
