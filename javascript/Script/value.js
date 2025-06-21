import { BindStack, FileCursor, StyleStack } from "./file.js";

import Use from "../Utils/index.js";
import { CACHE, RAW } from "../data-cache.js";
import { INDEX } from "../data-set.js";

function loadActiveIndexes(classList = []) {
	return classList.reduce((A, entry) => {
		const index =
			(StyleStack.Portable[entry] || 0) +
			(StyleStack.Library[entry] || 0) +
			(StyleStack.Native[entry] || 0) +
			(StyleStack.Global[entry] || 0) +
			(StyleStack.Local[entry] || 0);
		if (index) A.push(index);
		return A;
	}, []);
}

function loadActiveStyles(classList) {
	return Use.object.multiMerge(
		classList.reduce((A, index) => {
			A.push(INDEX.STYLE(index).object);
			return A;
		}, []),
		true,
	);
}

export default function classExtract(string, action, fileData) {
	const classList = [],
		quotes = ["'", "`", '"'];
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
			} else entry += ch;
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
		(activeQuote = ""), (entry = ""), (scribed = ""), (marker = 0), (inQuote = false), (ch = string[marker]);


		const effectiveIndexes = action === "watch" ? [] : Use.array.setback(loadActiveIndexes(classList));
		const activeIndexes = action === "watch" ? [] : Use.array.longestSubChain(CACHE.SortedIndexes, effectiveIndexes);
		const deltaIndexes = action === "watch" ? [] : effectiveIndexes.filter(index => !activeIndexes.includes(index))

		const effectiveStyles = action === "publish" ? loadActiveStyles(effectiveIndexes) : {};
		const activeStyles = action === "publish" ? loadActiveStyles(activeIndexes) : {};
		const deltaStyles = action === "publish" ? Use.object.onlyB(activeStyles, effectiveStyles) : {};

		console.log({
			effectiveIndexes,
			activeIndexes,
			deltaIndexes,
			effectiveStyles,
			activeStyles,
			deltaStylesResult: deltaStyles.result,
			deltaStylesScore: deltaStyles.score
		})

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
						const index =
							(StyleStack.Portable[entry] || 0) +
							(StyleStack.Library[entry] || 0) +
							(StyleStack.Native[entry] || 0) +
							(StyleStack.Global[entry] || 0) +
							(StyleStack.Local[entry] || 0);
						if (index) {
							switch (action) {
								case "split":
									const isGlobal = (StyleStack.Global[entry] || 0);
									const isLibrary = (StyleStack.Global[entry] || 0);
									const className = isGlobal ? `/${RAW.PACKAGE}/${entry}`
										: isLibrary ? `/${RAW.PACKAGE}/$/${entry}` : entry;
									scribed += className;
									break;
								case "watch":
									const devClass = metaFront + INDEX.STYLE(index).metaClass;
									scribed += Use.string.normalize(devClass, ["/", ".", ":", "|", "$"], ["\\"]);
									CACHE.FinalStack["." + devClass] = index;
									break;
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
						} else scribed += entry;
					}
					scribed += ch;
					entry = "";
				} else entry += ch;
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
