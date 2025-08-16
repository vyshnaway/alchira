import Use from "../Utils/main.js";
import { CACHE, RAW } from "../Data/cache.js";
import { INDEX } from "../Data/init.js";
import { t_Data_FILING } from "../types.js";

export type t_Actions = 'read' | 'archive' | 'watch' | 'preview' | 'publish';

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


function loadActiveIndexes(classList: string[], StyleStack: t_StyleStack) {
	return classList.reduce((A: number[], entry) => {
		const index =
			(StyleStack.Portable[entry] || 0) +
			(StyleStack.Library[entry] || 0) +
			(StyleStack.Native[entry] || 0) +
			(StyleStack.Global[entry] || 0) +
			(StyleStack.Local[entry] || 0);
		if (index) { A.push(index); }
		return A;
	}, []);
}

export default function classExtract(
	string: string,
	action: t_Actions,
	fileData: t_Data_FILING,
	BindStack: t_BindStack,
	StyleStack: t_StyleStack,
	FileCursor: t_FileCursor,
	OrderedClassList: Record<string, Record<number, string>> = {}
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
				classList.push(entry);
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
		const metaFront = `TAG${fileData.metaFront}\\:${FileCursor.rowMarker}\\:${FileCursor.colMarker}__`;
		activeQuote = "";
		entry = "";
		scribed = "";
		marker = 0;
		inQuote = false;
		ch = string[marker];

		const availableIndexes = (action === 'preview' || action === "publish") ? Use.array.setback(loadActiveIndexes(classList, StyleStack)) : [];
		const index_to_classNames = (action === 'preview' || action === "publish") ? OrderedClassList[JSON.stringify(availableIndexes)] : [];

		while (ch !== undefined) {
			if (inQuote) {
				if (ch === " " || ch === activeQuote) {
					if (["<", ">"].includes(entry[0])) {
						const className = entry.slice(1);
						switch (entry[0]) {
							case "<":
								BindStack.preBinds.add(className);
								break;
							case ">":
								BindStack.postBinds.add(className);
								break;
						}
					} else {
						const index = (
							(StyleStack.Portable[entry] || 0) +
							(StyleStack.Library[entry] || 0) +
							(StyleStack.Native[entry] || 0) +
							(StyleStack.Global[entry] || 0) +
							(StyleStack.Local[entry] || 0)
						);
						if (index) {
							switch (action) {
								case "archive": {
									const isGlobal = (StyleStack.Global[entry] || 0);
									const isLibrary = (StyleStack.Global[entry] || 0);
									const className = isGlobal ? `/${RAW.PACKAGE}/${entry}`
										: isLibrary ? `/${RAW.PACKAGE}/$/${entry}` : entry;
									scribed += className;
									break;
								}
								case "watch": {
									const devClass = metaFront + INDEX.IMPORT(index).metaClass;
									scribed += Use.string.normalize(devClass, ["/", ".", ":", "|", "$"], ["\\"]);
									CACHE.FinalStack["." + devClass] = index;
									break;
								}
								case "preview":
								case "publish": {
									if (availableIndexes.includes(index)) { scribed += index_to_classNames[index]; }
									break;
								}
							}
						} else { scribed += entry; }
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

	return { classList, scribed };
}
