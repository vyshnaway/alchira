import Use from "../Utils/main.js";
import { INDEX } from "../Data/init.js";
import { CACHE_STATIC } from "../Data/cache.js";
import { t_FILE_Storage, t_FileCursor } from "../types.js";

export type t_Actions = 'read' | 'archive' | 'debug' | 'preview' | 'publish';

export interface t_StyleStack {
	Portable: Record<string, number>,
	Library: Record<string, number>,
	Native: Record<string, number>,
	Local: Record<string, number>,
	Global: Record<string, number>
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
	fileData: t_FILE_Storage,
	attacments: Set<string>,
	StyleStack: t_StyleStack,
	FileCursor: t_FileCursor,
	OrderedClassList: Record<string, Record<number, string>>,
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
		const metaFront = `TAG${fileData.metaclassFront}\\:${FileCursor.rowMarker}\\:${FileCursor.colMarker}__`;
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
						if (entry[0] === '*') { attacments.add(className); }
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
									const className = isGlobal ? `/${CACHE_STATIC.PROJECT_NAME}/${entry}`
										: isLibrary ? `/${CACHE_STATIC.PROJECT_NAME}/$/${entry}` : entry;
									scribed += className;
									break;
								}
								case "debug": {
									const devClass = metaFront + INDEX.IMPORT(index).debugClass;
									scribed += Use.string.normalize(devClass, ["/", ".", ":", "|", "$"], ["\\"]);
									// CACHE.FinalStack["." + devClass] = index;
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
