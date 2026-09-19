---
name: draft-linkedin-post
description: >-
  Draft a LinkedIn caption to post with the tweet mockup image for a published
  Blog post. Use when the user runs /draft-linkedin-post, asks for LinkedIn
  copy for a post, or as the LinkedIn step inside /publish-draft.
disable-model-invocation: true
---

# Draft LinkedIn Post

Write copy-paste LinkedIn caption text for a published Blog post. It accompanies `posts/published/images/<slug>/tweet.png` (from `/create-tweet-mockup`). The image already shows the subtitle; the caption must not repeat it.

Work in the **Blog** repo root.

## Checklist

```
- [ ] 1. Resolve post
- [ ] 2. Draft caption
- [ ] 3. Present for copy-paste
```

## Workflow

### 1. Resolve post

- Prefer an explicit slug or path from the user (with or without `.md` / `YYYY-MM-DD-` prefix).
- Target must exist as `posts/published/YYYY-MM-DD-<slug>.md`.
- **Stop** if missing.
- Read frontmatter (`title`, `subtitle`) and enough of the body to pull one concrete idea for the hook.
- Canonical URL: `https://petro.blog/posts/<slug>/` (from `site.url` in `site/src/_data/site.js` when overridden).
- Companion image: `posts/published/images/<slug>/tweet.png`. If missing, note that `/create-tweet-mockup` should be run first; still draft the caption.

### 2. Draft caption

Shape (2–4 short paragraphs, blank line between them):

1. **Hook** — common framing or contrast (what most teams ask / do).
2. **Better question or beat** — one concrete idea from the post that complements the image; do not restate the subtitle.
3. **URL alone** on its own final line.

Rules:

- Do **not** repeat the subtitle or the tweet mockup text.
- Do **not** add “I wrote about…”, “New post:”, or similar filler before the link.
- Prefer commas over em dashes.
- No hashtags unless the user asks.
- Keep it skim-friendly; LinkedIn truncates long openers.

### 3. Present for copy-paste

Show:

1. The caption in a single fenced block the user can copy whole.
2. Reminder to attach `posts/published/images/<slug>/tweet.png` as the post image.

Do **not** commit or push. Iterate if the user edits tone or asks for another take.

## Example

Post: `optimize-for-learning-not-shipping`  
Subtitle (on image): *Shipping feels productive, but learning is what validates the business…*

```text
Most teams ask “what should we ship next?”

Better question: which part of the business hypothesis are we still unsure about, and what’s the cheapest way to learn?

https://petro.blog/posts/optimize-for-learning-not-shipping/
```

Attach: `posts/published/images/optimize-for-learning-not-shipping/tweet.png`
