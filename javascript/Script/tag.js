import classExtract from "./value.js";
import { FileCursor } from "./file.js";
import { APP } from "../data-cache.js";

const bracePair = {
	"{": "}",
	"[": "]",
	"(": ")",
	"'": "'",
	"`": "`",
	'"': '"',
};
const openBraces = ["[", "{", "(", "'", '"', "`"];
const closeBraces = ["]", "}", ")"];

export const xtyleTag = `<${APP.xcssTag} />`;
const tagRegex = new RegExp(`<\s*${APP.xcssTag}\s*/\s*>`);
const tagCheck = (string) => tagRegex.test(string);

export default function tagScan(content, action, classProps, fileData) {
	const startMarker = FileCursor.marker++;
	let deviance = 0,
		ch = content[FileCursor.marker],
		classList = [],
		braceTrack = [],
		tagObject = {
			element: "",
			attributes: {},
		},
		styleObject = {
			rowMarker: FileCursor.rowMarker,
			columnMarker: FileCursor.colMarker,
			tagCount: FileCursor.tagCount,
			scope: "essential",
			selector: "",
			comments: [],
			styles: {},
		},
		attr = "",
		value = "",
		ok = false,
		isVal = false,
		awaitBrace;

	while (ch !== undefined) {
		ch = content[FileCursor.marker++];
		if (deviance === 0 && ch === "<") {
			FileCursor.marker--;
			break;
		} else if (ch === "\n") {
			FileCursor.rowMarker++;
			FileCursor.colMarker = 0;
		} else FileCursor.colMarker++;

		if (awaitBrace === ch) {
			braceTrack.pop();
			deviance = braceTrack.length;
			awaitBrace = bracePair[braceTrack[deviance - 1]];
		} else if (
			openBraces.includes(ch) &&
			!["'", '"', "`"].includes(awaitBrace)
		) {
			braceTrack.push(ch);
			deviance = braceTrack.length;
			awaitBrace = bracePair[ch];
		} else if (deviance === 0 && closeBraces.includes(ch)) break;

		if (
			(deviance === 0 && ![" ", "=", "\n", "\r", "\t", ">"].includes(ch)) ||
			deviance !== 0
		) {
			if (isVal) value += ch;
			else attr += ch;
		} else if (ch === "=") isVal = true;

		if (
			deviance === 0 &&
			[" ", "\n", "\r", ">", "\t"].includes(ch) & (attr !== "")
		) {
			if (!tagObject.element) {
				tagObject.element = attr;
				if (value !== "") styleObject.styles[""] = value.slice(1, -1);
			}
			else if (attr === "$") {
				styleObject.comments.push(...value.slice(1, -1).split("\n").map(l => l.trim()))
			}
			else if (/^[\w\-]*\$+[\w\-]+$/i.test(attr)) {
				styleObject.selector = attr;
				if (/\$\$/.test(attr)) styleObject.scope = "global";
				else styleObject.scope = "local";
				if (value !== "") styleObject.styles[""] = value.slice(1, -1);
			}
			else if (/[\$@#]/.test(attr) && !attr.endsWith("$") && !attr.startsWith("@")) {
				styleObject.styles[attr] = value.slice(1, -1);
			}
			else if (classProps.includes(attr)) {
				const result = classExtract(value, action, fileData, FileCursor.tagCount);
				classList.push(...result.classList);
				tagObject.attributes[attr] = result.scribed;
			}
			else tagObject.attributes[attr] = value;

			isVal = false;
			attr = "";
			value = "";
		}
		if (deviance === 0 && ch === ">") {
			ok = true;
			break;
		} else if (deviance === 0 && ch === ";") {
			break;
		} 
	}

	const renderedTag = `<${tagObject.element}${Object.entries(tagObject.attributes)
		.reduce((A, [P, V]) => (A += " " + P + (V === "" ? "" : "=" + V)), "")}>`;
	const replacement = tagObject.element !== APP.styleTag ? renderedTag :
		tagCheck(content.slice(startMarker, FileCursor.marker)) ? xtyleTag : "";
	const scribed = ok ? tagObject.element === APP.xcssTag && Object.keys(styleObject.styles).length ?
		"" : replacement : content.slice(startMarker, FileCursor.marker);

	if (xtyleTag === scribed) fileData.summon = true;

	return {
		ok,
		marker: FileCursor.marker,
		rowMarker: FileCursor.rowMarker,
		columnMarker: FileCursor.colMarker,
		reading: Boolean(ch),
		content: scribed,
		classList,
		styleObject,
	};
}
