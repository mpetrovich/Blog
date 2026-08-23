---
name: notify-subscribers
description: >-
  Use when the user runs /notify-subscribers, asks to email subscribers about a
  new post, or wants to send a templatized Buttondown “new post” notification.
disable-model-invocation: true
---

# Notify Subscribers

Send a short “new post” email to the Buttondown list for one published post. **Does not** publish or push; run after `/publish-draft` when the post is live (or about to be).

Work in the **Blog** repo root. Setup: [`docs/buttondown-setup.md`](../../../docs/buttondown-setup.md).

## Checklist

```
- [ ] 1. Prerequisites
- [ ] 2. Resolve slug
- [ ] 3. Confirm
- [ ] 4. Send via script
- [ ] 5. Report
```

## Workflow

### 1. Prerequisites

- `BUTTONDOWN_API_KEY` must be set — prefer repo-root `.env` (gitignored; see `.env.example`). Never commit it.
- Target post must exist at `posts/published/<slug>.md`.
- If the key is missing, stop and point to `docs/buttondown-setup.md`.

### 2. Resolve slug

- Prefer an explicit slug from the user (with or without `.md`).
- If none, use the most recently modified file under `posts/published/*.md` (same as the script’s default).
- **Stop** if the resolved file does not exist.

### 3. Confirm

Before sending, show and wait for explicit OK:

- Path: `posts/published/<slug>.md`
- Title (and subtitle if present)
- Permalink: `https://petro.blog/posts/<slug>/` (or `SITE_URL` if set)
- Subject line: `New post: <title>`

Ask: “Send this email to Buttondown subscribers?” **Do not send until the user confirms.**

### 4. Send via script

```bash
node site/scripts/notify-subscribers.mjs "<slug>"
```

The script:

1. Reads frontmatter from `posts/published/<slug>.md`
2. Builds a Markdown body (title, optional subtitle, link + CTA)
3. `POST`s to `https://api.buttondown.com/v1/emails` with `status: about_to_send`

Email body template (for reference; the script owns the exact text):

```markdown
# <title>

<subtitle>

New on petro.blog: [<title>](<url>)

[Read the post →](<url>)
```

### 5. Report

- Subject and permalink
- Buttondown email id from the script output
- Reminder that unsubscribe is handled by Buttondown

## Notes

- Separate from `/publish-draft` on purpose — publish never auto-emails.
- Do not create drafts in the Buttondown UI as a substitute unless the API fails and the user asks to fall back manually.
- Do not put the API key in repo files, commit messages, or chat paste unless the user already exposed it.

## Example

User: `/notify-subscribers effective-delegation`

1. Resolve `posts/published/effective-delegation.md`
2. Confirm title + `https://petro.blog/posts/effective-delegation/`
3. Run `node site/scripts/notify-subscribers.mjs effective-delegation`
4. Report success + email id
