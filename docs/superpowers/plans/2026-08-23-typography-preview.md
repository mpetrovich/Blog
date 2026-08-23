# Typography Preview Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a private `/type/` page that visually exercises every typographic style defined in `src/css/style.css`.

**Architecture:** One Nunjucks page reuses `layouts/base.njk` and production CSS classes. A front-matter `noindex` flag adds a robots meta in the base layout. The page is not linked from public navigation.

**Tech Stack:** Eleventy 3, Nunjucks, existing `style.css`

## Global Constraints

- Private design reference — not linked from home, posts index, footer, or feeds
- Visual specimens only — no class-name or token labels on the page
- Cover site chrome + post header + post body styles already in CSS
- No new typography tokens or fonts
- Path prefix `/Blog/` via HtmlBasePlugin — use root-relative URLs as elsewhere
- Image specimen: existing `/posts/images/effective-delegation/01.png`

---

### Task 1: noindex support in base layout

**Files:**
- Modify: `src/_includes/layouts/base.njk`

**Interfaces:**
- Consumes: front-matter boolean `noindex`
- Produces: `<meta name="robots" content="noindex, nofollow" />` when true

- [ ] **Step 1: Add robots meta after the description meta**

In `src/_includes/layouts/base.njk`, after the description `<meta>`, insert:

```njk
		{%- if noindex %}
		<meta name="robots" content="noindex, nofollow" />
		{%- endif %}
```

- [ ] **Step 2: Commit**

```bash
git add src/_includes/layouts/base.njk
git commit -m "feat(site): support noindex via front matter"
```

---

### Task 2: Typography preview page

**Files:**
- Create: `src/type.njk`

**Interfaces:**
- Consumes: `layouts/base.njk`, `noindex` flag, production CSS classes
- Produces: `/type/` HTML page

- [ ] **Step 1: Create `src/type.njk`**

```njk
---
layout: layouts/base.njk
permalink: /type/
title: Type
noindex: true
---

<section class="intro">
	<p>
		<strong>Specimen</strong>. Short intro copy at the homepage size, with
		<a href="{{ site.linkedin }}">a link</a>
		and
		<a href="{{ site.github }}">another</a>.
	</p>
</section>

<section class="post-list" aria-label="Sample posts">
	<ul>
		<li>
			<div class="post-list-main">
				<a href="/posts/">How lead time shapes quality</a>
				<p class="post-list-subtitle">A subtitle in muted body size</p>
			</div>
			<time datetime="2024-06-12">Jun 12, 2024</time>
		</li>
		<li>
			<div class="post-list-main">
				<a href="/posts/">Decisions that do not suck</a>
			</div>
			<time datetime="2023-11-03">Nov 03, 2023</time>
		</li>
		<li>
			<div class="post-list-main">
				<a href="/posts/">Calm is a competitive advantage</a>
				<p class="post-list-subtitle">Optional second line under the title</p>
			</div>
			<time datetime="2022-02-18">Feb 18, 2022</time>
		</li>
	</ul>
</section>

<p class="home-footer">
	<a href="/feed.xml">RSS</a>
</p>

<article class="post">
	<header class="post-header">
		<h1>Post title at display size</h1>
		<p class="post-subtitle">Subtitle in muted step-1</p>
		<p class="post-meta">
			<time datetime="2024-06-12">Jun 12, 2024</time>
		</p>
	</header>
	<div class="post-body">
		<p>
			Body copy at the reading measure. A sentence with
			<a href="/posts/">an inline link</a>
			and enough length to show line height and wrapping.
		</p>
		<h2>Section heading</h2>
		<p>
			After an h2, paragraphs keep their usual spacing. Inline
			<code>code</code> sits in the flow without changing the rhythm.
		</p>
		<h3>Subsection</h3>
		<p>h3 sits between section title and body.</p>
		<h4>Minor heading</h4>
		<p>h4 is the smallest post heading step.</p>
		<ul>
			<li>Unordered item one</li>
			<li>Unordered item two</li>
			<li>Unordered item three</li>
		</ul>
		<ol>
			<li>Ordered item one</li>
			<li>Ordered item two</li>
			<li>Ordered item three</li>
		</ol>
		<blockquote>
			<p>A quoted passage in muted ink with a left rule.</p>
		</blockquote>
		<hr />
		<p>A rule above an image specimen:</p>
		<img
			src="/posts/images/effective-delegation/01.png"
			alt="Sample post image"
		/>
		<p>Closing paragraph after the image.</p>
	</div>
</article>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build` (or `npx @11ty/eleventy`) from `/Users/petro/Code/Blog`

Expected:
- `_site/type/index.html` exists
- Contains `noindex, nofollow`
- Contains classes `intro`, `post-list`, `post-header`, `post-body`, `home-footer`
- Home/index and posts pages do not link to `/type/`

- [ ] **Step 3: Commit**

```bash
git add src/type.njk
git commit -m "feat(site): add private typography preview at /type/"
```

---

### Task 3: Plan + spec already committed

No further docs tasks. Spec: `docs/superpowers/specs/2026-08-23-typography-preview-design.md`.
