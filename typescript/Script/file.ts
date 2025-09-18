// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import TAGSCAN from './tag.js';
import Use from "../utils/main.js";

import * as CACHE from '../data/cache.js';

const CustomTagElements = Object.keys(CACHE.ROOT.customElements);
const replacementTags = Object.entries(CACHE.ROOT.customElements).reduce((A, [K, V]) => {
	A[`<!-- ${K} -->`] = V;
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
	const content = (action === _Script._Actions.read) ? fileData.content : fileData.midway;
	const tagTrack: _Script.RawStyle[] = [];
	const classesList: string[][] = [];
	const attachments: string[] = [];
	const fileCursor = new Use.cursor(content);

	let stream = "";

	do {
		const char = fileCursor.active.char;

		if (
			(content[fileCursor.active.marker - 1] !== "\\")
			&& (char === "<")
			&& (/[!/\d\w-]/i.test(content[fileCursor.active.marker + 1]))
		) {
			let subScribed = '';
			const tagStart = fileCursor.active.marker;
			const result = TAGSCAN(fileData, classProps, action, fileCursor);
			const fragment = content.slice(tagStart, result.styleDeclarations.endMarker);
			const hasDeclared = Object.keys(result.styleDeclarations.styles).length || result.styleDeclarations.symclasses.length;
			if (result.ok) {
				classesList.push(...result.classesList);
				attachments.push(...result.attachments);

				if (hasDeclared) {
					stylesList.push(result.styleDeclarations);
				} else if (replacementTags[fragment] && (tagTrack.length === 0)) {
					fileData.styleData.tagReplacements.push([replacementTags[fragment], stream.length]);
				}

				Object.entries(result.styleDeclarations.styles).forEach(([k, v]) => { result.styleDeclarations.styles[k] = v.slice(1, -1); });

				if (action === _Script._Actions.read) {
					subScribed = !hasDeclared ? fragment
						: result.styleDeclarations.elid ? ""
							: ('<' + [
								result.styleDeclarations.element + (result.styleDeclarations.elvalue.length ? `=${result.styleDeclarations.elvalue}` : ''),
								...Object.entries(result.nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
							].join(' ') + '>');
				} else if (!replacementTags[fragment]) {
					subScribed = result.classSynced ? '<' + [
						result.styleDeclarations.element + (result.styleDeclarations.elvalue.length ? `=${result.styleDeclarations.elvalue}` : ''),
						...Object.entries(result.nativeAttributes).map(([A, V]) => V === "" ? A : `${A}=${V}`)
					].join(' ') + '>' : fragment;
				}

				fileCursor.increment();
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
							watchTrack.attachstring = content.slice(watchTrack.endMarker, tagStart);
							exitedNow = true;
						} else {
							tagTrack.push(watchTrack);
						}
					}
				} else if (CustomTagElements.includes(result.styleDeclarations.element) && hasDeclared) {
					result.styleDeclarations.attributes = result.nativeAttributes;
					tagTrack.push(result.styleDeclarations);
				}
			}
			if (tagTrack.length === 0 && !exitedNow) { stream += subScribed; }
		} else {
			fileCursor.increment();
			if (tagTrack.length === 0) { stream += char; }
		}

	} while (fileCursor.active.marker < content.length);
	fileData.styleData.tagReplacements.push([0, 0]);

	return { stream, classesList, stylesList, attachments };
}
