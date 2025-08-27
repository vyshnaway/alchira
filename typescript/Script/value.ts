import Use from "../Utils/main.js";
import { INDEX } from "../Data/action.js";
import * as CACHE from "../Data/cache.js";
import * as TYPE from "../types.js";


function EvaluateIndexTraces(
	action: TYPE.ScriptParseActions,
	metaFront: string,
	classList: string[],
	localClassMap: Record<string, number>
): Record<string, string> {
	let classMap: Record<string, string> = {};

	if (action === "archive") {
		classMap = classList.reduce((acc, entry) => {
			const found = INDEX.FIND(entry, true, localClassMap);
			if (found.index) {
				if (found.group === "LIBRARY") {
					acc[entry] = `/${CACHE.STATIC.Package.Name}/$/${entry}`;
				} else if (found.group === "PUBLIC") {
					acc[entry] = `/${CACHE.STATIC.Package.Name}/${entry}`;
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

		if (action === 'sync') {
			classMap = CACHE.DYNAMIC.Sync_ClassDictionary[JSON.stringify(indexSetback)] || {};
		} else {
			if (action === "watch") {
				classMap = Object.fromEntries(class_trace.map(([_, V], index) => [V, metaFront + index]));
			}
			if (action === "monitor") {
				classMap = Object.fromEntries(class_trace.map(([K, V]) => [V, metaFront + INDEX.FETCH(K).debugclass]));
			}

			Object.entries(string_index_map).forEach(([k, v]) => CACHE.DYNAMIC.Sync_PublishIndexMap["." + k] = v);
		}
	}
	return classMap;
}

export default function classExtract(
	string: string,
	action: TYPE.ScriptParseActions,
	fileData: TYPE.FILE_Storage,
	attachments: Set<string>,
	FileCursor: TYPE.FileCursor,
) {
	const classList: string[] = [], quotes = ["'", "`", '"'];
	let activeQuote = "",
		entry = "",
		scribed = string,
		marker = 0,
		ch = string[marker],
		inQuote = false;

	// Classlist
	while (ch !== undefined) {
		if (inQuote) {
			if (ch === " " || ch === activeQuote) {
				if (entry.startsWith(CACHE._ROOT.customOperations["attach"])) {
					attachments.add(entry.slice(1));
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

	if (action !== "read") {
		activeQuote = "";
		entry = "";
		scribed = "";
		marker = 0;
		inQuote = false;
		ch = string[marker];

		const metaFront = action === "monitor"
			? `TAG${fileData.debugclassFront}\\:${FileCursor.rowMarker}\\:${FileCursor.colMarker}__`
			: action === "watch" ? `${fileData.label}_${FileCursor.cycle}_` : '';

		const classMap = EvaluateIndexTraces(action, metaFront, classList, fileData.styleData.localClasses);

		while (ch !== undefined) {
			if (inQuote) {
				if (ch === " " || ch === activeQuote) {
					if (!entry.startsWith(CACHE._ROOT.customOperations["attach"])) {
						scribed += classMap[entry] ?
							(action === "monitor"
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
