---
name: publish-draft
description: >-
  Use when the user runs /publish-draft, asks to publish a draft, or wants to
  move a Blog draft from posts/draft/ to posts/published/, update frontmatter,
  commit, and push so Render rebuilds.
disable-model-invocation: true
---

# Publish Draft

Promote one or more markdown drafts from `posts/draft/` to `posts/published/`, normalize published frontmatter, then commit and push **Blog** so Render rebuilds.

Work in the **Blog** repo root. Do not touch a separate Writing repo.

## Checklist

```
- [ ] 1. Resolve draft(s)
- [ ] 2. Confirm
- [ ] 3. Move file (+ images)
- [ ] 4. Update frontmatter
- [ ] 5. Commit Blog
- [ ] 6. Push Blog
```

After push, optionally run `/notify-subscribers` so the Buttondown list gets a “new post” email.
## Workflow

### 1. Resolve draft(s)

- From the user input and conversation context, resolve one or more targets to `posts/draft/<slug>.md`.
- Prefer frontmatter `slug` when present; otherwise use the filename stem.
- If ambiguous or missing, list `posts/draft/*.md` and ask once which to publish.
- **Stop** if any resolved draft file does not exist.
- **Stop** if `posts/published/<slug>.md` already exists for any target (do not overwrite).

### 2. Confirm

Before moving anything, show the planned publish set and wait for explicit confirmation.

For each resolved draft, report at least:

- Path: `posts/draft/<slug>.md` → `posts/published/<slug>.md`
- Title (from frontmatter)
- Planned `date`
- Planned `syndicated_url` (or that it will be omitted)
- Companion images: `posts/draft/images/<slug>/` if present, else none

Ask something like: “Publish these draft(s)?” **Do not proceed to step 3 until the user confirms.** If they correct the set, re-resolve and confirm again.

### 3. Move file (+ images)

`posts/draft/` is gitignored, so use filesystem moves (not `git mv`) for the draft side:

```bash
mkdir -p posts/published
mv "posts/draft/<slug>.md" "posts/published/<slug>.md"
```

If `posts/draft/images/<slug>/` exists:

```bash
mkdir -p posts/published/images
mv "posts/draft/images/<slug>" "posts/published/images/<slug>"
```

Leave body image paths as `images/...` (Eleventy rewrites them from `posts/published/`).

### 4. Update frontmatter

For each moved post, rewrite YAML to the **published** shape. Keep the body unchanged.

**Remove:** `draft`, `slug`, `medium_id`, and any legacy `author` / `image`.

**Set / keep:**

| Field | Rule |
|-------|------|
| `title` | Keep |
| `subtitle` | Keep (empty string OK) |
| `date` | `YYYY-MM-DD` unquoted. Use today unless the user gave a date. |
| `syndicated_url` | If `medium_id` was non-empty: `https://medium.com/@michael-petrovich/<slug>-<medium_id>`. Otherwise omit. |
| `topics` | Keep the draft's `topics` (should already be set during drafting). If empty, pick 1–3 from topics already used on published posts before publishing. |

**Target order:**

```markdown
---
title: <Title>
subtitle: <Subtitle>
date: YYYY-MM-DD
syndicated_url: https://medium.com/@michael-petrovich/<slug>-<medium_id>
topics: []
---
```

Omit the `syndicated_url` line when there is no Medium id. Never leave `draft: true` on a published post.

### 5. Commit Blog

Stage only the new published posts (and images). If unrelated dirty files exist, leave them unstaged; mention them after.

For a single post, subject `publish: <title>`. For multiple, one commit with subject `publish: <n> posts` and a short body listing titles.

```bash
git add -- "posts/published/<slug>.md" "posts/published/images/<slug>"
git status --porcelain=v1 -b
git commit -m "$(cat <<'EOF'
publish: <title>

EOF
)"
```

Follow the repo's usual commit rules (no `--no-verify`, no amend of others' commits, no secrets).

### 6. Push Blog

```bash
git push
```

If no upstream: `git push -u origin HEAD`. Never force-push.

Render rebuilds from the Blog push (no separate deploy hook or Writing workflow).

After a successful push, optionally remind the user they can run `/notify-subscribers` for that slug.

## Done

Report:

- Published path: `posts/published/<slug>.md`
- `date` (and `syndicated_url` if set)
- Commit hash + subject
- Push branch/remote

## Example

User: `/publish-draft hiring-for-diversity`

1. Resolve `posts/draft/hiring-for-diversity.md`
2. Confirm path, title, date, syndicated_url; wait for OK
3. `mv` to `posts/published/hiring-for-diversity.md`
4. Frontmatter becomes `title` / `subtitle` / `date: 2026-08-23` / `syndicated_url: https://medium.com/@michael-petrovich/hiring-for-diversity-a641003d6ab9` / `topics: [leadership]` (keeping the draft's topics; using that draft's `medium_id`)
5. Commit `publish: Hiring for Diversity`, push Blog
