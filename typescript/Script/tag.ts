/* eslint-disable no-useless-escape */
import cursor from "./cursor.js";
import classExtract from "./value.js";

import { t_FILE_Storage, t_TagRawStyle } from "../types.js";
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


export default function scanner(
	fileData: t_FILE_Storage,
	classProps: string[] = [],
	action: t_Actions = "read",
	attachments = new Set<string>(),
	styleStack: t_StyleStack = { Portable: {}, Library: {}, Native: {}, Local: {}, Global: {} },
	OrderedClassList: Record<string, Record<number, string>>,
	fileCursor = cursor.Initialize(fileData.content),
) {
	const
		classList: string[] = [],
		braceTrack: t_OpenBrace[] = [],
		nativeAttributes: Record<string, string> = {},
		styleDeclarations: t_TagRawStyle = {
			element: "",
			elvalue: "",
			selector: "",
			scope: "PACKAGE",
			tagCount: fileCursor.active.tagCount,
			rowIndex: fileCursor.active.rowMarker,
			colIndex: fileCursor.active.colMarker,
			tagOpenMarker: 0,
			comments: [],
			styles: {},
			attachstring: "",
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
		const liveCh = cursor.Incremnet(fileCursor);
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

			if (deviance === 0 && [" ", "\n", "\r", ">", "\t"].includes(liveCh) && (attr !== "")) {
				const tr_Attr = attr.trim();
				const tr_Value = value.trim();
				if (!styleDeclarations.element.length) {
					styleDeclarations.element = tr_Attr;
					styleDeclarations.elvalue = tr_Value;
				} else if (tr_Attr === "$") {
					styleDeclarations.comments.push(...tr_Value.slice(1, -1).split("\n").map(l => l.trim()));
				} else if (/^[\w\-]+\$+[\w\-]+$/i.test(tr_Attr)) {
					styleDeclarations.selector = tr_Attr;
					if (fileData.manifest.refer.group === "PACKAGE") {
						styleDeclarations.scope = "PACKAGE";
					} else if (tr_Attr.includes("$$$")) {
						styleDeclarations.scope = "PUBLIC";
					} else if (tr_Attr.includes("$$")) {
						styleDeclarations.scope = "GLOBAL";
					} else {
						styleDeclarations.scope = "LOCAL";
					}
					if (tr_Value) { styleDeclarations.styles[""] = tr_Value; }
				} else if (/[\$@#]/.test(tr_Attr) && !"$@".includes(tr_Attr[0]) && !"$@".includes(tr_Attr[tr_Attr.length - 1])) {
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
		selfClosed = fileData.content[fileCursor.active.marker - 1] === '/';
		styleDeclarations.tagOpenMarker = fileCursor.active.marker + 1;
	} else if (fallbackAquired) {
		Object.assign(fileCursor.active, fileCursor.fallback);
	}

	return { ok, selfClosed, styleDeclarations, nativeAttributes, classList, fileCursor };
}
