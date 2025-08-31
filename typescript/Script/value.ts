// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
import * as _Style from "../type/style.js";
import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";


import Use from "../utils/main.js";
import * as INDEX from "../data/index.js";
import * as CACHE from "../data/cache.js";


function EvaluateIndexTraces(
	action: _Script._Actions,
	metaFront: string,
	classList: string[],
	localClassMap: Record<string, number>
): Record<string, string> {
	let classMap: Record<string, string> = {};

	if (action === _Script._Actions.artifact) {
		classMap = classList.reduce((acc, entry) => {
			const found = INDEX.FIND(entry, true, localClassMap);
			if (found.index) {
				if (found.group === _Style._Type.LIBRARY) {
					acc[entry] = `/${CACHE.STATIC.Artifact.name}/$/${entry}`;
				} else if (found.group === _Style._Type.PUBLIC) {
					acc[entry] = `/${CACHE.STATIC.Artifact.name}/${entry}`;
				}
			}
			return acc;
		}, {} as Record<string, string>);


	} else {

		const index_array: number[] = [];
		const class_trace: [number, string][] = [];
		const string_index_map: Record<string, number> = {};

		classList.forEach((entry) => {
			const found = INDEX.FIND(entry, true, localClassMap);
			if (found.index) {
				class_trace.push([found.index, entry]);
				index_array.push(found.index);
			}
		});
		const indexSetback = Use.array.setback(index_array);

		if (action === _Script._Actions.sync) {
			classMap = CACHE.CLASS.Sync_ClassDictionary[JSON.stringify(indexSetback)] || {};
		} else {
			if (action === _Script._Actions.watch) {
				classMap = Object.fromEntries(class_trace.map(([_, V], index) => [V, metaFront + index]));
			}
			if (action === _Script._Actions.monitor) {
				classMap = Object.fromEntries(class_trace.map(([K, V]) => [V, metaFront + INDEX.FETCH(K).debugclass]));
			}

			Object.entries(string_index_map).forEach(([k, v]) => CACHE.CLASS.Sync_PublishIndexMap["." + k] = v);
		}
	}
	return classMap;
}

export default function classExtract(
	string: string,
	action: _Script._Actions,
	fileData: _File.Storage,
	FileCursor: _File.Position,
) {
	const classList: string[] = [], quotes = ["'", "`", '"'];
	const attachments: string[] = [];

	let entry = "";
	let scribed = string;
	let activeQuote = "";
	let marker = 0;
	let inQuote = false;
	let ch = string[marker];

	// Classlist
	while (ch !== undefined) {
		if (inQuote) {
			if (ch === " " || ch === activeQuote) {
				if (entry.startsWith(CACHE.ROOT.customOperations["attach"])) {
					attachments.push(entry.slice(1));
				} else if (entry.startsWith(CACHE.ROOT.customOperations["assign"])) {
					classList.push(entry.slice(1));
				} else {
					classList.push(entry);
				}
				entry = "";
			} else { entry += ch; }
			if (ch === activeQuote) {
				inQuote = false;
				activeQuote = "";
			}
		} else if (quotes.includes(ch)) {
			inQuote = true;
			activeQuote = ch;
		}

		ch = string[++marker];
	}

	if (action !== _Script._Actions.read) {
		entry = "";
		scribed = "";
		activeQuote = "";
		marker = 0;
		inQuote = false;
		ch = string[marker];

		const metaFront = action === _Script._Actions.monitor
			? `TAG${fileData.debugclassFront}\\:${FileCursor.rowMarker}\\:${FileCursor.colMarker}__`
			: action === _Script._Actions.watch ? `${fileData.label}_${FileCursor.cycle}_` : '';

		const classMap = EvaluateIndexTraces(action, metaFront, classList, fileData.styleData.localClasses);

		while (ch !== undefined) {
			if (inQuote) {
				if (ch === " " || ch === activeQuote) {
					if (
						!entry.startsWith(CACHE.ROOT.customOperations["attach"])
					) {
						if (entry.startsWith(CACHE.ROOT.customOperations["assign"])) {
							entry = entry.slice(1);
						}
						scribed += classMap[entry] ?
							(action === _Script._Actions.monitor
								? Use.string.normalize(classMap[entry], ["/", ".", ":", "|", "$"], ["\\"])
								: classMap[entry]
							) : entry;
					}
					scribed += ch;
					entry = "";
				} else { entry += ch; }
				if (ch === activeQuote) {
					inQuote = false;
					activeQuote = "";
				}
			} else {
				scribed += ch;
				if (quotes.includes(ch)) {
					inQuote = true;
					activeQuote = ch;
				}
			}

			ch = string[++marker];
		}
	}
	
	return { classList, attachments, scribed };
}
