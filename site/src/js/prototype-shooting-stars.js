/**
 * Shooting stars on light→dark theme toggle — thin streaks clustered around the moon.
 */

import { orbParams } from './theme-orb.js'

/** Match the orb’s visual tilt (~axis angle). */
function streakAngleDeg() {
    return orbParams.axisDeg ?? 35
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
 * 12–16 streaks in a ~50px cluster with random depth + staggered timing.
 * Behind moon: shorter + slower. In front (esp. near): longer + faster.
 */
function play() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    clearLayers()
    const { behind, front } = ensureLayers()
    behind.classList.add('-sparse')
    front.classList.add('-sparse')

    const angle = streakAngleDeg()
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

    window.clearTimeout(play._clear)
    play._clear = window.setTimeout(() => clearLayers(), 2000)
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
@media (prefers-reduced-motion: reduce) {
    .proto-stars__streak {
        animation: none !important;
        display: none;
    }
}
`
    document.head.append(style)
}

injectStyles()

document.documentElement.addEventListener('blog:themechange', (e) => {
    const { theme, from } = e.detail || {}
    if (theme === 'dark' && from !== 'dark') play()
})
