import Use from "../Utils/main.js";
import { CACHE, RAW } from "../Data/cache.js";
import { INDEX } from "../Data/init.js";
import { t_BindStack, t_FileCursor, t_StyleStack } from "./file.js";
import { t_Data_FILING } from "../types.js";

export type t_Actions = 'read' | 'archive' | 'watch' | 'preview' | 'publish';

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

function loadActiveStyleSheet(classList: number[]) {
	return Use.object.multiMerge(
		classList.map((index) => INDEX.IMPORT(index) ? INDEX.IMPORT(index).object : {}),
		true,
	);
}

export default function classExtract(
	string: string,
	action: t_Actions,
	fileData: t_Data_FILING,
	BindStack: t_BindStack,
	StyleStack: t_StyleStack,
	FileCursor: t_FileCursor,
	OrderedClassList: Record<string, string[]> = {}
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


		const availableIndexes = action === "watch" ? [] : Use.array.setback(loadActiveIndexes(classList, StyleStack));
		const activeIndexes = action === "watch" ? [] : Use.array.longestSubChain(CACHE.SortedIndexes, availableIndexes);
		const activeStyles = action === "publish" ? loadActiveStyleSheet(activeIndexes) : {};

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
									const isGlobal_or_Public = (StyleStack.Global[entry] || 0);
									const isLibrary = (StyleStack.Global[entry] || 0);
									const className = isGlobal_or_Public ? `/${RAW.PACKAGE}/${entry}`
										: isLibrary ? `/${RAW.PACKAGE}/$/${entry}` : entry;
									scribed += className;
									break;
								}
								case "watch": {
									const devClass = metaFront + INDEX.STYLE(index).metaClass;
									scribed += Use.string.normalize(devClass, ["/", ".", ":", "|", "$"], ["\\"]);
									CACHE.FinalStack["." + devClass] = index;
									break;
								}
								case "preview":
									if (activeIndexes.includes(index)) {
										scribed += INDEX.STYLE(index).class;
									} else {
										const identity = INDEX.DECLARE();
										CACHE.FinalStack["." + identity.class] = index;
										scribed += identity.class;
										fileData.usedIndexes.add(identity.index);
									}
									break;
								case "publish":
									if (activeIndexes.includes(index)) {
										scribed += INDEX.STYLE(index).class;
									} else {
										const deltaSnippet = Use.object.onlyB(activeStyles, INDEX.STYLE(index).object);
										// console.log({ activeStyles, indexStyles: INDEX.STYLE(index).object, deltaSnippet })
										if (deltaSnippet.score) {

											const identity = INDEX.DECLARE({
												portable: "",
												scope: "",
												selector: "",
												object: deltaSnippet.result,
												metadata: "",
												preBinds: [],
												postBinds: [],
												metaClass: "",
												declarations: [],
											});
											CACHE.FinalStack["." + identity.class] = identity.index;
											fileData.usedIndexes.add(identity.index);
											scribed += identity.class;

											// const className = "_" + INDEX.STYLE(index).class;
											// CACHE.FinalStack["." + className] = index;
											// scribed += className;

										} else {
											scribed += INDEX.STYLE(index).class;
										}
									}
									break;
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
