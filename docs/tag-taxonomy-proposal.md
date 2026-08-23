# Tag taxonomy proposal

Proposal for filling the empty `tags: []` frontmatter on published posts. Nothing is applied yet — this is for review.

Corpus: **17** posts in `posts/published/` (2021–2026). Site does not surface tags yet.

## Recommendation

Use a **flat controlled vocabulary** of **10 topic tags** (kebab-case strings in YAML).

| Approach | Pros | Cons |
|----------|------|------|
| **A. Flat controlled vocab (recommended)** | Matches existing `tags: []`; easy to filter later; small set stays scannable | No hierarchy; some posts span domains |
| B. Primary category + optional facets | Clear “home” for each post | Needs schema change (`category` + `tags`); overkill for 17 posts |
| C. Freeform / Medium-style sprawl | Fast to tag | Drift, synonyms, weak filtering |

**Rules if approved:**

1. Only tags from the vocabulary below (no ad-hoc strings).
2. **1–3 tags** per post (prefer 2).
3. Prefer the *subject* of the post over the author’s role at the time.
4. Add a new vocabulary entry only when ≥2 posts would use it, or one post clearly needs a durable label.

## Vocabulary

| Tag | Use when the post is mainly about… | Avoid when… |
|-----|--------------------------------------|-------------|
| `career` | Role changes, trajectory, “what it’s like to work with me” | Pure craft advice with no personal/role frame |
| `product` | Product management, strategy, customer outcomes, PM craft | Engineering-only or people-management-only |
| `engineering` | Software craft, IC practice, technical systems | Process/leadership without engineering substance |
| `leadership` | Managing people, teams, delegation, high-impact traits | Solo craft or personal wellbeing only |
| `decision-making` | How to decide, problem framing, deliberate practice on decisions | General process metrics without a decision frame |
| `process` | How work flows: lead time, WIP, systems, speed ↔ quality feedback | Pure people skills or career narrative |
| `customers` | Customer interviews, discovery, talking to users | Product strategy that never touches research method |
| `ai` | AI’s effect on building software (tools, hype, judgment) | Mentions of tech trends without AI as the subject |
| `wellbeing` | Burnout, sustainability, energy at work | Ordinary career reflection without strain/recovery |
| `book-notes` | Book summaries / learning synthesis from a specific book | Posts that merely cite a book in passing |

**Intentionally omitted (for now):** `learning`, `readme`, `management` (folded into `leadership`), `quality`, `strategy`. Revisit if the corpus grows.

## Proposed assignments

| Post | Proposed tags |
|------|----------------|
| [Adventures in Product: The First 90 Days](../posts/published/adventures-in-product-the-first-90-days.md) | `career`, `product` |
| [Book Summary: Build What Matters](../posts/published/book-summary-build-what-matters.md) | `book-notes`, `product` |
| [Effective delegation](../posts/published/effective-delegation.md) | `leadership` |
| [From Engineering To Product: The Adventure Begins](../posts/published/from-engineering-to-product-the-adventure-begins.md) | `career`, `product` |
| [How to be successful](../posts/published/how-to-be-successful.md) | `leadership` |
| [How to make decisions that don’t suck](../posts/published/how-to-make-decisions-that-don-t-suck.md) | `decision-making` |
| [Lead time is the KPI for process](../posts/published/lead-time-is-the-kpi-for-process.md) | `process` |
| [Manager README](../posts/published/manager-readme.md) | `career`, `leadership` |
| [My README](../posts/published/personal-readme.md) | `career` |
| [Software engineering: a decade later](../posts/published/software-engineering-a-decade-later.md) | `engineering`, `ai`, `career` |
| [Speed drives quality](../posts/published/speed-drives-quality.md) | `process` |
| [The #1 Rule When Talking To Customers](../posts/published/the-1-rule-when-talking-to-customers.md) | `customers`, `product` |
| [The 2 questions that lead to better decisions, every time](../posts/published/the-2-questions-that-lead-to-better-decisions-every-time.md) | `decision-making` |
| [The highest leverage work happens early](../posts/published/the-highest-leverage-work-happens-early.md) | `decision-making`, `process` |
| [The Three Dominoes](../posts/published/the-three-dominoes.md) | `process`, `leadership` |
| [To The Brink Of Burnout And Back Again](../posts/published/to-the-brink-of-burnout-and-back-again.md) | `wellbeing`, `career` |
| [You need to calm down](../posts/published/you-need-to-calm-down.md) | `ai`, `engineering`, `process` |

### Coverage (how often each tag would appear)

| Tag | Count |
|-----|------:|
| `career` | 6 |
| `process` | 5 |
| `product` | 4 |
| `leadership` | 4 |
| `decision-making` | 3 |
| `engineering` | 2 |
| `ai` | 2 |
| `customers` | 1 |
| `wellbeing` | 1 |
| `book-notes` | 1 |

Singleton tags (`customers`, `wellbeing`, `book-notes`) are kept because they name durable themes you are likely to write again.

## Open questions for you

1. Prefer **`leadership`** vs **`management`** as the people-team label?
2. Keep **`book-notes`** as a format tag, or drop it and rely on `product` alone for that post?
3. Should **`My README` / Manager README** share a dedicated `readme` tag, or is `career` enough?
4. After approval: apply tags to frontmatter only, or also add tag pages / filters on the site?

## Out of scope for this PR

- Applying tags to post files
- Eleventy collections, tag index pages, or UI
- Changing draft/publish skills beyond documenting the vocabulary later
