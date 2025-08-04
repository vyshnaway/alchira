import canvas from "./0.root.js";
import style from "./1.style.js";
import tag from "./2.tag.js";
import list from "./3.list.js";

const composeBlock = (headingType: (heading: string) => string, heading: string, contents: string[]) => {
	if (contents.length) { contents.push(canvas.unstyle); }
	return [headingType(heading), ...contents].join("\n");
};

type t_blockType = (
	heading: string,
	contents: string[]
) => string;

type t_blockColor = (
	blockType: t_blockType,
	heading: string,
	contents: string[]
) => string;

const blockType: Record<string, t_blockType> = {
	Chapter: (heading, contents) =>
		composeBlock(tag.H1, heading, contents),
	Section: (heading, contents) =>
		composeBlock(tag.H2, heading, contents),
	Footer: (heading, contents) =>
		composeBlock(tag.H3, heading, contents),
	Topic: (heading, contents) =>
		composeBlock(tag.H4, heading, contents),
	Note: (heading, contents) =>
		composeBlock(tag.H5, heading, contents),
	Points: (heading, contents) =>
		composeBlock(tag.H6, heading, contents),
};

const blockColor: Record<string, t_blockColor> = {
	std: (blockType, heading, contents) =>
		style.bold[canvas.settings.primary](
			blockType(heading, contents.map((content) => content))
		),
	title: (blockType, heading, contents) =>
		style.bold[canvas.settings.title](
			blockType(heading, contents.map((content) => style.text[canvas.settings.title](content))),
		),
	text: (blockType, heading, contents) =>
		style.bold[canvas.settings.text](
			blockType(heading, contents.map((content) => style.text[canvas.settings.text](content))),
		),
	primary: (blockType, heading, contents) =>
		style.bold[canvas.settings.primary](
			blockType(heading, contents.map((content) => style.text[canvas.settings.primary](content))),
		),
	secondary: (blockType, heading, contents) =>
		style.bold[canvas.settings.secondary](
			blockType(heading, contents.map((content) => style.text[canvas.settings.secondary](content))),
		),
	tertiary: (blockType, heading, contents) =>
		style.bold[canvas.settings.tertiary](
			blockType(heading, contents.map((content) => style.text[canvas.settings.tertiary](content))),
		),
	success: (blockType, heading, contents) =>
		style.bold[canvas.settings.success](
			blockType(heading, contents.map((content) => style.text[canvas.settings.success](content))),
		),
	failed: (blockType, heading, contents) =>
		style.bold[canvas.settings.failed](
			blockType(heading, contents.map((content) => style.text[canvas.settings.failed](content))),
		),
	warning: (blockType, heading, contents) =>
		style.bold[canvas.settings.warning](
			blockType(heading, contents.map((content) => style.text[canvas.settings.warning](content))),
		),
};

type t_SelectListTypeFn = (content: string[], intent: number) => string[];

const createBlockGroupExport = (
	blockColorKey: keyof typeof blockColor
) => {

	const contentColorMapper = (content: string) => {
		switch (blockColorKey) {
			case "title": return style.text.title(content);
			case "text": return style.text.text(content);
			case "primary": return style.text.primary(content);
			case "secondary": return style.text.secondary(content);
			case "tertiary": return style.text.tertiary(content);
			case "failed": return style.text.failed(content);
			case "success": return style.text.success(content);
			case "warning": return style.text.warning(content);
			default: return canvas.unstyle + content;
		}
	};

	const blockMethod = (
		blockTypeFn: t_blockType,
		heading: string,
		contents: string[] = [],
		selectListType: t_SelectListTypeFn = list.std.Blocks,
		intent = 0
	): string => blockColor[blockColorKey](blockTypeFn, heading, selectListType(contents, intent));

	return {
		Text: (string: string, intent = 0): string => {
			const prefix = canvas.tab.repeat(intent);
			return prefix + contentColorMapper(string);
		},
		Item: (string: string, intent = 0): string => {
			const prefix = canvas.tab.repeat(intent);
			return prefix + tag.Li(contentColorMapper(string));
		},
		Block: (contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0): string =>
			canvas.tab.repeat(intent) + selectListType(contents, intent).join("\n") + "\n",
		Chapter: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Chapter, heading, contents, selectListType, intent),
		Section: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Section, heading, contents, selectListType, intent),
		Footer: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Footer, heading, contents, selectListType, intent),
		Topic: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Topic, heading, contents, selectListType, intent),
		Note: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Note, heading, contents, selectListType, intent),
		List: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Points, heading, contents, selectListType, intent),
	};
};


export default {
	std: createBlockGroupExport('std'),
	title: createBlockGroupExport('title'),
	text: createBlockGroupExport('text'),
	primary: createBlockGroupExport('primary'),
	secondary: createBlockGroupExport('secondary'),
	tertiary: createBlockGroupExport('tertiary'),
	failed: createBlockGroupExport('failed'),
	success: createBlockGroupExport('success'),
	warning: createBlockGroupExport('warning'),
};