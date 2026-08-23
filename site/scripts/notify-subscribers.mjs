#!/usr/bin/env node
/**
 * Send a templatized "new post" email via Buttondown.
 *
 * Usage: node site/scripts/notify-subscribers.mjs <slug>
 * Env: BUTTONDOWN_API_KEY (required) — from process env or repo-root .env
 * Optional: SITE_URL (default https://petro.blog), POSTS_DIR
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");

function loadEnvFile(filePath) {
	if (!existsSync(filePath)) return;
	for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const idx = trimmed.indexOf("=");
		if (idx === -1) continue;
		const key = trimmed.slice(0, idx).trim();
		let value = trimmed.slice(idx + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
}

loadEnvFile(join(repoRoot, ".env"));

const postsDir = process.env.POSTS_DIR || join(repoRoot, "posts/published");
const siteUrl = (process.env.SITE_URL || "https://petro.blog").replace(/\/$/, "");
const apiKey = process.env.BUTTONDOWN_API_KEY;

function usage() {
	console.error("Usage: node site/scripts/notify-subscribers.mjs <slug>");
	process.exit(1);
}

function parseFrontmatter(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) {
		throw new Error("Post is missing YAML frontmatter");
	}
	const data = {};
	for (const line of match[1].split(/\r?\n/)) {
		const idx = line.indexOf(":");
		if (idx === -1) continue;
		const key = line.slice(0, idx).trim();
		let value = line.slice(idx + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		data[key] = value;
	}
	return { data, body: match[2] };
}

function resolveSlug(arg) {
	if (arg) return arg.replace(/\.md$/, "");
	const files = readdirSync(postsDir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => {
			const path = join(postsDir, f);
			return { slug: f.replace(/\.md$/, ""), mtime: statSync(path).mtimeMs };
		})
		.sort((a, b) => b.mtime - a.mtime);
	if (!files.length) {
		throw new Error(`No posts in ${postsDir}`);
	}
	return files[0].slug;
}

function buildEmail({ title, subtitle, url }) {
	const parts = [`# ${title}`, ""];
	if (subtitle) {
		parts.push(subtitle, "");
	}
	parts.push(
		`New on petro.blog: [${title}](${url})`,
		"",
		`[Read the post →](${url})`,
		"",
	);
	return parts.join("\n");
}

async function sendEmail({ subject, body }) {
	const headers = {
		Authorization: `Token ${apiKey}`,
		"Content-Type": "application/json",
		"X-API-Version": "2026-04-01",
		"X-Buttondown-Live-Dangerously": "true",
	};
	const res = await fetch("https://api.buttondown.com/v1/emails", {
		method: "POST",
		headers,
		body: JSON.stringify({
			subject,
			body,
			status: "about_to_send",
		}),
	});
	const text = await res.text();
	let json;
	try {
		json = JSON.parse(text);
	} catch {
		json = { raw: text };
	}
	if (!res.ok) {
		const err = new Error(
			`Buttondown API ${res.status}: ${typeof json === "object" ? JSON.stringify(json) : text}`,
		);
		err.response = json;
		throw err;
	}
	return json;
}

async function main() {
	if (!apiKey) {
		console.error(
			"BUTTONDOWN_API_KEY is not set. Add it to .env (see .env.example) or export it. See docs/buttondown-setup.md",
		);
		process.exit(1);
	}

	const slug = resolveSlug(process.argv[2]);
	const path = join(postsDir, `${slug}.md`);
	let raw;
	try {
		raw = readFileSync(path, "utf8");
	} catch {
		console.error(`Post not found: ${path}`);
		process.exit(1);
	}

	const { data } = parseFrontmatter(raw);
	const title = data.title;
	if (!title) {
		console.error("Post frontmatter is missing title");
		process.exit(1);
	}
	const subtitle = data.subtitle || "";
	const url = `${siteUrl}/posts/${slug}/`;
	const subject = `New post: ${title}`;
	const body = buildEmail({ title, subtitle, url });

	console.log(`Sending: ${subject}`);
	console.log(`URL: ${url}`);

	const result = await sendEmail({ subject, body });
	const id = result.id || result?.results?.id || "(unknown id)";
	console.log(`Sent. Buttondown email id: ${id}`);
}

main().catch((err) => {
	console.error(err.message || err);
	process.exit(1);
});
