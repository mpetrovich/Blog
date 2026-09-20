---
name: blog-create-draft
description: >-
  Use when the user runs /blog-create-draft, asks to create a new draft, or wants a
  new unfinished article stub in posts/draft/ with placeholder frontmatter.
disable-model-invocation: true
---

# Create Draft

Create a new markdown draft under `posts/draft/` with the repo's draft frontmatter shape. Do not put new drafts in `posts/published/`.

Work in the **Blog** repo root.

## Workflow

1. **Resolve title and slug**
   - If the user gave a title/topic, use it for `title` in **sentence case** (capitalize the first word and proper nouns/acronyms only; lowercase the rest, including the first word after a colon) and derive `slug` as kebab-case (lowercase, hyphens, no punctuation).
   - If they gave an explicit slug, prefer that over a derived one.
   - If neither was given, ask once for a title before creating the file.
2. **Assign topics**
   - Set `topics` to 1–3 tags from topics already used on published posts (grep `posts/published/` for `topics:` or see `/topics/` on the site).
   - Pick tags that match the draft's subject. If the user specifies topics, use those (still limited to existing published topics unless they ask to add a new one).
   - Do not leave `topics: []` on new drafts.
3. **Choose path:** `posts/draft/<slug>.md`
4. **Refuse overwrite:** If that path already exists, stop and report it. Do not clobber.
5. **Write the file** using the template below. Fill `title`, `slug`, and `topics` when known; leave other placeholders empty as shown.
6. **Stop.** Do not add body copy, outlines, or README regeneration unless the user asks. Report the created path and chosen topics.

Drafts under `posts/draft/` are gitignored and local-only.

## Template

```markdown
---
title: <Sentence-case title>
subtitle: 
slug: <slug>
medium_id: 
draft: true
topics: [<topic>, ...]
---

```

Required fields always present: `title`, `subtitle`, `slug`, `medium_id`, `draft: true`, `topics` (1–3 tags).

- `subtitle` and `medium_id` stay empty placeholders until the user fills them.
- `topics` must be set during drafting — never leave `topics: []` on new drafts.
- Body after the closing `---` is empty (one trailing newline is fine).
- Never use published-post frontmatter (`date`, `syndicated_url`) for drafts.

## Example

User: `/blog-create-draft Decision fatigue`

Creates `posts/draft/decision-fatigue.md`:

```markdown
---
title: Decision fatigue
subtitle: 
slug: decision-fatigue
medium_id: 
draft: true
topics: [decision-making]
---

```
