---
name: tweet-mockup
description: >-
  Generate a square Twitter/X post mockup (tweet.png) from a published post
  subtitle. Use when the user runs /tweet-mockup, asks for a tweet screenshot
  or social card, or as the automatic tweet step inside /publish-draft.
disable-model-invocation: true
---

# Tweet Mockup

Render a Twitter/X-style post mockup PNG for a published Blog post. Width is fixed; height fits the content. Body text defaults to the post `subtitle`; override with `--text` when needed.

Work in the **Blog** repo root.

## Checklist

```
- [ ] 1. Resolve slug (+ optional text)
- [ ] 2. Generate tweet.png
- [ ] 3. Report path
```

## Workflow

### 1. Resolve slug (+ optional text)

- Prefer an explicit slug from the user (with or without `.md` / `YYYY-MM-DD-` prefix).
- Optional override: custom body text (do **not** invent copy; only use what the user supplies).
- Target post must exist as `posts/published/YYYY-MM-DD-<slug>.md`.
- **Stop** if the post is missing.
- **Stop** if there is no `--text` override and frontmatter `subtitle` is empty — ask for text once.

### 2. Generate tweet.png

```bash
node site/scripts/generate-tweet-mockup.mjs <slug>
# or
node site/scripts/generate-tweet-mockup.mjs <slug> --text "Custom tweet body"
```

Writes `posts/published/images/<slug>/tweet.png` (creates the images directory if needed).

Uses `site/src/profile.png`, author **Michael Petrovich**, and handle **@mikepetrovich** (see `site/src/_data/site.js`). Do not hand-edit the PNG; re-run the script.

Requires `site/` deps (`npm install` in `site/` once). Fonts live under `site/scripts/assets/fonts/`.

### 3. Report path

Report the output path and whether text came from `subtitle` or `--text`.

When run standalone (not from `/publish-draft`), do **not** commit or push unless the user asks.

## Example

User: `/tweet-mockup optimize-for-learning-not-shipping`

```bash
node site/scripts/generate-tweet-mockup.mjs optimize-for-learning-not-shipping
```

→ `posts/published/images/optimize-for-learning-not-shipping/tweet.png`
