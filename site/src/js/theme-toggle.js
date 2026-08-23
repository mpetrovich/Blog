import { mountThemeOrb } from "./theme-orb.js";

const THEME_KEY = "blog-theme";

const buttons = [...document.querySelectorAll("[data-theme-toggle]")];
if (buttons.length) {
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const persistTheme =
		document.body?.getAttribute("data-theme-persist") !== "false";
	let busy = false;

	function storedTheme() {
		try {
			const t = sessionStorage.getItem(THEME_KEY);
			if (t === "light" || t === "dark") return t;
		} catch {
			/* private mode / blocked */
		}
		return null;
	}

	function effectiveTheme() {
		const forced = document.documentElement.getAttribute("data-theme");
		if (forced === "light" || forced === "dark") return forced;
		if (persistTheme) {
			const stored = storedTheme();
			if (stored) return stored;
		}
		return darkQuery.matches ? "dark" : "light";
	}

	function nextTheme(current) {
		return current === "light" ? "dark" : "light";
	}

	function switchLabel(theme) {
		return theme === "light" ? "Switch to dark mode" : "Switch to light mode";
	}

	function syncLabel(button, theme) {
		const label = switchLabel(theme);
		button.setAttribute("aria-label", label);
		button.title = label;
	}

	function syncChrome(theme, { animate = false } = {}) {
		const phase = theme === "light" ? 1 : 0;
		/** @type {Promise<void>[]} */
		const spins = [];
		for (const button of buttons) {
			button.dataset.mode = theme;
			syncLabel(button, theme);
			const orb = button._orb;
			if (!orb || orb.isBusy()) continue;
			if (animate) {
				spins.push(orb.setPhase(phase, { animate: true }));
			} else {
				orb.setPhase(phase);
			}
		}
		return Promise.all(spins);
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		if (persistTheme) {
			try {
				sessionStorage.setItem(THEME_KEY, theme);
			} catch {
				/* private mode / blocked */
			}
		}
	}

	function anyOrbBusy() {
		return buttons.some((button) => button._orb?.isBusy());
	}

	for (const button of buttons) {
		const canvas = button.querySelector("canvas");
		if (!canvas) continue;

		const initial = effectiveTheme();
		button.dataset.mode = initial;
		syncLabel(button, initial);
		button._orb = mountThemeOrb(canvas, {
			phase: initial === "light" ? 1 : 0,
		});

		button.addEventListener("click", async () => {
			if (busy || anyOrbBusy()) return;

			const next = nextTheme(effectiveTheme());

			if (reduceMotion.matches) {
				applyTheme(next);
				await syncChrome(next);
				return;
			}

			busy = true;
			// Spin every orb together; page colors change during the rotation
			const spinning = syncChrome(next, { animate: true });
			applyTheme(next);
			await spinning;
			busy = false;
		});
	}

	const theme = effectiveTheme();
	if (document.documentElement.getAttribute("data-theme") !== theme) {
		document.documentElement.setAttribute("data-theme", theme);
	}
	syncChrome(theme);
}
