/**
 * Build site-specific IBM Plex WOFF2 subsets from Fontsource sources.
 *
 * Collects glyphs from rendered HTML in dist/ (no padding). Writes fonts +
 * unicode-range sidecars under src/fonts/. Intended as the middle step of:
 *   eleventy && node scripts/subset-fonts.mjs && eleventy
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import subsetFont from 'subset-font'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const siteDir = path.join(__dirname, '..')
const fontsDir = path.join(siteDir, 'src', 'fonts')
const glyphsPath = path.join(fontsDir, 'subset-glyphs.txt')
const unicodeRangePath = path.join(fontsDir, 'subset-unicode-range.txt')

const FACES = [
    {
        pkg: '@fontsource/ibm-plex-serif',
        file: 'ibm-plex-serif-latin-400-normal.woff',
        out: 'ibm-plex-serif-latin-400-normal.woff2',
    },
    {
        pkg: '@fontsource/ibm-plex-serif',
        file: 'ibm-plex-serif-latin-400-italic.woff',
        out: 'ibm-plex-serif-latin-400-italic.woff2',
    },
    {
        pkg: '@fontsource/ibm-plex-serif',
        file: 'ibm-plex-serif-latin-600-normal.woff',
        out: 'ibm-plex-serif-latin-600-normal.woff2',
    },
    {
        pkg: '@fontsource/ibm-plex-mono',
        file: 'ibm-plex-mono-latin-500-normal.woff',
        out: 'ibm-plex-mono-latin-500-normal.woff2',
    },
]

function decodeEntities(t) {
    return t
        .replace(/&nbsp;/g, '\u00A0')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
}

function collectGlyphsFromDist() {
    const distDir = path.join(siteDir, 'dist')
    if (!fs.existsSync(distDir)) {
        throw new Error('dist/ not found — run eleventy before subset-fonts')
    }

    const chars = new Set()
    let htmlFiles = 0

    const walk = (dir) => {
        for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, ent.name)
            if (ent.isDirectory()) {
                walk(p)
                continue
            }
            if (!ent.name.endsWith('.html')) continue
            htmlFiles += 1
            let t = fs.readFileSync(p, 'utf8')
            t = t.replace(/<script[\s\S]*?<\/script>/gi, ' ')
            t = t.replace(/<style[\s\S]*?<\/style>/gi, ' ')
            t = t.replace(/<[^>]+>/g, ' ')
            t = decodeEntities(t)
            for (const c of t) chars.add(c)
        }
    }
    walk(distDir)

    if (htmlFiles === 0) {
        throw new Error('No HTML files in dist/ — run eleventy before subset-fonts')
    }

    const filtered = [...chars].filter((c) => {
        const cp = c.codePointAt(0)
        return cp >= 0x20 && cp < 0xffff
    })
    filtered.sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
    const text = filtered.join('')
    if (!text) {
        throw new Error('No glyphs found in dist HTML')
    }
    fs.mkdirSync(fontsDir, { recursive: true })
    fs.writeFileSync(glyphsPath, text, 'utf8')
    return { text, htmlFiles }
}

function unicodeRange(text) {
    const cps = [...new Set([...text].map((c) => c.codePointAt(0)))].sort((a, b) => a - b)
    const ranges = []
    let start = cps[0]
    let prev = cps[0]
    for (const cp of cps.slice(1)) {
        if (cp === prev + 1) {
            prev = cp
            continue
        }
        ranges.push([start, prev])
        start = prev = cp
    }
    ranges.push([start, prev])
    return ranges
        .map(([a, b]) => {
            const hex = (n) => n.toString(16).toUpperCase().padStart(4, '0')
            return a === b ? `U+${hex(a)}` : `U+${hex(a)}-${hex(b)}`
        })
        .join(', ')
}

function resolveSource(pkg, file) {
    const require = createRequire(path.join(siteDir, 'package.json'))
    const pkgJson = require.resolve(`${pkg}/package.json`)
    return path.join(path.dirname(pkgJson), 'files', file)
}

async function main() {
    const { text, htmlFiles } = collectGlyphsFromDist()
    const range = unicodeRange(text)
    console.log(`Glyphs: ${[...text].length} unique from ${htmlFiles} HTML files`)
    console.log(`unicode-range: ${range}`)

    for (const face of FACES) {
        const input = resolveSource(face.pkg, face.file)
        const output = path.join(fontsDir, face.out)
        const before = fs.existsSync(output) ? fs.statSync(output).size : 0
        const source = fs.readFileSync(input)
        const subset = await subsetFont(source, text, { targetFormat: 'woff2' })
        fs.writeFileSync(output, subset)
        console.log(`${face.out}: ${before} → ${subset.length} bytes`)
    }

    fs.writeFileSync(unicodeRangePath, `${range}\n`, 'utf8')
    console.log(`Wrote ${path.relative(siteDir, unicodeRangePath)}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
