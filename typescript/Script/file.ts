import tagScanner, {
	TagSummonStyle,
	TagSummonAttach,
	TagSummonStencil,
	rgx_elementFirstChar,
	CustomTagElements,
	FileCursorInitialize,
	FileCursorIncremnet
} from './tag.js';

import { t_Actions, t_StyleStack } from "./value.js";
import { t_Data_FILING, t_TagRawStyle } from "../types.js";




export default function scanner(
	fileData: t_Data_FILING,
	classProps: string[] = [],
	action: t_Actions = "read",
	attachments = new Set<string>(),
	styleStack: t_StyleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} },
	OrderedClassList: Record<string, Record<number, string>> = {}
) {
	fileData.styleData.hasMainTag = false;
	fileData.styleData.hasStyleTag = false;
	fileData.styleData.hasAttachTag = false;
	fileData.styleData.hasStencilTag = false;

	const stylesList = [];
	const content = fileData.content;
	const tagTrack: t_TagRawStyle[] = [];
	const classesList: string[][] = [];
	const fileCursor = FileCursorInitialize(fileData.content);

	let scribed = "", interim = "";

	do {
		const char = fileCursor.active.char;

		if (
			(content[fileCursor.active.marker - 1] !== "\\")
			&& (char === "<") &&
			(rgx_elementFirstChar.test(content[fileCursor.active.marker + 1]))
		) {

			const { ok, selfClosed, styleDeclarations, nativeAttributes, classList }
				= tagScanner(fileData, classProps, action, attachments, styleStack, OrderedClassList, fileCursor);

			let subScribed = '';
			if (ok) {

				const strippedTag = (() => {
					if ((action === "archive" && styleDeclarations.scope === "local") ||
						(Object.keys(nativeAttributes).length === 0 && Object.keys(styleDeclarations.styles).length === 0)) {
						const sliced = content.slice(styleDeclarations.contentStart, fileCursor.active.marker);
						switch (sliced) {
							case TagSummonStyle:
								fileData.styleData.hasStyleTag = true;
								break;
							case TagSummonAttach:
								fileData.styleData.hasAttachTag = true;
								break;
							case TagSummonStencil:
								fileData.styleData.hasStencilTag = true;
								break;
						}
						return sliced;
					} else {
						return '<' + [
							styleDeclarations.element + (styleDeclarations.elvalue.length ? `=${styleDeclarations.elvalue}` : ''),
							...Object.entries(nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
						].join(' ') + '>';
					}
				})();

				subScribed = action === "archive" ? strippedTag : (() => {
					let replacement = '';
					if (CustomTagElements.includes(styleDeclarations.element)) {
						replacement = 'styleTagCheck(content.slice(tagStartMarker, FileCursor.marker)) ? styleTag : ""';
					} else {
						replacement = strippedTag;
					}
					return ok ? styleDeclarations.element === 'APP.customTag' && Object.keys(styleDeclarations.styles).length ?
						"" : replacement : content.slice(styleDeclarations.contentStart, fileCursor.active.marker);
				})();

				FileCursorIncremnet(fileCursor);
				if (classList.length) { classesList.push(classList); }
				if (Object.keys(styleDeclarations.styles).length > 0) { stylesList.push(styleDeclarations); }
				Object.entries(styleDeclarations.styles).forEach(([k, v]) => styleDeclarations.styles[k] = v.slice(1, -1));
			} else {
				subScribed += fileData.content.slice(styleDeclarations.contentStart, fileCursor.active.marker);
			}

			if (tagTrack.length === 0) { scribed += subScribed; }

			if (!selfClosed && ok) {
				if (styleDeclarations.element[0] === '/' && tagTrack.length) {
					const element = styleDeclarations.element.slice(1);
					const watchTrack = tagTrack.pop();
					if (watchTrack !== undefined) {
						if (watchTrack.element === element) {
							watchTrack.snippet_Style = interim.slice(watchTrack.intrimEnding);
							watchTrack.snippet_Attach = interim.slice(watchTrack.intrimEnding);
							watchTrack.snippet_Stencil = interim.slice(watchTrack.intrimEnding);
						} else {
							tagTrack.push(watchTrack);
						}
					}
				} else {
					tagTrack.push(styleDeclarations);
				}
			}

			interim += subScribed;
		} else {
			if (tagTrack.length === 0) { scribed += char; }
			FileCursorIncremnet(fileCursor);
		}

	} while (fileCursor.active.marker < content.length);

	console.log(`'${scribed}'`);
	return { scribed, classesList, stylesList };
}
