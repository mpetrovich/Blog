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

/** Rewrite post-relative image paths to site-absolute /posts/images/... */

function rewriteImagePaths(markdown) {
    return markdown.replace(/\]\(images\//g, '](/posts/images/')
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
    })
    eleventyConfig.addPassthroughCopy({
        [path.join(postsDir, 'images')]: 'posts/images',
    })

    eleventyConfig.addWatchTarget(postsDir)
    eleventyConfig.addWatchTarget(cssPath)
    eleventyConfig.addWatchTarget('src/js')
    eleventyConfig.addGlobalData('cssInline', cssInline)

    for (const file of fs.readdirSync(postsDir)) {
        if (!file.endsWith('.md')) continue
        const slug = file.slice(0, -3)
        const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
        // virtualPath is relative to dir.input (src/)
        eleventyConfig.addTemplate(`posts/${slug}.md`, rewriteImagePaths(raw), {
            layout: 'layouts/post.njk',
            permalink: `/posts/${slug}/`,
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
