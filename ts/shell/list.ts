import * as root from "./root.js";
import * as tag from "./tag.js";

export type _T_list = (items?: string[], intent?: number, preset?: string[], ...styles: string[]) => string[];

export const Bullets: _T_list = (items: string[] = [], intent = 0, preset: string[] = [], ...styles: string[]) => {
	intent = intent < 0 ? 0 : intent;
	return items.map((item) => tag.Tab(intent) + root.fmt(tag.Li(item), ...preset, ...styles));
};

export const Numbers: _T_list = (items: string[] = [], intent = 0, preset: string[] = [], ...styles: string[]) => {
	intent = intent < 0 ? 0 : intent;
	return items.map((item, index) =>
		tag.Tab(intent) + root.fmt(String(index + 1) + tag.Tab() + root.fmt(item), ...preset, ...styles),
	);
};

export const Level: _T_list = (items: string[] = [], intent = 0, preset: string[] = [], ...styles: string[]) => {
	intent = intent < 0 ? 0 : intent;
	const keyLength = items.reduce((max, key) => (key.length > max ? key.length : max), 0);
	return items.map((key) => tag.Tab(intent) + root.fmt(key.padEnd(keyLength) + tag.Tab(), ...preset, ...styles));
};

export const Paragraphs: _T_list = (items: string[] = [], intent = 0, preset: string[] = [], ...styles: string[]) => {
	intent = intent < 0 ? 0 : intent;
	return items.map((item) => tag.Tab(intent) + root.fmt(tag.P(item), ...preset, ...styles));
};

export const Blocks: _T_list = (items: string[] = [], intent = 0, preset: string[] = [], ...styles: string[]) => {
	intent = intent < 0 ? 0 : intent;
	return items.map((item) => "\n".repeat(intent) + root.fmt(item, ...preset, ...styles));
};

export const Waterfall: _T_list = (items: string[] = [], intent = 0, preset: string[] = [], ...styles: string[]) => {
	intent = intent < 0 ? 0 : intent;
	return items.map((item, key) => {
		return tag.Tab(intent) + root.fmt((key === items.length - 1 ? " └─> " : " ├─> ") + tag.Tab() + item, ...preset, ...styles);
	});
};

export const Catalog: _T_list = (items: string[] = [], intent = 0, preset: string[] = [], ...styles: string[]) => {
	intent = intent < 0 ? 0 : intent;
	const prefix = tag.Tab(intent);

	const size = items.reduce((l, i) => { if (i.length > l) { l = i.length; } return l; }, 0);
	const cols = Math.floor((root.canvas.width() - prefix.length + tag.Tab().length) / (size + tag.Tab().length));
	const result: string[] = [];

	let subResult = '';
	items.forEach((item, index) => {
		if ((index + 1) % cols === 0) {
			subResult += root.fmt(item.padEnd(size), ...preset, ...styles);
			result.push(subResult);
			subResult = '';
		} else {
			subResult += root.fmt(item.padEnd(size), ...preset, ...styles) + tag.Tab();
		}
	});

	if (subResult.length) { result.push(subResult); }
	return result.map(i => prefix + i);
};

