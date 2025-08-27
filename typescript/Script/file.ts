import CURSOR from "./_cursor.js";
import TAGSCAN from './tag.js';

import * as CACHE from '../data/cache.js';
import * as TYPE from "../types.js";

const TagSummonStyle = `<${CACHE._ROOT.customElements["style"]}/>`;
const TagSummonStaple = `<${CACHE._ROOT.customElements["staple"]}/>`;
const CustomTagElements = Object.values(CACHE._ROOT.customElements);

export default function scanner(
	fileData: TYPE.FILE_Storage,
	classProps: string[] = [],
	action: TYPE.ScriptParseActions = "read"
) {
	fileData.styleData.styleTagReplaces.length = 0;
	fileData.styleData.stapleTagReplaces.length = 0;

	const stylesList = [];
	const content = fileData.content;
	const tagTrack: TYPE.TagRawStyle[] = [];
	const classesList: string[][] = [];
	const attachments = new Set<string>();
	const fileCursor = CURSOR.Initialize(fileData.content);

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
			const res = TAGSCAN(fileData, classProps, action, fileCursor);
			const fragment = content.slice(tagStart, res.styleDeclarations.tagOpenMarker);

			if (res.ok) {
				switch (fragment) {
					case TagSummonStyle:
						fileData.styleData.styleTagReplaces.push([tagStart, fileCursor.active.marker]);
						break;
					case TagSummonStaple:
						fileData.styleData.stapleTagReplaces.push([tagStart, fileCursor.active.marker]);
						break;
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

				CURSOR.Incremnet(fileCursor);

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
			CURSOR.Incremnet(fileCursor);
			if (tagTrack.length === 0) { scribed += char; }
		}

	} while (fileCursor.active.marker < content.length);

	return { scribed, classesList, stylesList, attachments };
}
