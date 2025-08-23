import Use from "../Utils/main.js";
import tagScanner from './tag.js';

import { ORIGIN } from '../Data/cache.js';
import { t_Actions, t_StyleStack } from "./value.js";
import { t_Data_FILING, t_OrderedClassList, t_TagRawStyle } from "../types.js";

export const TagSummonStyle = `<${ORIGIN.customTag.style}/>`;
export const TagSummonAttach = `<${ORIGIN.customTag.attach}/>`;
export const TagSummonStencil = `<${ORIGIN.customTag.stencil}/>`;
export const CustomTagElements = Object.values(ORIGIN.customTag);
export const TagFn_ReplaceStyle = (sourceString: string, replacement: string) => sourceString.replace(TagSummonStyle, replacement);
export const TagFn_ReplaceAttach = (sourceString: string, replacement: string) => sourceString.replace(TagSummonAttach, replacement);
export const TagFn_ReplaceStencil = (sourceString: string, replacement: string) => sourceString.replace(TagSummonStencil, replacement);


export default function scanner(
	fileData: t_Data_FILING,
	classProps: string[] = [],
	action: t_Actions = "read",
	attachments = new Set<string>(),
	styleStack: t_StyleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} },
	OrderedClassList: t_OrderedClassList = {}
) {
	fileData.styleData.hasMainTag = false;
	fileData.styleData.hasStyleTag = false;
	fileData.styleData.hasAttachTag = false;
	fileData.styleData.hasStencilTag = false;

	const stylesList = [];
	const content = fileData.content;
	const tagTrack: t_TagRawStyle[] = [];
	const classesList: string[][] = [];
	const fileCursor = Use.cursor.Initialize(fileData.content);

	let scribed = "";

	do {
		const char = fileCursor.active.char;

		if (
			(content[fileCursor.active.marker - 1] !== "\\")
			&& (char === "<")
			&& (/^[/\d\w-]*$/i.test(content[fileCursor.active.marker + 1]))
		) {
			let subScribed = '';
			const tagStart = fileCursor.active.marker;
			const { ok, selfClosed, styleDeclarations, nativeAttributes, classList } = tagScanner(fileData, classProps, action, attachments, styleStack, OrderedClassList, fileCursor);
			const fragment = content.slice(tagStart + 1, styleDeclarations.tagOpenMarker);

			if (ok) {
				switch (fragment) {
					case TagSummonStyle: fileData.styleData.hasStyleTag = true; break;
					case TagSummonAttach: fileData.styleData.hasAttachTag = true; break;
					case TagSummonStencil: fileData.styleData.hasStencilTag = true; break;
				}
				subScribed = (
					action === "archive"
						? styleDeclarations.scope === "local"
						: (Object.keys(nativeAttributes).length === 0 && Object.keys(styleDeclarations.styles).length === 0)
				) ? fragment
					: '<' + [
						styleDeclarations.element + (styleDeclarations.elvalue.length ? `=${styleDeclarations.elvalue}` : ''),
						...Object.entries(nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
					].join(' ') + '>';

				Use.cursor.Incremnet(fileCursor);
				if (classList.length) { classesList.push(classList); }
				if (Object.keys(styleDeclarations.styles).length > 0) { stylesList.push(styleDeclarations); }
				Object.entries(styleDeclarations.styles).forEach(([k, v]) => styleDeclarations.styles[k] = v.slice(1, -1));
			} else {
				subScribed += fragment;
			}

			if (!selfClosed && ok) {
				if (styleDeclarations.element[0] === '/') {
					const element = styleDeclarations.element.slice(1);
					const watchTrack = tagTrack.pop();
					if (watchTrack !== undefined) {
						if (watchTrack.element === element) {
							const snippet = content.slice(watchTrack.tagOpenMarker, tagStart).trim();
							switch (element) {
								case ORIGIN.customTag["style"]: watchTrack.snippet_Style = snippet; break;
								case ORIGIN.customTag["attach"]: watchTrack.snippet_Attach = snippet; break;
								case ORIGIN.customTag["stencil"]: watchTrack.snippet_Stencil = snippet; break;
							}
						} else {
							tagTrack.push(watchTrack);
						}
					}
				} else if (CustomTagElements.includes(styleDeclarations.element)) {
					tagTrack.push(styleDeclarations);
				}
			}
			if (tagTrack.length === 0) { scribed += subScribed; }
		} else {
			Use.cursor.Incremnet(fileCursor);
			if (tagTrack.length === 0) { scribed += char; }
		}

	} while (fileCursor.active.marker < content.length);

	return { scribed, classesList, stylesList };
}
