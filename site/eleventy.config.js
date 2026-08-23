import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { HtmlBasePlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, "src/css/style.css");

function cssHash() {
	return crypto
		.createHash("sha256")
		.update(fs.readFileSync(cssPath))
		.digest("hex")
		.slice(0, 8);
}

function resolvePostsDir() {
	if (process.env.POSTS_DIR) {
		return path.resolve(process.env.POSTS_DIR);
	}
	return path.join(__dirname, "../posts/published");
}

/** Rewrite post-relative image paths to site-absolute /posts/images/... */

function rewriteImagePaths(markdown) {
	return markdown.replace(/\]\(images\//g, "](/posts/images/");
}

export default function (eleventyConfig) {
	const postsDir = resolvePostsDir();
	if (!fs.existsSync(postsDir)) {
		throw new Error(
			`Posts directory not found: ${postsDir}. Set POSTS_DIR or add markdown under posts/published/.`,
		);
	}

	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(pluginRss);

	eleventyConfig.addPassthroughCopy({ "src/css": "css" });
	eleventyConfig.addPassthroughCopy({ "src/js": "js" });
	eleventyConfig.addPassthroughCopy({
		[path.join(postsDir, "images")]: "posts/images",
	});

	eleventyConfig.addWatchTarget(postsDir);
	eleventyConfig.addWatchTarget(cssPath);
	eleventyConfig.addWatchTarget("src/js");
	eleventyConfig.addGlobalData("cssHash", cssHash);

	for (const file of fs.readdirSync(postsDir)) {
		if (!file.endsWith(".md")) continue;
		const slug = file.slice(0, -3);
		const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
		// virtualPath is relative to dir.input (src/)
		eleventyConfig.addTemplate(`posts/${slug}.md`, rewriteImagePaths(raw), {
			layout: "layouts/post.njk",
			permalink: `/posts/${slug}/`,
			writingPost: true,
		});
	}

	eleventyConfig.addCollection("posts", (collectionApi) =>
		collectionApi
			.getAll()
			.filter((item) => item.data.writingPost)
			.sort((a, b) => b.date - a.date),
	);

	eleventyConfig.addCollection("tagPages", (collectionApi) => {
		const byTag = new Map();
		for (const item of collectionApi
			.getAll()
			.filter((entry) => entry.data.writingPost)) {
			for (const tag of item.data.tags ?? []) {
				if (!byTag.has(tag)) byTag.set(tag, []);
				byTag.get(tag).push(item);
			}
		}
		for (const posts of byTag.values()) {
			posts.sort((a, b) => b.date - a.date);
		}
		return [...byTag.entries()]
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([tag, posts]) => ({ tag, posts }));
	});

	eleventyConfig.addFilter("readableDate", (dateObj) => {
		if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
			return "";
		}
		const month = new Intl.DateTimeFormat("en-US", {
			month: "short",
			timeZone: "UTC",
		}).format(dateObj);
		const day = String(dateObj.getUTCDate()).padStart(2, "0");
		const year = dateObj.getUTCFullYear();
		return `${month} ${day}, ${year}`;
	});

	eleventyConfig.addFilter("isoDate", (dateObj) => {
		if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
			return "";
		}
		return dateObj.toISOString().slice(0, 10);
	});
}

export const config = {
	dir: {
		input: "src",
		includes: "_includes",
		data: "_data",
		output: "dist",
	},
	markdownTemplateEngine: false,
	htmlTemplateEngine: "njk",
};
