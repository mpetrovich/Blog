import { ORB_DEFAULTS, orbParams, setOrbParams } from "./theme-orb.js";

const STORAGE_KEY = "blog-orb-params-v2";

const root = document.querySelector("[data-orb-controls]");
if (root) {
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

	const list = document.createElement("div");
	list.className = "design-orb-controls__list";

	/** @type {{ key: string, input: HTMLInputElement, value: HTMLSpanElement, unit: string }[]} */
	const widgets = [];

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
			const n = Number(input.value);
			value.textContent = `${n}${field.unit}`;
			setOrbParams({ [field.key]: n });
			persist();
		});

		widgets.push({ key: field.key, input, value, unit: field.unit });
		row.append(name, input, value);
		list.append(row);
	}

	const heading = document.createElement("div");
	heading.className = "design-orb-controls__heading";

	const title = document.createElement("h2");
	title.className = "design-orb-controls__title";
	title.textContent = "Orb controls";

	const reset = document.createElement("button");
	reset.type = "button";
	reset.className = "design-orb-controls__reset";
	reset.textContent = "Reset";
	reset.addEventListener("click", () => {
		setOrbParams({ ...ORB_DEFAULTS });
		for (const w of widgets) {
			w.input.value = String(ORB_DEFAULTS[w.key]);
			w.value.textContent = `${ORB_DEFAULTS[w.key]}${w.unit}`;
		}
		persist();
	});

	heading.append(title, reset);
	root.append(heading, list);
}
