import { mountThemeOrb } from "./theme-orb.js";

const buttons = [...document.querySelectorAll("[data-theme-toggle]")];
if (buttons.length) {
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
	let busy = false;

	function effectiveTheme() {
		const forced = document.documentElement.getAttribute("data-theme");
		if (forced === "light" || forced === "dark") return forced;
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

	function syncChrome(theme) {
		for (const button of buttons) {
			if (button.classList.contains("theme-toggle--pane")) continue;
			button.dataset.mode = theme;
			button.setAttribute(
				"aria-label",
				theme === "light" ? "Switch to dark mode" : "Switch to light mode",
			);
			button._orb?.setPhase(theme === "light" ? 1 : 0);
		}
	}

	function applyTheme(theme) {
		document.documentElement.setAttribute("data-theme", theme);
		syncChrome(theme);
	}

	for (const button of buttons) {
		const canvas = button.querySelector("canvas");
		if (!canvas) continue;

		const isPane = button.classList.contains("theme-toggle--pane");
		const initial = isPane ? paneTheme(button) : effectiveTheme();
		button.dataset.mode = initial;
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
					button._orb.setPhase(next === "light" ? 1 : 0);
				} else {
					applyTheme(next);
				}
				return;
			}

			busy = true;
			await button._orb.setPhase(next === "light" ? 1 : 0, { animate: true });
			if (isPane) {
				button.dataset.mode = next;
			} else {
				document.documentElement.setAttribute("data-theme", next);
				syncChrome(next);
			}
			busy = false;
		});
	}

	if (!buttons.every((b) => b.classList.contains("theme-toggle--pane"))) {
		syncChrome(effectiveTheme());
	}
}
