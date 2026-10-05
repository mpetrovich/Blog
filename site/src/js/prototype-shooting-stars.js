/**
 * PROTOTYPE — throwaway. Three dark-mode shooting-star variants on /design/.
 * Question: which shooting-star feel fits the light→dark theme transition?
 * Switch via ?variant=A|B|C or the floating bar. Delete when a winner is picked.
 */

import { orbParams } from './theme-orb.js'

const VARIANTS = [
    { key: 'A', name: 'Near-moon sparse' },
    { key: 'B', name: 'Meteor shower' },
    { key: 'C', name: 'Single meteor' },
]

/** Match the orb’s visual tilt (~axis / sun rotation); user guessed ~30°. */
function streakAngleDeg() {
    return orbParams.axisDeg ?? 35
}

function currentVariant() {
    const raw = new URLSearchParams(location.search).get('variant')?.toUpperCase()
    return VARIANTS.some((v) => v.key === raw) ? raw : 'A'
}

function setVariant(key) {
    const url = new URL(location.href)
    url.searchParams.set('variant', key)
    history.replaceState(null, '', url)
    label.textContent = formatLabel(key)
    stateEl.textContent = `variant=${key} angle=${streakAngleDeg()}° (light→dark to fire)`
}

function formatLabel(key) {
    const v = VARIANTS.find((x) => x.key === key)
    return v ? `${v.key} — ${v.name}` : key
}

function cycle(delta) {
    const i = VARIANTS.findIndex((v) => v.key === currentVariant())
    const next = VARIANTS[(i + delta + VARIANTS.length) % VARIANTS.length]
    setVariant(next.key)
}

function ensureLayers() {
    let behind = document.querySelector('[data-proto-stars="behind"]')
    let front = document.querySelector('[data-proto-stars="front"]')
    if (!behind) {
        behind = document.createElement('div')
        behind.className = 'proto-stars -behind'
        behind.dataset.protoStars = 'behind'
        behind.setAttribute('aria-hidden', 'true')
        document.body.append(behind)
    }
    if (!front) {
        front = document.createElement('div')
        front.className = 'proto-stars -front'
        front.dataset.protoStars = 'front'
        front.setAttribute('aria-hidden', 'true')
        document.body.append(front)
    }
    return { behind, front }
}

function clearLayers() {
    const { behind, front } = ensureLayers()
    behind.replaceChildren()
    front.replaceChildren()
    behind.className = 'proto-stars -behind'
    front.className = 'proto-stars -front'
}

function rand(min, max) {
    return min + Math.random() * (max - min)
}

/** Prefer the big specimen moon on /design/; fall back to the header toggle. */
function moonAnchor() {
    const xl = document.querySelector('.theme-toggle.-xl')
    const any = document.querySelector('[data-theme-toggle]')
    const el = xl || any
    if (!el) {
        return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.22 }
    }
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/**
 * Spawn just upstream of the moon so the streak passes near it.
 * `along` is distance before the moon (px); `across` is perpendicular offset (px).
 */
function spawnNearMoon(angleDeg, along, across) {
    const { x: mx, y: my } = moonAnchor()
    const rad = (angleDeg * Math.PI) / 180
    const dx = Math.cos(rad)
    const dy = Math.sin(rad)
    const px = -Math.sin(rad)
    const py = Math.cos(rad)
    return {
        x: mx - dx * along + px * across,
        y: my - dy * along + py * across,
    }
}

/**
 * A — 12–16 streaks in a ~50px cluster with random depth + staggered timing.
 * Behind moon: shorter + slower. In front (esp. near): longer + faster.
 */
function playSparse(layers, angle) {
    const { behind, front } = layers
    behind.classList.add('-sparse')
    front.classList.add('-sparse')
    const radius = 50
    const count = 12 + Math.floor(Math.random() * 5) // 12–16

    for (let i = 0; i < count; i++) {
        // z: -1 (far behind) … 0 (moon plane) … +1 (near front)
        const z = rand(-1, 1)
        const behindMoon = z < 0
        const nearness = 1 - Math.abs(z) // 1 = close to moon’s depth
        // Wider cross-axis spread so it reads as a band, not a thin stream
        const across = rand(-radius * 0.95, radius * 0.95)
        const halfChord = Math.sqrt(Math.max(16, radius * radius - across * across))
        const travel = rand(halfChord * 1.1, halfChord * 1.6)

        // Front + near → longest; behind → shortest
        let len
        if (behindMoon) {
            len = rand(44, 68)
        } else {
            len = rand(72, 96) + nearness * rand(16, 32)
        }
        // Center the streak’s mid-flight body on the moon (len extends along travel)
        const along = travel * 0.5 + len * 0.5 + rand(-6, 6)
        // Behind moves slower; front (especially near) snaps past
        let dur
        if (behindMoon) {
            dur = rand(0.62, 0.88) + (1 - nearness) * 0.12
        } else {
            dur = rand(0.32, 0.42) - nearness * 0.06
        }

        // Start immediately on click; stagger the rest over ~0.75s
        const delay = (i / Math.max(1, count - 1)) * rand(0.6, 0.8)

        const { x, y } = spawnNearMoon(angle, along, across)
        const star = document.createElement('span')
        star.className = 'proto-stars__streak'
        if (behindMoon) star.classList.add('-behind')
        else star.classList.add('-front')
        star.style.setProperty('--angle', `${angle + rand(-3, 3)}deg`)
        star.style.setProperty('--x', `${x}px`)
        star.style.setProperty('--y', `${y}px`)
        star.style.setProperty('--len', `${len}px`)
        star.style.setProperty('--travel', `${travel}px`)
        star.style.setProperty('--dur', `${Math.max(0.28, dur)}s`)
        star.style.setProperty('--delay', `${delay}s`)
        // Slightly dimmer when behind
        if (behindMoon) {
            star.style.setProperty('--opacity', String(0.45 + nearness * 0.25))
        }
        ;(behindMoon ? behind : front).append(star)
    }
}

/** B — denser short streaks cascading as the sky darkens. */
function playShower(layers, angle) {
    const { front } = layers
    front.classList.add('-shower')
    const count = 10 + Math.floor(Math.random() * 6)
    for (let i = 0; i < count; i++) {
        const star = document.createElement('span')
        star.className = 'proto-stars__streak'
        star.style.setProperty('--angle', `${angle + rand(-8, 8)}deg`)
        star.style.setProperty('--x', `${rand(0, 85)}%`)
        star.style.setProperty('--y', `${rand(0, 70)}%`)
        star.style.setProperty('--len', `${rand(28, 70)}px`)
        star.style.setProperty('--travel', `${rand(12, 28)}vw`)
        star.style.setProperty('--dur', `${rand(0.35, 0.7)}s`)
        star.style.setProperty('--delay', `${rand(0, 0.55)}s`)
        star.style.setProperty('--opacity', String(rand(0.35, 0.85)))
        front.append(star)
    }
}

/** C — one long cinematic streak with a soft head glow. */
function playSingle(layers, angle) {
    const { front } = layers
    front.classList.add('-single')
    const star = document.createElement('span')
    star.className = 'proto-stars__streak -hero'
    star.style.setProperty('--angle', `${angle}deg`)
    star.style.setProperty('--x', `${rand(5, 25)}%`)
    star.style.setProperty('--y', `${rand(5, 28)}%`)
    star.style.setProperty('--len', `${rand(160, 240)}px`)
    star.style.setProperty('--travel', `${rand(55, 75)}vw`)
    star.style.setProperty('--dur', `${rand(0.75, 0.95)}s`)
    star.style.setProperty('--delay', '0.08s')
    front.append(star)
}

const PLAYERS = {
    A: playSparse,
    B: playShower,
    C: playSingle,
}

function play() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    clearLayers()
    const layers = ensureLayers()
    const key = currentVariant()
    const angle = streakAngleDeg()
    PLAYERS[key](layers, angle)
    const behindN = layers.behind.childElementCount
    const frontN = layers.front.childElementCount
    stateEl.textContent = `variant=${key} angle=${angle}° behind=${behindN} front=${frontN} @ ${new Date().toLocaleTimeString()}`

    const maxMs = key === 'C' ? 1400 : key === 'B' ? 1600 : 2000
    window.clearTimeout(play._clear)
    play._clear = window.setTimeout(() => clearLayers(), maxMs)
}

function injectStyles() {
    if (document.getElementById('proto-shooting-stars-css')) return
    const style = document.createElement('style')
    style.id = 'proto-shooting-stars-css'
    style.textContent = `
/* Moon sits between behind (5) and front (7); promote ancestors into that band */
.site-header,
.design-orb-lab,
.theme-toggle {
    position: relative;
    z-index: 6;
}
.proto-stars {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}
.proto-stars.-behind {
    z-index: 5;
}
.proto-stars.-front {
    z-index: 7;
}
.proto-stars__streak {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: var(--len);
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 35%, #fff 100%);
    transform: rotate(var(--angle)) translateX(0);
    transform-origin: 0 50%;
    opacity: 0;
    animation: proto-star-streak var(--dur) ease-out var(--delay) forwards;
    will-change: transform, opacity;
}
.proto-stars__streak.-behind {
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, calc(var(--opacity, 0.55) * 0.2)) 35%,
        rgba(255, 255, 255, var(--opacity, 0.55)) 100%
    );
}
.proto-stars.-shower .proto-stars__streak {
    height: 1px;
    opacity: 0;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, calc(var(--opacity, 0.6) * 0.2)) 40%,
        rgba(255, 255, 255, var(--opacity, 0.6)) 100%
    );
    filter: blur(0.2px);
}
.proto-stars.-single .proto-stars__streak.-hero {
    height: 1.5px;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.05) 20%,
        rgba(255, 255, 255, 0.55) 70%,
        #fff 100%
    );
    box-shadow:
        0 0 6px 1px rgba(255, 255, 255, 0.35),
        0 0 1px 0 #fff;
}
@keyframes proto-star-streak {
    0% {
        opacity: 0;
        transform: rotate(var(--angle)) translateX(0) scaleX(0.4);
    }
    12% {
        opacity: 1;
    }
    70% {
        opacity: 1;
    }
    100% {
        opacity: 0;
        transform: rotate(var(--angle)) translateX(var(--travel)) scaleX(1);
    }
}
.proto-switcher {
    position: fixed;
    z-index: 50;
    left: 50%;
    bottom: 1.25rem;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    background: #1a1a1a;
    color: #f2f2f2;
    font: 500 12px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
    user-select: none;
}
.proto-switcher button {
    margin: 0;
    padding: 0.2rem 0.45rem;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}
.proto-switcher button:hover {
    background: rgba(255, 255, 255, 0.12);
}
.proto-switcher button:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 2px;
}
.proto-switcher__label {
    min-width: 11rem;
    text-align: center;
}
.proto-switcher__state {
    position: fixed;
    z-index: 50;
    left: 50%;
    bottom: 3.6rem;
    transform: translateX(-50%);
    max-width: min(92vw, 28rem);
    padding: 0.25rem 0.55rem;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.72);
    color: #e8e8e8;
    font: 500 11px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace;
    text-align: center;
    pointer-events: none;
}
.proto-switcher__replay {
    margin-left: 0.15rem;
    padding-inline: 0.55rem !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
}
@media (prefers-reduced-motion: reduce) {
    .proto-stars__streak {
        animation: none !important;
        display: none;
    }
}
`
    document.head.append(style)
}

const switcher = document.createElement('div')
switcher.className = 'proto-switcher'
switcher.setAttribute('role', 'group')
switcher.setAttribute('aria-label', 'Prototype variant switcher')

const prev = document.createElement('button')
prev.type = 'button'
prev.setAttribute('aria-label', 'Previous variant')
prev.textContent = '←'

const label = document.createElement('span')
label.className = 'proto-switcher__label'

const next = document.createElement('button')
next.type = 'button'
next.setAttribute('aria-label', 'Next variant')
next.textContent = '→'

const replay = document.createElement('button')
replay.type = 'button'
replay.className = 'proto-switcher__replay'
replay.textContent = 'Replay'
replay.title = 'Fire stars without toggling theme (forces dark briefly if needed)'

switcher.append(prev, label, next, replay)

const stateEl = document.createElement('div')
stateEl.className = 'proto-switcher__state'

injectStyles()
document.body.append(switcher, stateEl)
setVariant(currentVariant())

prev.addEventListener('click', () => cycle(-1))
next.addEventListener('click', () => cycle(1))
replay.addEventListener('click', () => {
    // Replay against a dark backdrop so the white lines read clearly
    const html = document.documentElement
    const prevTheme = html.getAttribute('data-theme')
    if (prevTheme !== 'dark') html.setAttribute('data-theme', 'dark')
    play()
    if (prevTheme !== 'dark') {
        window.setTimeout(() => {
            if (prevTheme) html.setAttribute('data-theme', prevTheme)
            else html.removeAttribute('data-theme')
        }, 900)
    }
})

document.addEventListener('keydown', (e) => {
    const t = e.target
    if (t instanceof HTMLElement && (t.closest('input, textarea, select, [contenteditable]'))) return
    if (e.key === 'ArrowLeft') {
        e.preventDefault()
        cycle(-1)
    } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        cycle(1)
    }
})

document.documentElement.addEventListener('blog:themechange', (e) => {
    const { theme, from } = e.detail || {}
    if (theme === 'dark' && from !== 'dark') play()
})
