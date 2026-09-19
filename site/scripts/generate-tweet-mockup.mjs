#!/usr/bin/env node
/**
 * Generate a Twitter/X post mockup (tweet.png) for a published post.
 *
 * Usage:
 *   node site/scripts/generate-tweet-mockup.mjs <slug> [--text "..."]
 *
 * Defaults body text to the post's subtitle. Override with --text.
 * Writes posts/published/images/<slug>/tweet.png
 *
 * Width is fixed; height fits the header + text + padding.
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import site from '../src/_data/site.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '../..')
const postsDir = process.env.POSTS_DIR || join(repoRoot, 'posts/published')
const assetsDir = join(__dirname, 'assets')
const profilePath = join(__dirname, '../src/profile.png')

const WIDTH = 1080
const PAD_X = 92
const PAD_Y = 88
const AVATAR = 88
const HEADER_GAP = 48
const BODY_SIZE = 40
const BODY_LINE_HEIGHT = 1.4
const PARA_GAP = 36
/** Tall canvas for measuring; cropped to content afterward. */
const MEASURE_HEIGHT = 4000
const DATED_POST_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/

function usage(message) {
    if (message) console.error(message)
    console.error('Usage: node site/scripts/generate-tweet-mockup.mjs <slug> [--text "..."]')
    process.exit(1)
}

function parseArgs(argv) {
    const args = argv.slice(2)
    let slug
    let text
    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--text') {
            text = args[++i]
            if (text === undefined) usage('Missing value for --text')
            continue
        }
        if (arg.startsWith('--text=')) {
            text = arg.slice('--text='.length)
            continue
        }
        if (arg.startsWith('-')) usage(`Unknown option: ${arg}`)
        if (slug) usage(`Unexpected argument: ${arg}`)
        slug = arg
    }
    if (!slug) usage()
    return { slug: slug.replace(/\.md$/, '').replace(DATED_POST_RE, '$2'), text }
}

function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!match) throw new Error('Post is missing YAML frontmatter')
    const data = {}
    for (const line of match[1].split(/\r?\n/)) {
        const idx = line.indexOf(':')
        if (idx === -1) continue
        const key = line.slice(0, idx).trim()
        let value = line.slice(idx + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        data[key] = value
    }
    return data
}

function slugFromFilename(file) {
    const match = file.match(DATED_POST_RE)
    if (match) return match[2]
    return file.endsWith('.md') ? file.slice(0, -3) : file
}

function findPostFile(slug) {
    const files = readdirSync(postsDir).filter((f) => f.endsWith('.md'))
    const match = files.find((f) => slugFromFilename(f) === slug)
    if (!match) throw new Error(`No published post for slug "${slug}" in ${postsDir}`)
    return join(postsDir, match)
}

function paragraphsFromText(text) {
    return text
        .replace(/\r\n/g, '\n')
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
}

function buildLayout({ author, handle, paragraphs, avatarDataUrl }) {
    return {
        type: 'div',
        props: {
            style: {
                width: '100%',
                height: '100%',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                padding: `${PAD_Y}px ${PAD_X}px`,
                fontFamily: 'Inter',
                color: '#0f1419',
            },
            children: [
                {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: HEADER_GAP,
                        },
                        children: [
                            {
                                type: 'img',
                                props: {
                                    src: avatarDataUrl,
                                    width: AVATAR,
                                    height: AVATAR,
                                    style: {
                                        width: AVATAR,
                                        height: AVATAR,
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                    },
                                },
                            },
                            {
                                type: 'div',
                                props: {
                                    style: {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginLeft: 20,
                                    },
                                    children: [
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    display: 'flex',
                                                    fontSize: 32,
                                                    fontWeight: 700,
                                                    lineHeight: 1.2,
                                                    letterSpacing: '-0.01em',
                                                },
                                                children: author,
                                            },
                                        },
                                        {
                                            type: 'div',
                                            props: {
                                                style: {
                                                    display: 'flex',
                                                    fontSize: 28,
                                                    fontWeight: 400,
                                                    color: '#536471',
                                                    marginTop: 4,
                                                    lineHeight: 1.2,
                                                },
                                                children: handle,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                            fontSize: BODY_SIZE,
                            fontWeight: 400,
                            lineHeight: BODY_LINE_HEIGHT,
                            letterSpacing: '-0.01em',
                            color: '#0f1419',
                        },
                        children: paragraphs.map((paragraph, index) => ({
                            type: 'div',
                            props: {
                                style: {
                                    display: 'flex',
                                    marginTop: index === 0 ? 0 : PARA_GAP,
                                },
                                children: paragraph,
                            },
                        })),
                    },
                },
            ],
        },
    }
}

/** Last row (0-based) with a pixel that isn't near-white. */
function lastContentRow(raw, width, height, channels) {
    const threshold = 250
    for (let y = height - 1; y >= 0; y--) {
        const row = y * width * channels
        for (let x = 0; x < width; x++) {
            const i = row + x * channels
            const r = raw[i]
            const g = raw[i + 1]
            const b = raw[i + 2]
            if (r < threshold || g < threshold || b < threshold) return y
        }
    }
    return 0
}

async function renderMockup({ author, handle, bodyText, avatarDataUrl, fonts }) {
    const paragraphs = paragraphsFromText(bodyText)
    if (!paragraphs.length) throw new Error('Tweet body text is empty')

    const layout = buildLayout({ author, handle, paragraphs, avatarDataUrl })
    const svg = await satori(layout, { width: WIDTH, height: MEASURE_HEIGHT, fonts })
    const rendered = new Resvg(svg, {
        fitTo: { mode: 'width', value: WIDTH },
    })
        .render()
        .asPng()

    const { data, info } = await sharp(rendered).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    const bottom = lastContentRow(data, info.width, info.height, info.channels)
    const height = Math.min(info.height, bottom + 1 + PAD_Y)

    return sharp(rendered)
        .extract({ left: 0, top: 0, width: info.width, height })
        .png()
        .toBuffer()
}

async function main() {
    const { slug, text: textOverride } = parseArgs(process.argv)
    const postPath = findPostFile(slug)
    const frontmatter = parseFrontmatter(readFileSync(postPath, 'utf8'))
    const bodyText = (textOverride ?? frontmatter.subtitle ?? '').trim()
    if (!bodyText) {
        throw new Error(`No tweet text: pass --text or set subtitle on ${postPath}`)
    }

    if (!existsSync(profilePath)) {
        throw new Error(`Missing profile image: ${profilePath}`)
    }

    const fontRegular = readFileSync(join(assetsDir, 'fonts/Inter-Regular.ttf'))
    const fontBold = readFileSync(join(assetsDir, 'fonts/Inter-Bold.ttf'))
    const fonts = [
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBold, weight: 700, style: 'normal' },
    ]

    const avatarBuf = readFileSync(profilePath)
    const avatarDataUrl = `data:image/png;base64,${avatarBuf.toString('base64')}`
    const png = await renderMockup({
        author: site.author,
        handle: site.twitterHandle,
        bodyText,
        avatarDataUrl,
        fonts,
    })

    const outDir = join(postsDir, 'images', slug)
    mkdirSync(outDir, { recursive: true })
    const outPath = join(outDir, 'tweet.png')
    writeFileSync(outPath, png)
    const meta = await sharp(png).metadata()
    const kb = Math.round(statSync(outPath).size / 1024)
    console.log(`Wrote ${outPath} (${meta.width}×${meta.height}, ${kb}KB)`)
}

main().catch((err) => {
    console.error(err.message || err)
    process.exit(1)
})
