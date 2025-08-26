import cursor from "./_cursor.js";
import tagScanner from './tag.js';

import { ROOT } from '../Data/cache.js';
import { t_RescriptAction } from "./value.js";
import { t_FILE_Storage, t_TagRawStyle } from "../types.js";

export const TagSummonStyle = `<${ROOT.customElements["style"]}/>`;
export const TagSummonStaple = `<${ROOT.customElements["staple"]}/>`;
export const TagFn_ReplaceStyle = (sourceString: string, replacement: string) => sourceString.replace(TagSummonStyle, replacement);
export const TagFn_ReplaceStaple = (sourceString: string, replacement: string) => sourceString.replace(TagSummonStaple, replacement);

export const CustomTagElements = Object.values(ROOT.customElements);

export default function scanner(
	fileData: t_FILE_Storage,
	classProps: string[] = [],
	action: t_RescriptAction = "read"
) {
	fileData.styleData.hasMainTag = false;
	fileData.styleData.hasStyleTag = false;
	fileData.styleData.hasStapleTag = false;

	const stylesList = [];
	const content = fileData.content;
	const tagTrack: t_TagRawStyle[] = [];
	const classesList: string[][] = [];
	const attachments = new Set<string>();
	const fileCursor = cursor.Initialize(fileData.content);

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
			const res = tagScanner(fileData, classProps, action, fileCursor);
			const fragment = content.slice(tagStart + 1, res.styleDeclarations.tagOpenMarker);

			if (res.ok) {
				switch (fragment) {
					case TagSummonStyle: fileData.styleData.hasStyleTag = true; break;
					case TagSummonStaple: fileData.styleData.hasStapleTag = true; break;
				}

				subScribed = (
					action === "archive"
						? res.styleDeclarations.scope !== "PUBLIC"
						: (Object.keys(res.nativeAttributes).length === 0 && Object.keys(res.styleDeclarations.styles).length === 0)
				) ? fragment :
					'<' + [
						res.styleDeclarations.element + (res.styleDeclarations.elvalue.length ? `=${res.styleDeclarations.elvalue}` : ''),
						...Object.entries(res.nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
					].join(' ') + '>';

				cursor.Incremnet(fileCursor);

				res.classesList.forEach(classList => {
					if (classList.length) {
						res.classesList.push(classList);
					}
				});
				Object.entries(res.styleDeclarations.styles).forEach(([k, v]) => {
					res.styleDeclarations.styles[k] = v.slice(1, -1);
				});

				if (res.attachments.size) {
					res.attachments.forEach(i => attachments.add(i));
				}
				if (Object.keys(res.styleDeclarations.styles).length > 0) {
					stylesList.push(res.styleDeclarations);
				}

			} else {
				subScribed += fragment;
			}

			if (!res.selfClosed && res.ok) {
				if (res.styleDeclarations.element[0] === '/') {
					const element = res.styleDeclarations.element.slice(1);
					const watchTrack = tagTrack.pop();
					if (watchTrack !== undefined) {
						if (watchTrack.element === element) {
							watchTrack.attachstring = content.slice(watchTrack.tagOpenMarker, tagStart).trim();
						} else {
							tagTrack.push(watchTrack);
						}
					}
				} else if (CustomTagElements.includes(res.styleDeclarations.element)) {
					tagTrack.push(res.styleDeclarations);
				}
			}
			if (tagTrack.length === 0) { scribed += subScribed; }
		} else {
			cursor.Incremnet(fileCursor);
			if (tagTrack.length === 0) { scribed += char; }
		}

	} while (fileCursor.active.marker < content.length);

	return { scribed, classesList, stylesList, attachments };
}
