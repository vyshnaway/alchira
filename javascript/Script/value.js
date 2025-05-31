import Use from "../Utils/index.js";
import { STASH, STYLEIN } from "../data-cache.js"
import { FileCursor, StyleStack } from "./file.js"

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
        const metaFront = "TAG-" + FileCursor.tagCount + "" + fileData.metaFront + "_";
        activeQuote = "", entry = "", scribed = "", marker = 0, inQuote = false, ch = string[marker];
        const activeIndexes = (action === "dev") ? [] :
            Use.array.longestSubChain(STASH.SortedIndexes, loadActiveIndexes(Use.array.setback(classList), fileData.filePath));
        const activeStyles = loadActiveStyles(activeIndexes);

        while (ch !== undefined) {
            if (inQuote) {
                if (ch === " " || ch === activeQuote) {
                    if (["<", ">", "*"].includes(entry[0])) {
                        const className = entry.slice(1);
                        switch (entry[0]) {
                            case ">":
                                STASH.FinalPostBinds.add(className)
                            case "<":
                                STASH.FinalPreBinds.add(className)
                            case "*":
                                if (className[0] === "-" || /\$-/.test(className))
                                    STASH.FinalPreBinds.add(className)
                                else STASH.FinalPostBinds.add(className)
                        }
                        // if (!(className[0] === "-" || /\$-/.test(className)))
                        //     scribed += className;
                    } else {
                        const index = (StyleStack.Library[entry] ?? 0) + (StyleStack.Global[entry] ?? 0) + ((StyleStack.Local[entry]) ?? 0);
                        if (index) {
                            switch (action) {
                                case "dev":
                                    const devClass = metaFront + STASH.Index2StylesObject[index].metaClass;
                                    scribed += devClass;
                                    STASH.Midway.Finals["." + devClass] = index;
                                    break;
                                case "preview":
                                    if (activeIndexes.includes(index)) {
                                        scribed += STASH.Index2StylesObject[index].class;
                                    } else {
                                        const identity = STYLEIN.DECLARE();
                                        fileData.usedIndexes.add(identity.number);
                                        STASH.Midway.Finals["." + identity.class] = index;
                                        scribed += identity.class;
                                    }
                                    break;
                                case "build":
                                    if (activeIndexes.includes(index)) {
                                        scribed += STASH.Index2StylesObject[index].class;
                                    } else {
                                        const deltaStyles = Use.object.onlyB(activeStyles, STASH.Index2StylesObject[index].object);
                                        if (deltaStyles.score) scribed += STASH.Index2StylesObject[index].class;
                                        else {
                                            const identity = STYLEIN.DECLARE();
                                            fileData.usedIndexes.add(identity.number);
                                            scribed += identity.class;
                                            console.log()
                                            STASH.Index2StylesObject["." + identity.class] = deltaStyles.result;
                                            STASH.Midway.Finals[className] = index;
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
