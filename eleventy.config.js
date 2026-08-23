import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HtmlBasePlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolvePostsDir() {
	if (process.env.POSTS_DIR) {
		return path.resolve(process.env.POSTS_DIR);
	}
	const ciPath = path.join(__dirname, "Writing/posts");
	if (fs.existsSync(ciPath)) {
		return ciPath;
	}
	return path.join(__dirname, "../Writing/posts");
}

/** Rewrite post-relative image paths so they resolve from /posts/<slug>/ to /posts/images/. */
function rewriteImagePaths(markdown) {
	return markdown.replace(/\]\(images\//g, "](../images/");
}

export default function (eleventyConfig) {
	const postsDir = resolvePostsDir();
	if (!fs.existsSync(postsDir)) {
		throw new Error(
			`Posts directory not found: ${postsDir}. Set POSTS_DIR or clone Writing as a sibling of Blog.`,
		);
	}

	eleventyConfig.addPlugin(HtmlBasePlugin);
	eleventyConfig.addPlugin(pluginRss);

	eleventyConfig.addPassthroughCopy({ "src/css": "css" });
	eleventyConfig.addPassthroughCopy({
		[path.join(postsDir, "images")]: "posts/images",
	});

	eleventyConfig.addWatchTarget(postsDir);

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

	eleventyConfig.addFilter("readableDate", (dateObj) => {
		if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
			return "";
		}
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			timeZone: "UTC",
		}).format(dateObj);
	});

	eleventyConfig.addFilter("isoDate", (dateObj) => {
		if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
			return "";
		}
		return dateObj.toISOString().slice(0, 10);
	});
}

export const config = {
	pathPrefix: "/Blog/",
	dir: {
		input: "src",
		includes: "_includes",
		data: "_data",
		output: "_site",
	},
	markdownTemplateEngine: false,
	htmlTemplateEngine: "njk",
};
