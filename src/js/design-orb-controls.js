import { ORB_DEFAULTS, orbParams, setOrbParams } from "./theme-orb.js";

const STORAGE_KEY = "blog-orb-params-v2";
const OPEN_KEY = "blog-orb-controls-open";

const roots = [...document.querySelectorAll("[data-orb-controls]")];
if (roots.length) {
	try {
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (saved) {
			const parsed = JSON.parse(saved);
			setOrbParams({
				axisDeg: Number(parsed.axisDeg ?? orbParams.axisDeg),
				sunRotationDeg: Number(parsed.sunRotationDeg ?? orbParams.sunRotationDeg),
				moonRotationDeg: Number(parsed.moonRotationDeg ?? orbParams.moonRotationDeg),
				lightness: Number(parsed.lightness ?? orbParams.lightness),
				contrast: Number(parsed.contrast ?? orbParams.contrast),
			});
		}
	} catch {
		/* ignore bad session data */
	}

	function persist() {
		sessionStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				axisDeg: orbParams.axisDeg,
				sunRotationDeg: orbParams.sunRotationDeg,
				moonRotationDeg: orbParams.moonRotationDeg,
				lightness: orbParams.lightness,
				contrast: orbParams.contrast,
			}),
		);
	}

	const fields = [
		{
			key: "axisDeg",
			label: "Axis angle",
			min: -180,
			max: 180,
			step: 1,
			unit: "°",
		},
		{
			key: "sunRotationDeg",
			label: "Sun rotation",
			min: 0,
			max: 180,
			step: 1,
			unit: "°",
		},
		{
			key: "moonRotationDeg",
			label: "Moon rotation",
			min: 0,
			max: 180,
			step: 1,
			unit: "°",
		},
		{
			key: "lightness",
			label: "Lightness",
			min: 40,
			max: 100,
			step: 1,
			unit: "%",
		},
		{
			key: "contrast",
			label: "Contrast",
			min: 0,
			max: 100,
			step: 1,
			unit: "%",
		},
	];

	/** @type {{ key: string, input: HTMLInputElement, value: HTMLSpanElement, unit: string }[]} */
	const widgets = [];
	/** @type {HTMLButtonElement[]} */
	const toggles = [];
	/** @type {HTMLButtonElement[]} */
	const resets = [];
	/** @type {HTMLElement[]} */
	const panels = [];

	let open = false;
	try {
		open = sessionStorage.getItem(OPEN_KEY) === "1";
	} catch {
		/* ignore */
	}

	function setOpen(next) {
		open = next;
		try {
			sessionStorage.setItem(OPEN_KEY, open ? "1" : "0");
		} catch {
			/* ignore */
		}
		for (const panel of panels) {
			panel.hidden = !open;
		}
		for (const reset of resets) {
			reset.hidden = !open;
		}
		for (const toggle of toggles) {
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
			toggle.textContent = open ? "Hide controls" : "Orb controls";
		}
	}

	function syncWidgets() {
		for (const w of widgets) {
			w.input.value = String(orbParams[w.key]);
			w.value.textContent = `${orbParams[w.key]}${w.unit}`;
		}
	}

	function onFieldInput(key, n) {
		setOrbParams({ [key]: n });
		for (const w of widgets) {
			if (w.key !== key) continue;
			w.input.value = String(n);
			w.value.textContent = `${n}${w.unit}`;
		}
		persist();
	}

	function onReset() {
		setOrbParams({ ...ORB_DEFAULTS });
		syncWidgets();
		persist();
	}

	for (const root of roots) {
		const bar = document.createElement("div");
		bar.className = "design-orb-controls__bar";

		const toggle = document.createElement("button");
		toggle.type = "button";
		toggle.className = "design-orb-controls__toggle";
		toggles.push(toggle);

		const reset = document.createElement("button");
		reset.type = "button";
		reset.className = "design-orb-controls__reset";
		reset.textContent = "Reset";
		reset.addEventListener("click", onReset);
		resets.push(reset);

		bar.append(toggle, reset);

		const panel = document.createElement("div");
		panel.className = "design-orb-controls__panel";
		panels.push(panel);

		const list = document.createElement("div");
		list.className = "design-orb-controls__list";

		for (const field of fields) {
			const row = document.createElement("label");
			row.className = "design-orb-controls__row";

			const name = document.createElement("span");
			name.className = "design-orb-controls__label";
			name.textContent = field.label;

			const value = document.createElement("span");
			value.className = "design-orb-controls__value";
			value.textContent = `${orbParams[field.key]}${field.unit}`;

			const input = document.createElement("input");
			input.type = "range";
			input.min = String(field.min);
			input.max = String(field.max);
			input.step = String(field.step);
			input.value = String(orbParams[field.key]);
			input.name = field.key;
			input.addEventListener("input", () => {
				onFieldInput(field.key, Number(input.value));
			});

			widgets.push({ key: field.key, input, value, unit: field.unit });
			row.append(name, input, value);
			list.append(row);
		}

		panel.append(list);
		root.append(bar, panel);

		toggle.addEventListener("click", () => setOpen(!open));
	}

	setOpen(open);
}
