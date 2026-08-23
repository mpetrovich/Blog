# Blog

Public site for [Michael Petrovich](https://github.com/mpetrovich), built with [Eleventy](https://www.11ty.dev/) and deployed to GitHub Pages.

Preview: https://mpetrovich.github.io/Blog/  
Eventual domain: https://petro.blog

Posts live in the separate [Writing](https://github.com/mpetrovich/Writing) repo. This repo owns templates, CSS, and deploy only.

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

Output is `_site/` (gitignored). The site uses `pathPrefix: /Blog` to match GitHub Pages project URL.

## How to publish

There is **no** automatic rebuild when Writing changes. After you add or edit posts in Writing:

1. Open this repo on GitHub → **Actions** → **Deploy GitHub Pages**
2. Click **Run workflow** → **Run workflow**

A push to `main` on Blog (template/CSS changes) also deploys.

### One-time: enable GitHub Pages

1. Repo **Settings** → **Pages**
2. **Source**: GitHub Actions
3. After the first successful workflow run, the site is at `https://mpetrovich.github.io/Blog/`
