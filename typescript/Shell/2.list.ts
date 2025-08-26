import * as root from "./0.root.js";
import * as tag from "./1.tag.js";


export function Level(items: string[] = [], intent = 0, ...styles: string[]) {
	intent = intent < 0 ? 0 : intent;
	const keyLength = items.reduce((max, key) => (key.length > max ? key.length : max), 0);
	return items.map((key) => (root.format(tag.Tab(intent) + key.padEnd(keyLength) + tag.Tab(), ...styles)));
}

export function Catalog(items: string[] = [], intent = 0, ...styles: string[]) {
	intent = intent < 0 ? 0 : intent;

	const size =
		items.reduce((length, item) => {
			if (item.length > length) { length = item.length; }
			return length;
		}, 0) +
		intent +
		root.canvas.tab.length;
	const cols = Math.floor(root.canvas.width() / (size + 3));
	const result: string[] = [];
	let subResult = "";
	items.forEach((item, index) => {
		if ((index + 1) % cols) {
			subResult += tag.Li(root.format(item.padEnd(size), ...styles));
		} else {
			subResult += tag.Li(root.format(item.padEnd(size), ...styles));
			result.push(subResult);
			subResult = "";
		}
	});
	if (subResult.length) { result.push(subResult); }
	return result;
}

export function Paragraphs(items: string[] = [], intent = 0, ...styles: string[]) {
	intent = intent < 0 ? 0 : intent;
	return items.map((item) => tag.Tab(intent) + tag.Div(root.format(item, ...styles)));
}

export function Bullets(items: string[] = [], intent = 0, ...styles: string[]) {
	intent = intent < 0 ? 0 : intent;
	return items.map((item) => tag.Tab(intent) + tag.Li(root.format(item, ...styles)));
}

export function Numbers(items: string[] = [], intent = 0, ...styles: string[]) {
	intent = intent < 0 ? 0 : intent;
	return items.map(
		(item, index) =>
			tag.Tab(intent) +
			root.format(String(index + 1), ...styles) +
			tag.Tab(intent) +
			tag.Div(root.format(item)),
	);
}

export function Breaks(items: string[] = [], intent = 0, ...styles: string[]) {
	intent = intent < 0 ? 0 : intent;
	return items.map((item) => root.format("\n".repeat(intent) + tag.P(item), ...styles));
}

export function Waterfall(items: string[] = [], intent = 0, ...styles: string[]) {
	intent = intent < 0 ? 0 : intent;
	return items.map((item, key) => {
		return root.format(root.canvas.tab.repeat(intent) + (key === items.length - 1 ? "└─>" : "├─>") + tag.Tab(intent) + item);
	});
}


[
	Level,
	Breaks
].forEach((Fn: (items: string[], intent: number, ...styles: string[]) => string[]) => {
	console.log(Fn(['asdfafdsfs', "df dfa", "gbhd"], 1, root.style.TC_Normal_Magenta).join("\n"));
});