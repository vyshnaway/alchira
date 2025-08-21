/* eslint-disable no-useless-escape */
import classExtract, { t_FileScanBuffer } from "./value.js";

import { APP, TWEAKS } from "../Data/cache.js";
import { t_Data_FILING, t_TagRawStyle } from "../types.js";
import { t_Actions, t_StyleStack } from "./value.js";

const bracePair = {
	"{": "}",
	"[": "]",
	"(": ")",
	"'": "'",
	"`": "`",
	'"': '"',
};
type t_OpenBrace = keyof typeof bracePair;
export const openBraces = Object.keys(bracePair);
export const closeBraces = ["]", "}", ")"];

export const TagSummonStyle = `<${APP.customTag.style}/>`;
export const TagSummonAttach = `<${APP.customTag.attach}/>`;
export const TagSummonStencil = `<${APP.customTag.stencil}/>`;

export const TagClosedStyle = `</${APP.customTag.style}>`;
export const TagClosedAttach = `</${APP.customTag.attach}>`;
export const TagClosedStencil = `</${APP.customTag.stencil}>`;

export const TagRegex_SelfStyle = new RegExp(`(?<!\\\\)<\s*${APP.customTag.style}\s*/\s*>`);
export const TagRegex_SelfAttach = new RegExp(`(?<!\\\\)<\s*${APP.customTag.attach}\s*/\s*>`);
export const TagRegex_SelfStencil = new RegExp(`(?<!\\\\)<\s*${APP.customTag.stencil}\s*/\s*>`);

export const TagFn_ElementCheckStyle = (element: string) => (APP.customTag.style === element);
export const TagFn_ElementCheckAttach = (element: string) => (APP.customTag.attach === element);
export const TagFn_ElementCheckStencil = (element: string) => (APP.customTag.stencil === element);

export const TagFn_SelfCheckStyle = (string: string) => TagRegex_SelfStyle.test(string);
export const TagFn_SelfCheckAttach = (string: string) => TagRegex_SelfAttach.test(string);
export const TagFn_SelfCheckStencil = (string: string) => TagRegex_SelfStencil.test(string);

export const TagFn_ReplaceStyle = (sourceString: string, replacement: string) => sourceString.replace(TagRegex_SelfStyle, replacement);
export const TagFn_ReplaceAttach = (sourceString: string, replacement: string) => sourceString.replace(TagRegex_SelfAttach, replacement);
export const TagFn_ReplaceStencil = (sourceString: string, replacement: string) => sourceString.replace(TagRegex_SelfStencil, replacement);

export const CustomTagElements = Object.values(APP.customTag);

export const rgx_subXtyleRegex = /[\$@#]/;
export const rgx_zeroXtyleRegex = /^[\w\-]*\$+[\w\-]*$/i;
export const rgx_openlibXtyleRegex = /^[\w\-]*\$+[\w\-]+$/i;
export const rgx_onlylibXtyleRegex = /^[\w\-]+\$+[\w\-]+$/i;
export const rgx_elementFirstChar = /^[\d\w\-]*$/i;

export function FileCursorIncremnet(fileScanner: t_FileScanBuffer) {
	fileScanner.active.char = fileScanner.content[++fileScanner.active.marker];
	if (fileScanner.active.char === "\n") {
		fileScanner.active.rowMarker++;
		fileScanner.active.colFallback = fileScanner.active.colMarker;
		fileScanner.active.colMarker = 0;
	} else {
		fileScanner.active.colMarker++;
	}
	return fileScanner.active.char;
}

export function FileCursorDecrement(fileScanner: t_FileScanBuffer) {
	fileScanner.active.char = fileScanner.content[--fileScanner.active.marker];
	if (fileScanner.active.char === "\n") {
		fileScanner.active.rowMarker--;
		fileScanner.active.colMarker = fileScanner.active.colFallback;
	} else {
		fileScanner.active.colMarker--;
	}
	return fileScanner.active.char;
}

export function FileCursorInitialize(content: string): t_FileScanBuffer {
	const fileScanner: t_FileScanBuffer = {
		content,
		active: {
			char: '',
			marker: 0,
			rowMarker: 0,
			colMarker: 0,
			tagCount: 0,
			colFallback: 0,
		},
		fallback: {
			char: '',
			marker: 0,
			rowMarker: 0,
			colMarker: 0,
			tagCount: 0,
			colFallback: 0,
		},
		reference: {
			char: '',
			marker: 0,
			rowMarker: 0,
			colMarker: 0,
			tagCount: 0,
			colFallback: 0,
		},
	};

	fileScanner.active.char = content[fileScanner.active.marker];
	if (fileScanner.active.char === "\n") {
		fileScanner.active.rowMarker++;
		fileScanner.active.colMarker = 0;
	} else {
		fileScanner.active.colMarker++;
	}
	return fileScanner;
}

export default function scanner(
	fileData: t_Data_FILING,
	classProps: string[] = [],
	action: t_Actions = "read",
	attachments = new Set<string>(),
	styleStack: t_StyleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} },
	OrderedClassList: Record<string, Record<number, string>>,
	fileCursor = FileCursorInitialize(fileData.content),
) {
	const
		classList: string[] = [],
		braceTrack: t_OpenBrace[] = [],
		nativeAttributes: Record<string, string> = {},
		styleDeclarations: t_TagRawStyle = {
			element: "",
			elvalue: "",
			selector: "",
			scope: "essential",
			tagCount: fileCursor.active.tagCount,
			rowIndex: fileCursor.active.rowMarker,
			colIndex: fileCursor.active.colMarker,
			contentStart: fileCursor.active.marker,
			intrimEnding: 0,
			comments: [],
			styles: {},
			snippet_Style: "",
			snippet_Attach: "",
			snippet_Stencil: "",
		};

	let
		deviance = 0,
		attr = "",
		value = "",
		awaitBrace = "",
		ok = false,
		isVal = false,
		selfClosed = false,
		fallbackAquired = false;


	while (fileCursor.active.marker < fileData.content.length) {
		const lastCh = fileCursor.active.char;
		const liveCh = FileCursorIncremnet(fileCursor);
		if (lastCh !== "\\") {
			if (!fallbackAquired && liveCh === "<") {
				fallbackAquired = true;
				Object.assign(fileCursor.fallback, fileCursor.active);
			}

			if (awaitBrace === liveCh) {
				braceTrack.pop();
				deviance = braceTrack.length;
				awaitBrace = bracePair[braceTrack[deviance - 1]];
			} else if (openBraces.includes(liveCh) && !["'", '"', "`"].includes(awaitBrace)) {
				braceTrack.push(liveCh as t_OpenBrace);
				deviance = braceTrack.length;
				awaitBrace = bracePair[liveCh as t_OpenBrace];
			} else if (deviance === 0 && closeBraces.includes(liveCh)) { break; }

			if (deviance === 0 && [" ", "\n", "\r", " > ", "\t"].includes(liveCh) && (attr !== "")) {
				const tr_Attr = attr.trim();
				const tr_Value = value.trim();

				if (!styleDeclarations.element.length) {
					styleDeclarations.element = tr_Attr;
					styleDeclarations.elvalue = tr_Value;
				} else if (tr_Attr === "$") {
					styleDeclarations.comments.push(...tr_Value.slice(1, -1).split("\n").map(l => l.trim()));
				} else if ((TWEAKS.openXtyles && rgx_openlibXtyleRegex.test(tr_Attr)) || (!TWEAKS.openXtyles && rgx_onlylibXtyleRegex.test(tr_Attr))) {
					styleDeclarations.selector = tr_Attr;
					styleDeclarations.scope = tr_Attr.includes("$$$") ? "public"
						: tr_Attr.includes("$$") ? "global" : "local";

					if (tr_Value) { styleDeclarations.styles[""] = tr_Value; }
				} else if (!rgx_zeroXtyleRegex.test(tr_Attr) && rgx_subXtyleRegex.test(tr_Attr) && !tr_Attr.endsWith("$") && !tr_Attr.startsWith("@")) {
					styleDeclarations.styles[tr_Attr] = tr_Value;
				} else if (classProps.includes(tr_Attr)) {
					const result = classExtract(tr_Value, action, fileData, attachments, styleStack, fileCursor.active, OrderedClassList);
					classList.push(...result.classList);
					nativeAttributes[tr_Attr] = result.scribed;
				} else {
					nativeAttributes[tr_Attr] = tr_Value;
				}

				isVal = false;
				attr = "";
				value = "";

			}

			if (deviance === 0 && (liveCh === ">" || liveCh === ";" || liveCh === ',' || liveCh === "<")) {
				ok = liveCh === ">";
				selfClosed = fileData.content[fileCursor.active.marker - 1] === '/';
				break;
			}
		}

		if ((deviance === 0 && ![" ", "=", "\n", "\r", "\t", ">"].includes(liveCh)) || deviance !== 0) {
			if (isVal) { value += liveCh; }
			else { attr += liveCh; }
		} else if (deviance === 0 && liveCh === "=") { isVal = true; }
	};

	if (ok) {
		fileCursor.active.tagCount++;
		styleDeclarations.intrimEnding = fileCursor.active.marker;
	} else if (fallbackAquired) {
		Object.assign(fileCursor.active, fileCursor.fallback);
	}

	return { ok, selfClosed, styleDeclarations, nativeAttributes, classList, fileCursor };
}
