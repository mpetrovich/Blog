---
name: create-draft
description: >-
  Use when the user runs /create-draft, asks to create a new draft, or wants a
  new unfinished article stub in posts/draft/ with placeholder frontmatter.
disable-model-invocation: true
---

# Create Draft

Create a new markdown draft under `posts/draft/` with the repo's draft frontmatter shape. Do not put new drafts in `posts/published/`.

Work in the **Blog** repo root.

## Workflow

1. **Resolve title and slug**
   - If the user gave a title/topic, use it for `title` and derive `slug` as kebab-case (lowercase, hyphens, no punctuation).
   - If they gave an explicit slug, prefer that over a derived one.
   - If neither was given, ask once for a title before creating the file.
2. **Choose path:** `posts/draft/<slug>.md`
3. **Refuse overwrite:** If that path already exists, stop and report it. Do not clobber.
4. **Write the file** using the template below. Fill only `title` and `slug` when known; leave other placeholders empty as shown.
5. **Stop.** Do not add body copy, outlines, or README regeneration unless the user asks. Report the created path.

Drafts under `posts/draft/` are gitignored and local-only.

## Template

```markdown
---
title: <Title>
subtitle: 
slug: <slug>
medium_id: 
draft: true
topics: []
---

```

Required fields always present: `title`, `subtitle`, `slug`, `medium_id`, `draft: true`, `topics: []`.

- `subtitle` and `medium_id` stay empty placeholders until the user fills them.
- Leave `topics: []` on drafts. On publish, pick 1–3 topics already used on published posts (see `/topics/` on the site).
- Body after the closing `---` is empty (one trailing newline is fine).
- Never use published-post frontmatter (`date`, `syndicated_url`) for drafts.

## Example

User: `/create-draft Decision fatigue`

Creates `posts/draft/decision-fatigue.md`:

```markdown
---
title: Decision fatigue
subtitle: 
slug: decision-fatigue
medium_id: 
draft: true
topics: []
---

```
