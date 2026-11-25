---
name: blog-refine-draft
description: >-
  Use when the user runs /blog-refine-draft, asks for a light edit or refine pass on a
  draft, or wants readability/coherence feedback before posting or finishing a draft.
---

# Refine Draft

Give a light readability/coherence pass on a Blog draft. Preserve the author's voice. Do not polish into a different essay.

Work in the **Blog** repo root. Prefer `posts/draft/<slug>/post.md`; published posts only if the user points at one.

## Default behavior

**Notes only — no rewrite.** Unless the user explicitly asks for edits, a surgical pass, or a rewrite:

1. Read the draft (body; frontmatter only as context).
2. Return a short list of readability/coherence notes (a handful of bullets max).
3. Focus on: unclear jumps, buried point, repeated ideas, sentences that force re-reads, structure that fights the argument.
4. Skip: grammar/spelling nitpicks, tone homogenization, "more professional" rewrites, synonym swaps, invented examples or missing sections.

Stop after notes. Ask if they want a surgical pass.

## Surgical pass (only when asked)

When the user asks for edits / a surgical pass / "apply those notes":

1. Change the minimum text that fixes the agreed issues.
2. Keep **≥80% of the author's words** in touched passages (same phrasing, cadence, and informal bits). Prefer cut/reorder/clarify over paraphrase.
3. Do **not** invent content, add sections, or "complete" unfinished thoughts unless asked.
4. Do **not** edit frontmatter unless the user asked to change it.
5. Show diffs of every change (see below), then optionally offer to write the file if they confirm.

## Diff presentation

Prefer inline red/green in chat:

- Deleted: `<span style="color:red"><s>old text</s></span>`
- Added: `<span style="color:green">new text</span>`

If the channel strips HTML, fall back to **bold** on changed spans and a short before→after for each edit. Never dump a full rewritten post without marking what changed.

## Hard rules

| Do | Don't |
|----|-------|
| Notes first when unprompted | Rewrite unprompted |
| Surgical edits on request | Full-pass "improve the writing" |
| Keep voice and informal wording | Smooth into generic blog tone |
| Diff every change | Silent file overwrite |
| Leave frontmatter alone | Touch `title` / `topics` / etc. unless asked |
| Flag holes without filling them | Invent missing arguments or anecdotes |

## Voice check ("What's the rush?" style)

Informal, punchy drafts should stay informal and punchy. If a pass would replace casual phrasing with polished synonyms, drop that edit. Same words, clearer order — not a new voice.

## Example

User: `/blog-refine-draft posts/draft/whats-the-rush/post.md`

**Notes (default):**

- Opening buries the claim — first paragraph sets scene; the point lands mid-way.
- Second section repeats the "wait vs ship" contrast twice; one pass is enough.
- Closing question is strong; the sentence before it hedges and softens it.

User: "surgical pass on the opening and cut the repeat"

**Diff (illustrative):**

<span style="color:red"><s>There's a thing that keeps coming up in planning meetings, which is that people feel this pressure to move fast, and</s></span> <span style="color:green">In planning meetings people feel pressure to move fast, and</span> …

(Then the repeated contrast paragraph removed with red strikethrough.)

Do not write the file until the user confirms.
