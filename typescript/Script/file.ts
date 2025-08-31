// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import CURSOR from "./_cursor.js";
import TAGSCAN from './tag.js';

import * as CACHE from '../data/cache.js';

const CustomTagElements = Object.keys(CACHE.ROOT.customElements);
const selfClosingTags = Object.entries(CACHE.ROOT.customElements).reduce((A, [K, V]) => {
	A[`<${K} />`] = V;
	return A;
}, {} as Record<string, number>);


export default function scanner(
	fileData: _File.Storage,
	classProps: string[] = [],
	action: _Script._Actions = _Script._Actions.read
) {
	fileData.styleData.tagReplacements = [];

	const stylesList = [];
	const content = fileData.content;
	const tagTrack: _Script.RawStyle[] = [];
	const classesList: string[][] = [];
	const attachments: string[] = [];
	const fileCursor = CURSOR.Initialize(fileData.content);

	let stream = "";

	do {
		const char = fileCursor.active.char;

		if (
			(content[fileCursor.active.marker - 1] !== "\\")
			&& (char === "<")
			&& (/^[/\d\w-]*$/i.test(content[fileCursor.active.marker + 1]))
		) {
			let subScribed = '';
			const tagStart = fileCursor.active.marker;
			const result = TAGSCAN(fileData, classProps, action, fileCursor);
			const fragment = content.slice(tagStart, result.styleDeclarations.tagOpenMarker);

			if (result.ok) {
				classesList.push(...result.classesList);
				attachments.push(...result.attachments);
				if (Object.keys(result.styleDeclarations.styles).length > 0) { stylesList.push(result.styleDeclarations); }
				if (selfClosingTags[fragment]) { fileData.styleData.tagReplacements.push([selfClosingTags[fragment], stream.length]); }

				const styleDeclarations = Object.entries(result.styleDeclarations.styles);
				styleDeclarations.forEach(([k, v]) => { result.styleDeclarations.styles[k] = v.slice(1, -1); });


				if (_Script._Actions.read === action) {
					subScribed = (result.styleDeclarations.selector.length)
						? '<' + [
							result.styleDeclarations.element + (result.styleDeclarations.elvalue.length ? `=${result.styleDeclarations.elvalue}` : ''),
							...Object.entries(result.nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
						].join(' ') + '>'
						: fragment;
				} else if (!selfClosingTags[fragment]) {
					subScribed = result.classSynced ? '<' + [
						result.styleDeclarations.element + (result.styleDeclarations.elvalue.length ? `=${result.styleDeclarations.elvalue}` : ''),
						...Object.entries(result.nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
					].join(' ') + '>' : fragment;
				}


				CURSOR.Incremnet(fileCursor);
			} else {
				subScribed += fragment;
			}

			let exitedNow = false;
			if (!result.selfClosed && result.ok) {
				if (result.styleDeclarations.element[0] === '/') {
					const element = result.styleDeclarations.element.slice(1);
					const watchTrack = tagTrack.pop();
					if (watchTrack !== undefined) {
						if (watchTrack.element === element) {
							watchTrack.attachstring = content.slice(watchTrack.tagOpenMarker, tagStart);
							exitedNow = true;
						} else {
							tagTrack.push(watchTrack);
						}
					}
				} else if (CustomTagElements.includes(result.styleDeclarations.element)) {
					tagTrack.push(result.styleDeclarations);
				}
			}
			if (tagTrack.length === 0 && !exitedNow) { stream += subScribed; }
		} else {
			CURSOR.Incremnet(fileCursor);
			if (tagTrack.length === 0) { stream += char; }
		}

	} while (fileCursor.active.marker < content.length);
	fileData.styleData.tagReplacements.push([0, 0]);

	return { stream, classesList, stylesList, attachments };
}
