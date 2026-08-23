# Typography preview page

**Date:** 2026-08-23  
**Status:** Approved for planning  
**Goal:** Private, visual-only page that exercises every typographic style currently defined for the site.

## Context

The blog uses a type-first CSS system in `src/css/style.css` (IBM Plex Serif for headings/body, IBM Plex Mono for meta). There is no dedicated place to scan the full stack at once. This page is a design reference for tuning type—not a public style guide.

## Requirements

- **Audience:** Author only (private design reference).
- **Discoverability:** Not linked from home, posts index, footer, or any public nav.
- **Indexing:** Emit `noindex, nofollow` via a front-matter flag.
- **Presentation:** Visual specimens only—no class names, CSS tokens, or technical annotations.
- **Coverage:** Every currently styled surface:
  - Site chrome: breadcrumbs (via base layout), intro, post list (title, optional subtitle, date), home footer / RSS line
  - Post header: title (`h1`), subtitle, meta
  - Post body: `h2`/`h3`/`h4`, paragraphs with a link, unordered and ordered lists, blockquote, inline `code`, `hr`, and an image
- **Fidelity:** Specimens must use the real production classes so the preview matches live pages.

## Non-goals

- Public style guide or documentation of the design system
- New typography tokens, fonts, or visual redesign
- Annotated specimen labels (roles, sizes, selectors)
- Linking the page from public navigation

## Approach

Add a static Nunjucks page that reuses `layouts/base.njk` and existing CSS classes. Prefer this over a markdown “fake post” (hard to show site chrome) or a standalone HTML duplicate (style drift).

## Design

### URL and metadata

| Item | Value |
|------|--------|
| File | `src/type.njk` |
| Permalink | `/type/` |
| Title | `Type` |
| Layout | `layouts/base.njk` |
| Front matter | `noindex: true` (and title/permalink/layout) |

Breadcrumbs render as elsewhere when visiting `/type/` directly (site title only; no posts crumb).

### Base layout change

In `base.njk`, when `noindex` is true, add:

```html
<meta name="robots" content="noindex, nofollow" />
```

No other layout behavior changes.

### Page content structure

Single scrolling page. Sections are separated by natural existing spacing / `hr` where needed—not by labeled “Site chrome” / “Post body” headings that call out the system. Content is placeholder copy that looks like real blog prose.

1. **Intro** — `.intro` with a short bio-style paragraph and inline links (matches homepage pattern).
2. **Post list** — `.post-list` with 2–3 sample items (title link, optional subtitle, `<time>`).
3. **Home footer** — `.home-footer` with an RSS-style link.
4. **Post header** — `.post-header` with `h1`, `.post-subtitle`, `.post-meta`.
5. **Post body** — `.post-body` containing:
   - Paragraphs (including a text link)
   - `h2`, `h3`, `h4`
   - `ul` and `ol`
   - `blockquote`
   - Inline `code`
   - `hr`
   - One `<img>` pointing at an existing post image under `/posts/images/` so image sizing/margins are visible (no new asset)

### CSS

No new design tokens or type rules. Only add CSS if specimen stacking needs a minimal separator that existing margins cannot provide; prefer reusing current spacing first.

### Implementation notes

- Keep the page self-contained in one Nunjucks file.
- Do not add the URL to `index.njk`, `posts-index.njk`, or feeds.
- Path prefix (`/Blog/`) continues to apply via Eleventy’s HtmlBasePlugin; use site-relative URLs as elsewhere.

## Success criteria

- Visiting `/type/` (under the configured path prefix) shows live examples of every style listed above.
- The page is not linked from public pages.
- Search engines are instructed not to index it.
- Changing `style.css` immediately changes the preview (shared classes, no forked styles).
