/* eslint-disable no-useless-escape */

import classExtract, { t_Actions } from "./value.js";
import { t_Data_FILING } from "../types.js";
import { APP, TWEAKS } from "../Data/cache.js";

export interface t_StyleStack {
	Portable: Record<string, number>,
	Library: Record<string, number>,
	Native: Record<string, number>,
	Local: Record<string, number>,
	Global: Record<string, number>
}

export interface t_FileCursor {
	marker: number,
	rowMarker: number,
	colMarker: number,
	tagCount: number
}

export interface t_BindStack {
	preBinds: Set<string>,
	postBinds: Set<string>,
}
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

export const MainTag = `<${APP.customTag.main} />`;
export const StyleTag = `<${APP.customTag.style} />`;
export const AttachTag = `<${APP.customTag.attach} />`;
export const StencilTag = `<${APP.customTag.stencil} />`;

export const MainCloseTag = `</${APP.customTag.main}>`;
export const StyleCloseTag = `</${APP.customTag.style}>`;
export const AttachCloseTag = `</${APP.customTag.attach}>`;
export const StencilCloseTag = `</${APP.customTag.stencil}>`;

const MainTagRegex = new RegExp(`<\s*${APP.customTag.main}\s*/\s*>`);
const StyleTagRegex = new RegExp(`<\s*${APP.customTag.style}\s*/\s*>`);
const AttachTagRegex = new RegExp(`<\s*${APP.customTag.attach}\s*/\s*>`);
const StencilTagRegex = new RegExp(`<\s*${APP.customTag.stencil}\s*/\s*>`);

const MainTagCheck = (string) => MainTagRegex.test(string);
const StyleTagCheck = (string) => StyleTagRegex.test(string);
const AttachTagCheck = (string) => AttachTagRegex.test(string);
const StencilTagCheck = (string) => StencilTagRegex.test(string);

const zeroXtyleRegex = /^[\w\-]*\$+[\w\-]*$/i;
const openlibXtyleRegex = /^[\w\-]*\$+[\w\-]+$/i;
const onlylibXtyleRegex = /^[\w\-]+\$+[\w\-]+$/i;
const subXtyleRegex = /[\$@#]/;

const valueTrim = (string: string) => {
	return string;
};

export default function scanner(
	fileData: t_Data_FILING,
	classProps: string[] = [],
	action: t_Actions = "read",
	preBinds = new Set<string>(),
	postBinds = new Set<string>(),
	styleStack = {
		Portable: {},
		Library: {},
		Native: {},
		Local: {},
		Global: {}
	},
) {
	const content = fileData.content;
	fileData.styleData.hasMainTag = false;
	fileData.styleData.hasStyleTag = false;
	fileData.styleData.hasAttachTag = false;
	fileData.styleData.hasStencilTag = false;
	let ch = content[0], scribed = "";
	const stylesList = [], classesList: string[][] = [];
	const FileCursor: t_FileCursor = { marker: 0, rowMarker: 0, colMarker: 0, tagCount: 0, };

	while (FileCursor.marker < content.length) {
		if (ch === "\n") {
			FileCursor.rowMarker++;
			FileCursor.colMarker = 0;
		} else { FileCursor.colMarker++; }

		if (content[FileCursor.marker - 1] !== "\\" && ch === "<") {
			const
				startMarker = FileCursor.marker,
				classList: string[] = [],
				braceTrack: t_OpenBrace[] = [],
				tagTrack: [string, number][] = [],
				tagObject = {
					element: "",
					elvalue: "",
					attributes: {},
				},
				styleObject: {
					rowMarker: number,
					columnMarker: number,
					tagCount: number,
					scope: 'essential' | 'local' | 'global' | 'public',
					selector: string,
					comments: string[],
					styles: Record<string, string>
				} = {
					rowMarker: FileCursor.rowMarker,
					columnMarker: FileCursor.colMarker,
					tagCount: FileCursor.tagCount++,
					scope: "essential",
					selector: "",
					comments: [],
					styles: {},
				};

			let attr = "",
				value = "",
				ok = false,
				isVal = false,
				awaitBrace = '',
				deviance = 0,
				ch = content[++FileCursor.marker];

			do {
				ch = content[FileCursor.marker++];
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
				} else if (deviance === 0 && closeBraces.includes(ch)) {
					break;
				}

				if (
					(deviance === 0 && ![" ", "=", "\n", "\r", "\t", ">"].includes(ch)) ||
					deviance !== 0
				) {
					if (isVal) { value += ch; }
					else { attr += ch; }
				} else if (ch === "=") { isVal = true; }

				if (deviance === 0 && [" ", "\n", "\r", ">", "\t"].includes(ch) && (attr !== "")) {
					if (!tagObject.element) {
						tagObject.element = attr.trim();
						tagObject.elvalue = value.trim();
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
						const result = classExtract(value, action, fileData, FileCursor.tagCount);
						classList.push(...result.classList);
						tagObject.attributes[attr] = result.scribed;
					}
					else {
						tagObject.attributes[attr] = value;
					}

					isVal = false;
					attr = "";
					value = "";
				}

				if (deviance === 0 && ch === ">") { ok = true; break; }
				else if (deviance === 0 && ch === ";") { break; }
			} while (ch !== undefined);

			const renderedTag = (action === "split" && styleObject.scope === "local") ? content.slice(startMarker, FileCursor.marker) :
				`<${tagObject.element}${Object.entries(tagObject.attributes).reduce((A, [P, V]) => (A += " " + P + (V === "" ? "" : "=" + V)), "")}>`;

			const replacement = tagObject.element !== APP.styleTag ? renderedTag :
				styleTagCheck(content.slice(startMarker, FileCursor.marker)) ? styleTag : "";
			let scribed = ok ? tagObject.element === APP.customTag && Object.keys(styleObject.styles).length ?
				"" : replacement : content.slice(startMarker, FileCursor.marker);

			Object.entries(styleObject.styles).forEach(([k, v]) => styleObject.styles[k] = v.slice(1, -1));

			if (styleTag === scribed) { fileData.summon = true; }
			if (action === "archive") { scribed = renderedTag; }

			if (ok) {
				if (Object.keys(styleObject.styles).length > 0) { stylesList.push(styleObject); }
				if (classList.length) { classesList.push(classList); }
			}

			scribed += scribed;
		} else {
			scribed += ch;
			FileCursor.marker++;
		}

		ch = fileData.content[FileCursor.marker];
	}

	return { scribed, classesList, stylesList };
}
