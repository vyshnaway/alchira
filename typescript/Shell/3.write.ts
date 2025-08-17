import { canvas, style, format } from "./0.root.js";
import tag from "./1.tag.js";
import list from "./2.list.js";

const composeBlock = (headingType: (heading: string) => string, heading: string, contents: string[]) => {
	if (contents.length) { contents.push(format()); }
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

export const blockType: Record<string, t_blockType> = {
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

export const blockColor: Record<string, t_blockColor> = {
	std: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => content)),
			style.TS_Bold,
			...canvas.config.primary
		),
	title: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.title))),
			style.TS_Bold,
			...canvas.config.title
		),
	text: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.text))),
			style.TS_Bold,
			...canvas.config.text
		),
	primary: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.primary))),
			style.TS_Bold,
			...canvas.config.primary
		),
	secondary: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.secondary))),
			style.TS_Bold,
			...canvas.config.secondary
		),
	tertiary: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.tertiary))),
			style.TS_Bold,
			...canvas.config.tertiary
		),
	success: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.success))),
			style.TS_Bold,
			...canvas.config.success
		),
	failed: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.failed))),
			style.TS_Bold,
			...canvas.config.failed
		),
	warning: (blockType, heading, contents) =>
		format(
			blockType(heading, contents.map((content) => format(content, ...canvas.config.warning))),
			style.TS_Bold,
			...canvas.config.warning
		),
};

type t_SelectListTypeFn = (content: string[], intent: number) => string[];

function contentColorMapper(content: string, blockColorKey: keyof typeof blockColor) {
	switch (blockColorKey) {
		case "title": return format(content, ...canvas.config.title);
		case "text": return format(content, ...canvas.config.text);
		case "primary": return format(content, ...canvas.config.primary);
		case "secondary": return format(content, ...canvas.config.secondary);
		case "tertiary": return format(content, ...canvas.config.tertiary);
		case "failed": return format(content, ...canvas.config.failed);
		case "success": return format(content, ...canvas.config.success);
		case "warning": return format(content, ...canvas.config.warning);
		default: return format(content);
	}
};

const blockMethod = (
	blockTypeFn: t_blockType,
	heading: string,
	contents: string[] = [],
	selectListType: t_SelectListTypeFn = list.std.Blocks,
	intent = 0,
	blockColorKey: keyof typeof blockColor
): string => blockColor[blockColorKey](blockTypeFn, heading, selectListType(contents, intent));

const createBlockGroupExport = (
	blockColorKey: keyof typeof blockColor
) => {
	return {
		Text: (string: string, intent = 0): string => 
			canvas.tab.repeat(intent)+ contentColorMapper(string, blockColorKey),
		Item: (string: string, intent = 0): string => 
			canvas.tab.repeat(intent)+ tag.Li(contentColorMapper(string, blockColorKey)),
		Block: (contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0): string =>
			canvas.tab.repeat(intent) + selectListType(contents, intent).join("\n") + "\n",
		Chapter: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Chapter, heading, contents, selectListType, intent, blockColorKey),
		Section: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Section, heading, contents, selectListType, intent, blockColorKey),
		Footer: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Footer, heading, contents, selectListType, intent, blockColorKey),
		Topic: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Topic, heading, contents, selectListType, intent, blockColorKey),
		Note: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Note, heading, contents, selectListType, intent, blockColorKey),
		List: (heading: string, contents: string[] = [], selectListType: t_SelectListTypeFn = list.std.Blocks, intent = 0) =>
			blockMethod(blockType.Points, heading, contents, selectListType, intent, blockColorKey),
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