import { canvas, style, format } from "./0.root.js";
import tag from "./1.tag.js";

type t_color_fn = (item: string) => string;

const colors: Record<string, t_color_fn> = {
	std: (item) => format(item),
	title: (item) => format(item, ...canvas.config.title),
	text: (item) => format(item, ...canvas.config.text),
	primary: (item) => format(item, ...canvas.config.primary),
	secondary: (item) => format(item, ...canvas.config.secondary),
	tertiary: (item) => format(item, ...canvas.config.tertiary),
	warning: (item) => format(item, ...canvas.config.warning),
	failed: (item) => format(item, ...canvas.config.failed),
	success: (item) => format(item, ...canvas.config.success),
};

const createListFormatters = (colorTheme: t_color_fn) => ({
	Level: (items: string[] = [], intent = 0) => {
		const keyLength = items.reduce((max, key) => (key.length > max ? key.length : max), 0);
		return items.map((key) => (canvas.tab.repeat(intent) + colorTheme(key.padEnd(keyLength) + canvas.tab)));
	},
	Blocks: (items: string[] = [], intent = 0) => {

		const size =
			items.reduce((length, item) => {
				if (item.length > length) { length = item.length; }
				return length;
			}, 0) +
			intent +
			canvas.tab.length;
		const cols = Math.floor(canvas.width() / (size + 3));
		const result: string[] = [];
		let subResult = "";
		items.forEach((item, index) => {
			if ((index + 1) % cols) {
				subResult += tag.Li(colorTheme(item.padEnd(size)));
			} else {
				subResult += tag.Li(colorTheme(item.padEnd(size)));
				result.push(subResult);
				subResult = "";
			}
		});
		if (subResult.length) { result.push(subResult); }
		return result;
	},
	Entries: (items: string[] = [], intent = 0) => {
		return items.map((item) => canvas.tab.repeat(intent) + tag.Div(colorTheme(item)));
	},
	Bullets: (items: string[] = [], intent = 0) => {
		return items.map((item) => canvas.tab.repeat(intent) + tag.Li(colorTheme(item)));
	},
	Numbers: (items: string[] = [], intent = 0) => {
		return items.map(
			(item, index) =>
				canvas.tab.repeat(intent) +
				format(String(index + 1), ...canvas.config.secondary, ...style.TS_Bold) +
				canvas.tab.repeat(intent) +
				tag.Div(colorTheme(item)),
		);
	},
	Intents: (items: string[] = [], intent = 0) => {
		return items.map((item) => "\n".repeat(intent - 1) + tag.P(colorTheme(item)));
	},
	Waterfall: (items: string[] = [], intent = 0) => {
		return items.map((item, key) => {
			return (
				canvas.tab.repeat(intent) +
				format(key === items.length - 1 ? "└─>" : "├─>", style.TS_Bold, ...canvas.config.secondary) +
				colorTheme(canvas.tab.repeat(intent) + item)
			);
		});
	}
});

export default {
	std: createListFormatters(colors.std),
	title: createListFormatters(colors.title),
	text: createListFormatters(colors.text),
	primary: createListFormatters(colors.primary),
	secondary: createListFormatters(colors.secondary),
	tertiary: createListFormatters(colors.tertiary),
	failed: createListFormatters(colors.failed),
	success: createListFormatters(colors.success),
	warning: createListFormatters(colors.warning),
};

