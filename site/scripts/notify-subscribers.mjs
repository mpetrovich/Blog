#!/usr/bin/env node
/**
 * Send a templatized "new post" email via Buttondown.
 *
 * Usage: node site/scripts/notify-subscribers.mjs <slug>
 * Env: BUTTONDOWN_API_KEY (required) — from process env or repo-root .env
 * Optional: SITE_URL (default https://petro.blog), POSTS_DIR
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '../..')

function loadEnvFile(filePath) {
    if (!existsSync(filePath)) return
    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const idx = trimmed.indexOf('=')
        if (idx === -1) continue
        const key = trimmed.slice(0, idx).trim()
        let value = trimmed.slice(idx + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
        }
        if (process.env[key] === undefined) {
            process.env[key] = value
        }
    }
}

loadEnvFile(join(repoRoot, '.env'))

const postsDir = process.env.POSTS_DIR || join(repoRoot, 'posts/published')
const siteUrl = (process.env.SITE_URL || 'https://petro.blog').replace(/\/$/, '')
const apiKey = process.env.BUTTONDOWN_API_KEY

function usage() {
    console.error('Usage: node site/scripts/notify-subscribers.mjs <slug>')
    process.exit(1)
}

function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!match) {
        throw new Error('Post is missing YAML frontmatter')
    }
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
    return { data, body: match[2] }
}

/** `YYYY-MM-DD-slug.md` → slug (date stays in the filename only). */
const DATED_POST_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/

function slugFromFilename(file) {
    const match = file.match(DATED_POST_RE)
    if (match) return match[2]
    return file.endsWith('.md') ? file.slice(0, -3) : file
}

function listPostFiles() {
    return readdirSync(postsDir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => {
            const path = join(postsDir, f)
            return { file: f, slug: slugFromFilename(f), mtime: statSync(path).mtimeMs }
        })
}

/** Resolve CLI arg (slug, dated stem, or .md) to { file, slug }. */
function resolvePost(arg) {
    const files = listPostFiles()
    if (!files.length) {
        throw new Error(`No posts in ${postsDir}`)
    }
    if (!arg) {
        return files.sort((a, b) => b.mtime - a.mtime)[0]
    }
    const stem = arg.replace(/\.md$/, '')
    const byFile = files.find((p) => p.file === `${stem}.md` || p.file === arg)
    if (byFile) return byFile
    const bySlug = files.filter((p) => p.slug === stem)
    if (bySlug.length === 1) return bySlug[0]
    if (bySlug.length > 1) {
        throw new Error(`Ambiguous slug "${stem}": ${bySlug.map((p) => p.file).join(', ')}`)
    }
    throw new Error(`Post not found for "${arg}" in ${postsDir}`)
}

function buildEmail({ title, subtitle, url }) {
    const parts = [`# ${title}`, '']
    if (subtitle) {
        parts.push(subtitle, '')
    }
    parts.push(`New on petro.blog: [${title}](${url})`, '', `[Read the post →](${url})`, '')
    return parts.join('\n')
}

async function sendEmail({ subject, body }) {
    const headers = {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'X-API-Version': '2026-04-01',
        'X-Buttondown-Live-Dangerously': 'true',
    }
    const res = await fetch('https://api.buttondown.com/v1/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            subject,
            body,
            status: 'about_to_send',
        }),
    })
    const text = await res.text()
    let json
    try {
        json = JSON.parse(text)
    } catch {
        json = { raw: text }
    }
    if (!res.ok) {
        const err = new Error(`Buttondown API ${res.status}: ${typeof json === 'object' ? JSON.stringify(json) : text}`)
        err.response = json
        throw err
    }
    return json
}

async function main() {
    if (!apiKey) {
        console.error('BUTTONDOWN_API_KEY is not set. Add it to .env (see .env.example) or export it.')
        process.exit(1)
    }

    let post
    try {
        post = resolvePost(process.argv[2])
    } catch (err) {
        console.error(err.message || err)
        process.exit(1)
    }
    const { file, slug } = post
    const path = join(postsDir, file)
    const raw = readFileSync(path, 'utf8')

    const { data } = parseFrontmatter(raw)
    const title = data.title
    if (!title) {
        console.error('Post frontmatter is missing title')
        process.exit(1)
    }
    const subtitle = data.subtitle || ''
    const url = `${siteUrl}/posts/${slug}/`
    const subject = `New post: ${title}`
    const body = buildEmail({ title, subtitle, url })

    console.log(`Sending: ${subject}`)
    console.log(`URL: ${url}`)

    const result = await sendEmail({ subject, body })
    const id = result.id || result?.results?.id || '(unknown id)'
    console.log(`Sent. Buttondown email id: ${id}`)
}

main().catch((err) => {
    console.error(err.message || err)
    process.exit(1)
})
