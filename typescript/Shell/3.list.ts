import canvas from "./0.root.js";
import style from "./1.style.js";
import tag from "./2.tag.js";

type t_color_fn = (item: string) => string;

const colors: Record<string, t_color_fn> = {
	std: (item) => canvas.unstyle + item,
	title: (item) => style.text[canvas.settings.title](item),
	text: (item) => style.text[canvas.settings.text](item),
	primary: (item) => style.text[canvas.settings.primary](item),
	secondary: (item) => style.text[canvas.settings.secondary](item),
	tertiary: (item) => style.text[canvas.settings.tertiary](item),
	warning: (item) => style.text[canvas.settings.warning](item),
	failed: (item) => style.text[canvas.settings.failed](item),
	success: (item) => style.text[canvas.settings.success](item),
};

const createListFormatters = (colorTheme: t_color_fn) => ({
	Level: (items: string[], intent = 0) => {
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
		const cols = Math.floor(canvas.settings.width / (size + 3));
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
				style.bold[canvas.settings.secondary](String(index + 1)) +
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
				style.bold[canvas.settings.secondary](
					key === items.length - 1 ? "└─>" : "├─>",
				) +
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

