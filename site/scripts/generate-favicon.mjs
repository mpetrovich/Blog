/**
 * Renders the theme sun orb (phase = 1) to favicon PNG assets.
 * Shading matches theme-orb.js ORB_DEFAULTS + light --ink-heading.
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { ORB_DEFAULTS as ORB } from '../src/js/theme-orb.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '../src')

/** Light-theme --ink-heading #4a2838 */
const INK = { h: 340, s: 30 }

const CRESCENT_SIGN = -1

function normalize(x, y, z) {
    const m = Math.hypot(x, y, z) || 1
    return { x: x / m, y: y / m, z: z / m }
}

function axisFromDeg(deg) {
    const rad = (deg * Math.PI) / 180
    return normalize(Math.sin(rad), -Math.cos(rad), 0)
}

function rotateAroundAxis(v, axis, angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const { x: ax, y: ay, z: az } = axis
    const dot = ax * v.x + ay * v.y + az * v.z
    return {
        x: v.x * c + (ay * v.z - az * v.y) * s + ax * dot * (1 - c),
        y: v.y * c + (az * v.x - ax * v.z) * s + ay * dot * (1 - c),
        z: v.z * c + (ax * v.y - ay * v.x) * s + az * dot * (1 - c),
    }
}

function mix(a, b, t) {
    return a + (b - a) * t
}

function hslToRgb(h, s, l) {
    s = Math.min(100, Math.max(0, s)) / 100
    l = Math.min(100, Math.max(0, l)) / 100
    const a = s * Math.min(l, 1 - l)
    const f = (n) => {
        const k = (n + h / 30) % 12
        return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    }
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4)),
    }
}

function lightForSun() {
    const axis = axisFromDeg(ORB.axisDeg)
    const Lfull = normalize(0, 0, 1)
    const angle = CRESCENT_SIGN * ((ORB.sunRotationDeg * Math.PI) / 180)
    return rotateAroundAxis(Lfull, axis, angle)
}

function sunShade(nx, ny, nz, L) {
    const { lightness, contrast } = ORB
    const c = contrast / 100
    const lambert = Math.max(0, nx * L.x + ny * L.y + nz * L.z)
    const hx = L.x
    const hy = L.y
    const hz = L.z + 1
    const hm = Math.hypot(hx, hy, hz) || 1
    const ndoth = Math.max(0, (nx * hx + ny * hy + nz * hz) / hm)
    const highlight = ndoth ** (1.6 + 1.4 * c)
    const shade = 1 - 0.28 * c + 0.28 * c * lambert
    const lift = highlight * (0.12 + 0.1 * c)
    const baseL = lightness * shade
    const litL = Math.min(100, baseL + lift * (5 + 6 * c))
    const shadeL = Math.max(0, baseL - 6 * c)
    return hslToRgb(INK.h, INK.s, mix(shadeL, litL, Math.min(1, lift * 0.35 + lambert * 0.4 * c)))
}

/** Soft edge AA (~1 CSS px at the source size) */
function coverage(radius, size) {
    const soft = 2 / size
    if (radius <= 1 - soft) return 1
    if (radius >= 1 + soft) return 0
    const t = (1 + soft - radius) / (2 * soft)
    return t * t * (3 - 2 * t)
}

function renderRgba(size, { background = null } = {}) {
    const data = new Uint8Array(size * size * 4)
    const r = size / 2
    const L = lightForSun()
    const plum = hslToRgb(INK.h, INK.s, Math.min(48, ORB.lightness * 0.48))

    if (background) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = background.r
            data[i + 1] = background.g
            data[i + 2] = background.b
            data[i + 3] = 255
        }
    }

    for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
            const nx = (px + 0.5 - r) / r
            const ny = (py + 0.5 - r) / r
            const rr = nx * nx + ny * ny
            const cov = coverage(Math.sqrt(rr), size)
            if (cov <= 0) continue

            const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, rr)))
            const lit = nx * L.x + ny * L.y + nz * L.z
            const litAmt = lit <= 0 ? 0 : Math.min(1, lit * 10)
            const sun = sunShade(nx, ny, nz, L)
            const limb = 0.88 + 0.12 * nz
            const i = (py * size + px) * 4
            const sr = Math.round(sun.r * limb * litAmt + plum.r * (1 - litAmt))
            const sg = Math.round(sun.g * limb * litAmt + plum.g * (1 - litAmt))
            const sb = Math.round(sun.b * limb * litAmt + plum.b * (1 - litAmt))
            if (background && cov < 1) {
                data[i] = Math.round(mix(background.r, sr, cov))
                data[i + 1] = Math.round(mix(background.g, sg, cov))
                data[i + 2] = Math.round(mix(background.b, sb, cov))
                data[i + 3] = 255
            } else {
                data[i] = sr
                data[i + 1] = sg
                data[i + 2] = sb
                data[i + 3] = Math.round(255 * cov)
            }
        }
    }
    return data
}

function crc32(buf) {
    let c = ~0
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i]
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
        }
    }
    return ~c >>> 0
}

function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii')
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const crcBuf = Buffer.alloc(4)
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
    return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(rgba, size) {
    const pixels = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength)
    const scanlines = Buffer.alloc((size * 4 + 1) * size)
    for (let y = 0; y < size; y++) {
        const dest = y * (size * 4 + 1)
        scanlines[dest] = 0 // filter: none
        pixels.copy(scanlines, dest + 1, y * size * 4, (y + 1) * size * 4)
    }

    const ihdr = Buffer.alloc(13)
    ihdr.writeUInt32BE(size, 0)
    ihdr.writeUInt32BE(size, 4)
    ihdr[8] = 8 // bit depth
    ihdr[9] = 6 // RGBA
    ihdr[10] = 0
    ihdr[11] = 0
    ihdr[12] = 0

    const compressed = zlib.deflateSync(scanlines, { level: 9 })
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', ihdr),
        chunk('IDAT', compressed),
        chunk('IEND', Buffer.alloc(0)),
    ])
}

function writePng(filename, size, opts) {
    const rgba = renderRgba(size, opts)
    const png = encodePng(rgba, size)
    const dest = path.join(outDir, filename)
    fs.writeFileSync(dest, png)
    console.log(`Wrote ${dest} (${size}×${size})`)
}

/** Site paper --paper: #faf6f3 */
const PAPER = { r: 0xfa, g: 0xf6, b: 0xf3 }

writePng('favicon.png', 32)
writePng('favicon-192.png', 192)
writePng('favicon-512.png', 512)
writePng('apple-touch-icon.png', 180, { background: PAPER })
