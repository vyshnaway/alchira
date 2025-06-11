import Use from "../Utils/index.js";
import STYLE from "../Style/parse.js"
import { STASH } from "../data-cache.js";
import { BindStack, FileCursor, StyleStack } from "./file.js"
import Utils from "../Utils/index.js";

function loadActiveIndexes(classList = []) {
    return classList.reduce((A, entry) => {
        const index = (StyleStack.Library[entry] ?? 0) + (StyleStack.Global[entry] ?? 0) + ((StyleStack.Local[entry]) ?? 0);
        if (index) A.push(index);
        return A;
    }, [])
}

function loadActiveStyles(classList) {
    return Use.object.multiMerge(classList.reduce((A, index) => {
        A.push(STASH.Index2StylesObject[index].object);
        return A;
    }, []), true)
}

export default function classExtract(string, action, fileData) {
    const classList = [], quotes = ["'", "`", '"'];
    let activeQuote = "", entry = "", scribed = string,
        marker = 0, ch = string[marker], inQuote = false;

    // Classlist
    while (ch !== undefined) {
        if (inQuote) {
            if (ch === " " || ch === activeQuote) {
                classList.push(entry);
                entry = ""
            } else entry += ch
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
        const metaFront = `TAG${fileData.metaFront}\\:${FileCursor.rowMarker}__`;
        activeQuote = "", entry = "", scribed = "", marker = 0, inQuote = false, ch = string[marker];
        const activeIndexes = (action === "watch") ? [] :
            Use.array.longestSubChain(STASH.SortedIndexes, loadActiveIndexes(Use.array.setback(classList), fileData.filePath));
        const activeStyles = loadActiveStyles(activeIndexes);

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
                        const index = (StyleStack.Library[entry] ?? 0) + (StyleStack.Global[entry] ?? 0) + ((StyleStack.Local[entry]) ?? 0);
                        if (index) {
                            switch (action) {
                                case "watch":
                                    const devClass = metaFront + STASH.Index2StylesObject[index].metaClass;
                                    scribed += Utils.string.normalize(devClass, ["/", ".", ":", "|", "$"], ["\\"]);
                                    STASH.FinalStack["." + devClass] = index;
                                    break;
                                case "preview":
                                    if (activeIndexes.includes(index)) {
                                        scribed += STASH.Index2StylesObject[index].class;
                                    } else {
                                        const identity = STYLE.INDEX.DECLARE();
                                        fileData.usedIndexes.add(identity.number);
                                        STASH.FinalStack["." + identity.class] = index;
                                        scribed += identity.class;
                                    }
                                    break;
                                case "publish":
                                    if (activeIndexes.includes(index)) {
                                        scribed += STASH.Index2StylesObject[index].class;
                                    } else {
                                        const deltaStyles = Use.object.onlyB(activeStyles, STASH.Index2StylesObject[index].object);
                                        if (deltaStyles.score) scribed += STASH.Index2StylesObject[index].class;
                                        else {
                                            const identity = STYLE.INDEX.DECLARE();
                                            fileData.usedIndexes.add(identity.number);
                                            scribed += identity.class;
                                            STASH.Index2StylesObject[identity.number] = deltaStyles.result;
                                            STASH.FinalStack["."+identity.class] = identity.number;
                                        }
                                    }
                                    break;
                            }
                        } else scribed += entry;
                    }
                    scribed += ch;
                    entry = ""
                } else entry += ch
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

    return { classList, scribed }
}
