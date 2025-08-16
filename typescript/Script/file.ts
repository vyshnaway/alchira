/* eslint-disable no-useless-escape */
import classExtract from "./value.js";

import { APP, TWEAKS } from "../Data/cache.js";
import { t_Data_FILING, t_TagRawStyle } from "../types.js";
import { t_Actions, t_BindStack, t_FileCursor, t_StyleStack } from "./value.js";

const bracePair = {
	"{": "}",
	"[": "]",
	"(": ")",
	"'": "'",
	"`": "`",
	'"': '"',
};
type t_OpenBrace = keyof typeof bracePair;
const openBraces = Object.keys(bracePair);
const closeBraces = ["]", "}", ")"];

const CustomTagElements = Object.values(APP.customTag);

const TagSummonMain = `<${APP.customTag.main}/>`;
const TagSummonStyle = `<${APP.customTag.style}/>`;
const TagSummonAttach = `<${APP.customTag.attach}/>`;
const TagSummonStencil = `<${APP.customTag.stencil}/>`;

const TagClosedMain = `</${APP.customTag.main}>`;
const TagClosedStyle = `</${APP.customTag.style}>`;
const TagClosedAttach = `</${APP.customTag.attach}>`;
const TagClosedStencil = `</${APP.customTag.stencil}>`;

const TagRegex_SelfMain = new RegExp(`(?<!\\\\)<\s*${APP.customTag.main}\s*/\s*>`);
const TagRegex_SelfStyle = new RegExp(`(?<!\\\\)<\s*${APP.customTag.style}\s*/\s*>`);
const TagRegex_SelfAttach = new RegExp(`(?<!\\\\)<\s*${APP.customTag.attach}\s*/\s*>`);
const TagRegex_SelfStencil = new RegExp(`(?<!\\\\)<\s*${APP.customTag.stencil}\s*/\s*>`);

export const TagFn_ElementCheckMain = (element: string) => (APP.customTag.main === element);
export const TagFn_ElementCheckStyle = (element: string) => (APP.customTag.style === element);
export const TagFn_ElementCheckAttach = (element: string) => (APP.customTag.attach === element);
export const TagFn_ElementCheckStencil = (element: string) => (APP.customTag.stencil === element);

export const TagFn_SelfCheckMain = (string: string) => TagRegex_SelfMain.test(string);
export const TagFn_SelfCheckStyle = (string: string) => TagRegex_SelfStyle.test(string);
export const TagFn_SelfCheckAttach = (string: string) => TagRegex_SelfAttach.test(string);
export const TagFn_SelfCheckStencil = (string: string) => TagRegex_SelfStencil.test(string);

export const TagFn_ReplaceMain = (sourceString: string, replacement: string) => sourceString.replace(TagRegex_SelfMain, replacement);
export const TagFn_ReplaceStyle = (sourceString: string, replacement: string) => sourceString.replace(TagRegex_SelfStyle, replacement);
export const TagFn_ReplaceAttach = (sourceString: string, replacement: string) => sourceString.replace(TagRegex_SelfAttach, replacement);
export const TagFn_ReplaceStencil = (sourceString: string, replacement: string) => sourceString.replace(TagRegex_SelfStencil, replacement);


const zeroXtyleRegex = /^[\w\-]*\$+[\w\-]*$/i;
const openlibXtyleRegex = /^[\w\-]*\$+[\w\-]+$/i;
const onlylibXtyleRegex = /^[\w\-]+\$+[\w\-]+$/i;
const subXtyleRegex = /[\$@#]/;

export default function scanner(
	fileData: t_Data_FILING,
	classProps: string[] = [],
	action: t_Actions = "read",
	BindStack: t_BindStack = { preBinds: new Set(), postBinds: new Set() },
	styleStack: t_StyleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} },
	OrderedClassList: Record<string, Record<number, string>> = {}
) {
	const content = fileData.content;
	fileData.styleData.hasMainTag = false;
	fileData.styleData.hasStyleTag = false;
	fileData.styleData.hasAttachTag = false;
	fileData.styleData.hasStencilTag = false;
	let ch = content[0], scribed = "";
	const stylesList = [];
	const classesList: string[][] = [];
	const FileCursor: t_FileCursor = { marker: 0, rowMarker: 0, colMarker: 0, tagCount: 0, };
	const tagTrack: t_TagRawStyle[] = [];

	while (FileCursor.marker < content.length) {
		if (ch === "\n") {
			FileCursor.rowMarker++;
			FileCursor.colMarker = 0;
		} else { FileCursor.colMarker++; }

		if (content[FileCursor.marker - 1] !== "\\" && ch === "<") {
			const
				tagStartMarker = FileCursor.marker,
				classList: string[] = [],
				braceTrack: t_OpenBrace[] = [],
				normalAttributes: Record<string, string> = {},
				styleObject: t_TagRawStyle = {
					element: "",
					elvalue: "",
					tagCount: FileCursor.tagCount++,
					rowMarker: FileCursor.rowMarker,
					columnMarker: FileCursor.colMarker,
					selector: "",
					scope: "essential",
					comments: [],
					styles: {},
					snippet_Main: "",
					snippet_Style: "",
					snippet_Attach: "",
					snippet_Stencil: "",
				};

			let attr = "",
				value = "",
				ok = false,
				isVal = false,
				awaitBrace = '',
				deviance = 0,
				ch = '',
				fallbackAquired = false;

			const FallbackCursor = { marker: 0, rowMarker: 0, colMarker: 0, tagCount: 0, };

			do {
				ch = content[FileCursor.marker];

				if (!fallbackAquired && ch === "<") {
					fallbackAquired = true;
					Object.assign(FallbackCursor, FileCursor);
				}

				FileCursor.marker++;
				if (deviance === 0 && ch === "<") { FileCursor.marker--; break; }
				else if (ch === "\n") { FileCursor.rowMarker++; FileCursor.colMarker = 0; }
				else { FileCursor.colMarker++; }

				if (awaitBrace === ch) {
					braceTrack.pop();
					deviance = braceTrack.length;
					awaitBrace = bracePair[braceTrack[deviance - 1]];
				} else if (openBraces.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
					braceTrack.push(ch as t_OpenBrace);
					deviance = braceTrack.length;
					awaitBrace = bracePair[ch as t_OpenBrace];
				} else if (deviance === 0 && closeBraces.includes(ch)) { break; }

				if ((deviance === 0 && ![" ", "=", "\n", "\r", "\t", ">"].includes(ch)) || deviance !== 0) {
					if (isVal) { value += ch; }
					else { attr += ch; }
				} else if (ch === "=") { isVal = true; }

				if (deviance === 0 && [" ", "\n", "\r", ">", "\t"].includes(ch) && (attr !== "")) {
					if (!styleObject.element.length) {
						styleObject.element = attr.trim();
						styleObject.elvalue = value.trim();
					}
					else if (attr === "$") {
						styleObject.comments.push(...value.slice(1, -1).split("\n").map(l => l.trim()));
					}
					else if ((TWEAKS.openXtyles && openlibXtyleRegex.test(attr)) || (!TWEAKS.openXtyles && onlylibXtyleRegex.test(attr))) {
						styleObject.selector = attr;

						if (attr.includes("$$$")) { styleObject.scope = "public"; }
						else if (attr.includes("$$")) { styleObject.scope = "global"; }
						else { styleObject.scope = "local"; }

						if (value !== "") { styleObject.styles[""] = value; }
					}
					else if (!zeroXtyleRegex.test(attr) && subXtyleRegex.test(attr) && !attr.endsWith("$") && !attr.startsWith("@")) {
						styleObject.styles[attr] = value;
					}
					else if (classProps.includes(attr)) {
						const result = classExtract(value, action, fileData, BindStack, styleStack, FileCursor, OrderedClassList);
						classList.push(...result.classList);
						normalAttributes[attr] = result.scribed;
					}
					else {
						normalAttributes[attr] = value;
					}

					isVal = false;
					attr = "";
					value = "";
				}

				if (deviance === 0 && ch === ">") { ok = true; break; }
				else if (deviance === 0 && ch === ";") { break; }
			} while (ch !== undefined);

			let subScribed = '';
			if (ok) {
				const strippedTag = (() => {
					if ((action === "archive" && styleObject.scope === "local") ||
						(Object.keys(normalAttributes).length === 0 && Object.keys(styleObject.styles).length === 0)) {
						const sliced = content.slice(tagStartMarker, FileCursor.marker);
						switch (sliced) {
							case TagSummonMain:
								fileData.styleData.hasMainTag = true;
								break;
							case TagSummonStyle:
								fileData.styleData.hasStyleTag = true;
								break;
							case TagSummonAttach:
								fileData.styleData.hasAttachTag = true;
								break;
							case TagSummonStencil:
								fileData.styleData.hasStencilTag = true;
								break;
							case TagClosedMain:
								// TagFn_ElementCheckMain(styleObject.element);
								break;
							case TagClosedStyle:
								// TagFn_ElementCheckStyle(styleObject.element);
								break;
							case TagClosedAttach:
								// TagFn_ElementCheckAttach(styleObject.element);
								break;
							case TagClosedStencil:
								// TagFn_ElementCheckStencil(styleObject.element);
								break;
						}
						return sliced;
					} else {
						return '<' + [
							styleObject.element + (styleObject.elvalue.length ? `=${styleObject.elvalue}` : ''),
							...Object.entries(normalAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
						].join(' ') + '>';
					}
				})();

				subScribed = (() => {
					let replacement = '';
					if (CustomTagElements.includes(styleObject.element)) {
						replacement = 'styleTagCheck(content.slice(tagStartMarker, FileCursor.marker)) ? styleTag : ""';
					} else {
						replacement = strippedTag;
					}
					return ok ? styleObject.element === 'APP.customTag' && Object.keys(styleObject.styles).length ?
						"" : replacement : content.slice(tagStartMarker, FileCursor.marker);
				})();

				Object.entries(styleObject.styles).forEach(([k, v]) => styleObject.styles[k] = v.slice(1, -1));

				if (action === "archive") { subScribed = strippedTag; }

				if (classList.length) { classesList.push(classList); }
				if (Object.keys(styleObject.styles).length > 0) { stylesList.push(styleObject); }

			} else if (fallbackAquired) {
				subScribed += fileData.content.slice(tagStartMarker, FallbackCursor.marker);
				// Object.assign(FileCursor, FallbackCursor);
			}

			if (tagTrack.length === 0) { scribed += subScribed; }
		} else {
			if (tagTrack.length === 0) { scribed += ch; }
			FileCursor.marker++;
		}

		ch = fileData.content[++FileCursor.marker];
	}

	return { scribed, classesList, stylesList };
}
