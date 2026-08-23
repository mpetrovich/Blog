import { mountThemeOrb } from "./theme-orb.js";

const THEME_KEY = "blog-theme";

const buttons = [...document.querySelectorAll("[data-theme-toggle]")];
if (buttons.length) {
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
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
		const stored = storedTheme();
		if (stored) return stored;
		return darkQuery.matches ? "dark" : "light";
	}

	function nextTheme(current) {
		return current === "light" ? "dark" : "light";
	}

	function paneTheme(button) {
		if (button.dataset.mode === "light" || button.dataset.mode === "dark") {
			return button.dataset.mode;
		}
		return button.closest(".theme-dark") ? "dark" : "light";
	}

	function switchLabel(theme) {
		return theme === "light" ? "Switch to dark mode" : "Switch to light mode";
	}

	function syncLabel(button, theme) {
		const label = switchLabel(theme);
		button.setAttribute("aria-label", label);
		button.title = label;
	}

	function syncChrome(theme) {
		for (const button of buttons) {
			if (button.classList.contains("theme-toggle--pane")) continue;
			button.dataset.mode = theme;
			syncLabel(button, theme);
			// Don't snap an orb that's mid-spin (theme applies during rotation)
			if (button._orb?.isBusy()) continue;
			button._orb?.setPhase(theme === "light" ? 1 : 0);
		}
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		try {
			sessionStorage.setItem(THEME_KEY, theme);
		} catch {
			/* private mode / blocked */
		}
		syncChrome(theme);
	}

	for (const button of buttons) {
		const canvas = button.querySelector("canvas");
		if (!canvas) continue;

		const isPane = button.classList.contains("theme-toggle--pane");
		const initial = isPane ? paneTheme(button) : effectiveTheme();
		button.dataset.mode = initial;
		syncLabel(button, initial);
		button._orb = mountThemeOrb(canvas, {
			phase: initial === "light" ? 1 : 0,
		});

		button.addEventListener("click", async () => {
			if (busy || button._orb.isBusy()) return;

			const current = isPane ? paneTheme(button) : effectiveTheme();
			const next = nextTheme(current);

			if (reduceMotion.matches) {
				if (isPane) {
					button.dataset.mode = next;
					syncLabel(button, next);
					button._orb.setPhase(next === "light" ? 1 : 0);
				} else {
					applyTheme(next);
				}
				return;
			}

			busy = true;
			// Start the spin first so isBusy() skips snapping this orb in syncChrome
			const spinning = button._orb.setPhase(next === "light" ? 1 : 0, {
				animate: true,
			});
			if (isPane) {
				button.dataset.mode = next;
				syncLabel(button, next);
			} else {
				// Page colors transition while the orb rotates (not after)
				applyTheme(next);
			}
			await spinning;
			busy = false;
		});
	}

	if (!buttons.every((b) => b.classList.contains("theme-toggle--pane"))) {
		const theme = effectiveTheme();
		if (document.documentElement.getAttribute("data-theme") !== theme) {
			document.documentElement.setAttribute("data-theme", theme);
		}
		syncChrome(theme);
	}
}
