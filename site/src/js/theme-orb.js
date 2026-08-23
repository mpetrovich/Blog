/** Canvas sphere with a rotating terminator (phase 0 = thin crescent, 1 = full sun). */

const CRESCENT_SIGN = -1;

/** Canonical defaults (header + design reset). */
export const ORB_DEFAULTS = {
	axisDeg: -150,
	sunRotationDeg: 30,
	moonRotationDeg: 130,
	lightness: 80,
	contrast: 100,
};

/** Live-tunable look (design page sliders write here). */
export const orbParams = { ...ORB_DEFAULTS };

/** Last sampled text ink (from --ink-heading). */
const inkSample = { hue: 340, saturation: 30, lightness: 22 };

const mounted = new Set();

function normalize(x, y, z) {
	const m = Math.hypot(x, y, z) || 1;
	return { x: x / m, y: y / m, z: z / m };
}

function axisFromDeg(deg) {
	const rad = (deg * Math.PI) / 180;
	// 0° = up (0,-1); positive = clockwise (toward right)
	return normalize(Math.sin(rad), -Math.cos(rad), 0);
}

function rotateAroundAxis(v, axis, angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	const { x: ax, y: ay, z: az } = axis;
	const dot = ax * v.x + ay * v.y + az * v.z;
	return {
		x: v.x * c + (ay * v.z - az * v.y) * s + ax * dot * (1 - c),
		y: v.y * c + (az * v.x - ax * v.z) * s + ay * dot * (1 - c),
		z: v.z * c + (ax * v.y - ay * v.x) * s + az * dot * (1 - c),
	};
}

function easeInOutCubic(t) {
	return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function smoothstep(edge0, edge1, x) {
	const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
	return a + (b - a) * t;
}

function parseCssRgb(value) {
	const m = String(value).match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
	if (m) {
		return { r: +m[1], g: +m[2], b: +m[3] };
	}
	const hex = String(value).match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
	if (hex) {
		let h = hex[1];
		if (h.length === 3) h = [...h].map((c) => c + c).join("");
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16),
		};
	}
	return { r: 74, g: 40, b: 56 }; // --ink-heading light fallback
}

function rgbToHsl(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) {
		return { h: 0, s: 0, l: l * 100 };
	}
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	let h;
	switch (max) {
		case r:
			h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
			break;
		case g:
			h = ((b - r) / d + 2) / 6;
			break;
		default:
			h = ((r - g) / d + 4) / 6;
	}
	return { h: h * 360, s: s * 100, l: l * 100 };
}

function sampleInkHsl(el) {
	const raw = getComputedStyle(el).getPropertyValue("--ink-heading").trim()
		|| getComputedStyle(el).color;
	const { r, g, b } = parseCssRgb(raw);
	const hsl = rgbToHsl(r, g, b);
	inkSample.hue = Math.round(hsl.h);
	inkSample.saturation = Math.round(hsl.s);
	inkSample.lightness = Math.round(hsl.l);
	return hsl;
}

function hslToRgb(h, s, l) {
	s = Math.min(100, Math.max(0, s)) / 100;
	l = Math.min(100, Math.max(0, l)) / 100;
	const a = s * Math.min(l, 1 - l);
	const f = (n) => {
		const k = (n + h / 30) % 12;
		return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	};
	return {
		r: Math.round(255 * f(0)),
		g: Math.round(255 * f(8)),
		b: Math.round(255 * f(4)),
	};
}

function lightForPhase(phase, turn = 0) {
	const axis = axisFromDeg(orbParams.axisDeg);
	const Lfull = normalize(0, 0, 1);
	// Interpolate tilt: moon at phase 0, sun at phase 1
	const tiltDeg = mix(orbParams.moonRotationDeg, orbParams.sunRotationDeg, phase);
	const angle = CRESCENT_SIGN * ((tiltDeg * Math.PI) / 180) + turn;
	return rotateAroundAxis(Lfull, axis, angle);
}

function sunShade(nx, ny, nz, L, ink) {
	const { lightness, contrast } = orbParams;
	const c = contrast / 100;

	const lambert = Math.max(0, nx * L.x + ny * L.y + nz * L.z);

	// Highlight tracks the light — rotates with the sphere around the axis
	const hx = L.x;
	const hy = L.y;
	const hz = L.z + 1; // Blinn halfway to camera (0,0,1)
	const hm = Math.hypot(hx, hy, hz) || 1;
	const ndoth = Math.max(0, (nx * hx + ny * hy + nz * hz) / hm);
	// Soft, wide highlight (low power = more spread; contrast sharpens slightly)
	const highlight = ndoth ** (2.2 + 2.8 * c);
	const shade = 1 - 0.28 * c + 0.28 * c * lambert;
	const lift = highlight * (0.45 + 0.4 * c);

	const baseL = lightness * shade;
	const litL = Math.min(100, baseL + lift * (14 + 16 * c));
	const shadeL = Math.max(0, baseL - 6 * c);

	return hslToRgb(ink.h, ink.s, mix(shadeL, litL, Math.min(1, lift * 0.85 + lambert * 0.25 * c)));
}

function drawSphere(ctx, size, phase, turn, ink) {
	const img = ctx.createImageData(size, size);
	const data = img.data;
	const r = size / 2;
	const L = lightForPhase(phase, turn);
	// Wash shade → white near the crescent end; highlight rotates with L the whole time
	const toSun = smoothstep(0, 0.4, phase);
	// Unlit side: plum body (same hue/sat as the lit orb), not the white highlight tip
	const plum = hslToRgb(ink.h, ink.s, Math.min(48, orbParams.lightness * 0.48));
	const shadowR = Math.round(mix(0, plum.r, phase));
	const shadowG = Math.round(mix(0, plum.g, phase));
	const shadowB = Math.round(mix(0, plum.b, phase));

	for (let py = 0; py < size; py++) {
		for (let px = 0; px < size; px++) {
			const nx = (px + 0.5 - r) / r;
			const ny = (py + 0.5 - r) / r;
			const rr = nx * nx + ny * ny;
			if (rr > 1) continue;

			const nz = Math.sqrt(1 - rr);
			const lit = nx * L.x + ny * L.y + nz * L.z;
			const i = (py * size + px) * 4;

			// Geometric terminator only (crescent grows/shrinks by rotation, not fade)
			const litAmt = lit <= 0 ? 0 : Math.min(1, lit * 10);

			const sun = sunShade(nx, ny, nz, L, ink);
			const cr = Math.round(mix(255, sun.r, toSun));
			const cg = Math.round(mix(255, sun.g, toSun));
			const cb = Math.round(mix(255, sun.b, toSun));
			const limb = 0.88 + 0.12 * nz;

			data[i] = Math.round(cr * limb * litAmt + shadowR * (1 - litAmt));
			data[i + 1] = Math.round(cg * limb * litAmt + shadowG * (1 - litAmt));
			data[i + 2] = Math.round(cb * limb * litAmt + shadowB * (1 - litAmt));
			data[i + 3] = 255;
		}
	}

	ctx.clearRect(0, 0, size, size);
	ctx.putImageData(img, 0, 0);
}

/** Apply param patch and redraw every mounted orb. */
export function setOrbParams(partial) {
	Object.assign(orbParams, partial);
	for (const orb of mounted) orb.redraw();
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ phase?: number }} [opts] phase 0 = crescent, 1 = sun
 */
export function mountThemeOrb(canvas, opts = {}) {
	let phase = opts.phase ?? 1;
	let turn = 0;
	let raf = 0;
	let running = false;

	function cssSize() {
		const rect = canvas.getBoundingClientRect();
		return Math.max(1, rect.width || parseFloat(getComputedStyle(canvas).width) || 18);
	}

	function redraw() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const css = cssSize();
		const size = Math.max(8, Math.round(css * dpr));
		if (canvas.width !== size || canvas.height !== size) {
			canvas.width = size;
			canvas.height = size;
		}
		const ink = sampleInkHsl(canvas);
		drawSphere(canvas.getContext("2d"), size, phase, turn, ink);
	}

	function setPhase(next, { animate = false, duration = 780 } = {}) {
		const target = next === "light" || next === 1 ? 1 : 0;
		if (!animate) {
			phase = target;
			turn = 0;
			redraw();
			return Promise.resolve();
		}

		if (running) return Promise.resolve();
		running = true;
		const from = phase;
		const start = performance.now();

		return new Promise((resolve) => {
			const tick = (now) => {
				const u = Math.min(1, (now - start) / duration);
				const e = easeInOutCubic(u);
				// Phase alone interpolates moon↔sun tilt (< 180° with typical settings)
				phase = mix(from, target, e);
				turn = 0;
				redraw();
				if (u < 1) {
					raf = requestAnimationFrame(tick);
				} else {
					phase = target;
					turn = 0;
					redraw();
					running = false;
					resolve();
				}
			};
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(tick);
		});
	}

	const api = {
		setPhase,
		getPhase: () => phase,
		isBusy: () => running,
		redraw,
		destroy() {
			cancelAnimationFrame(raf);
			ro.disconnect();
			mounted.delete(api);
		},
	};

	const ro = new ResizeObserver(() => redraw());
	ro.observe(canvas);
	mounted.add(api);
	redraw();

	return api;
}
