import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { HtmlBasePlugin } from '@11ty/eleventy'
import pluginRss from '@11ty/eleventy-plugin-rss'
import CleanCSS from 'clean-css'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cssPath = path.join(__dirname, 'src/css/style.css')
const fontUnicodeRangePath = path.join(__dirname, 'src/fonts/subset-unicode-range.txt')

function cssInline() {
    let raw = fs.readFileSync(cssPath, 'utf8')
    if (fs.existsSync(fontUnicodeRangePath)) {
        const range = fs.readFileSync(fontUnicodeRangePath, 'utf8').trim()
        if (range) {
            raw = raw.replace(/unicode-range:\s*[^;]+;/g, `unicode-range: ${range};`)
        }
    }
    const { styles, errors } = new CleanCSS({ level: 1 }).minify(raw)
    if (errors?.length) {
        throw new Error(`CSS minify failed: ${errors.join('; ')}`)
    }
    return styles
}

function resolvePostsDir() {
    if (process.env.POSTS_DIR) {
        return path.resolve(process.env.POSTS_DIR)
    }
    return path.join(__dirname, '../posts/published')
}

/** `YYYY-MM-DD-slug` directory name → date + slug. */
const DATED_DIR_RE = /^(\d{4}-\d{2}-\d{2})-(.+)$/

/** Rewrite post-relative asset paths to site-absolute /posts/<slug>/... */
function rewriteAssetPaths(markdown, slug) {
    return markdown.replace(/\]\((?!https?:\/\/|\/|#)([^)]+)\)/g, `](/posts/${slug}/$1)`)
}

function listPostDirs(postsDir) {
    return fs
        .readdirSync(postsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => {
            const match = entry.name.match(DATED_DIR_RE)
            if (!match) return null
            const postPath = path.join(postsDir, entry.name, 'post.md')
            if (!fs.existsSync(postPath)) return null
            return { dirName: entry.name, date: match[1], slug: match[2], postPath }
        })
        .filter(Boolean)
}

export default function (eleventyConfig) {
    const postsDir = resolvePostsDir()
    if (!fs.existsSync(postsDir)) {
        throw new Error(`Posts directory not found: ${postsDir}. Set POSTS_DIR or add markdown under posts/published/.`)
    }

    eleventyConfig.addPlugin(HtmlBasePlugin)
    eleventyConfig.addPlugin(pluginRss)

    eleventyConfig.addPassthroughCopy({ 'src/fonts': 'fonts' })
    eleventyConfig.addPassthroughCopy({ 'src/js': 'js' })
    eleventyConfig.addPassthroughCopy({
        'src/favicon.png': 'favicon.png',
        'src/favicon-192.png': 'favicon-192.png',
        'src/favicon-512.png': 'favicon-512.png',
        'src/apple-touch-icon.png': 'apple-touch-icon.png',
        'src/profile.png': 'profile.png',
    })

    eleventyConfig.addWatchTarget(postsDir)
    eleventyConfig.addWatchTarget(cssPath)
    eleventyConfig.addWatchTarget('src/js')
    eleventyConfig.addGlobalData('cssInline', cssInline)

    const seenSlugs = new Set()
    for (const post of listPostDirs(postsDir)) {
        if (seenSlugs.has(post.slug)) {
            throw new Error(`Duplicate post slug "${post.slug}" from ${post.dirName}`)
        }
        seenSlugs.add(post.slug)

        const postDir = path.join(postsDir, post.dirName)
        for (const file of fs.readdirSync(postDir)) {
            if (file === 'post.md' || file.startsWith('.')) continue
            eleventyConfig.addPassthroughCopy({
                [path.join(postDir, file)]: `posts/${post.slug}/${file}`,
            })
        }

        const raw = fs.readFileSync(post.postPath, 'utf8')
        // virtualPath is relative to dir.input (src/)
        eleventyConfig.addTemplate(`posts/${post.slug}.md`, rewriteAssetPaths(raw, post.slug), {
            layout: 'layouts/post.njk',
            permalink: `/posts/${post.slug}/`,
            writingPost: true,
        })
    }

    eleventyConfig.addCollection('posts', (collectionApi) =>
        collectionApi
            .getAll()
            .filter((item) => item.data.writingPost)
            .sort((a, b) => b.date - a.date),
    )

    eleventyConfig.addCollection('topicPages', (collectionApi) => {
        const byTopic = new Map()
        for (const item of collectionApi.getAll().filter((entry) => entry.data.writingPost)) {
            for (const topic of item.data.topics ?? []) {
                if (!byTopic.has(topic)) byTopic.set(topic, [])
                byTopic.get(topic).push(item)
            }
        }
        for (const posts of byTopic.values()) {
            posts.sort((a, b) => b.date - a.date)
        }
        return [...byTopic.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([topic, posts]) => ({ topic, posts }))
    })

    eleventyConfig.addFilter('readableDate', (dateObj) => {
        if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
            return ''
        }
        const month = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            timeZone: 'UTC',
        }).format(dateObj)
        const day = String(dateObj.getUTCDate()).padStart(2, '0')
        const year = dateObj.getUTCFullYear()
        return `${month} ${day}, ${year}`
    })

    eleventyConfig.addFilter('isoDate', (dateObj) => {
        if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) {
            return ''
        }
        return dateObj.toISOString().slice(0, 10)
    })
}

export const config = {
    dir: {
        input: 'src',
        includes: '_includes',
        data: '_data',
        output: 'dist',
    },
    markdownTemplateEngine: false,
    htmlTemplateEngine: 'njk',
}
