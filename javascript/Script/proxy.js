import Utils from "../Utils/index.js";
import { cursor } from "./file.js"
import { STASH, MIDWAY, MakeStyle } from "../craftsmen.js"

function loadActiveIndexes(classList = [], filePath) {
    return classList.reduce((A, entry) => {
        const index = (STASH.LibraryStyle2Index[entry] ?? 0) +
            (STASH.GlobalsStyle2Index[entry] ?? 0) +
            ((STASH.styleLocals[filePath] && STASH.styleLocals[filePath][entry]) ?? 0)
        if (index) A.push(index);

        return A;
    }, [])
}

function loadActiveStyles(classList) {
    return Utils.object.multiMerge(classList.reduce((A, index) => {
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
        const metaFront = "TAG-" + cursor.tagCount + "" + fileData.metaFront + "_";
        activeQuote = "", entry = "", scribed = "", marker = 0, inQuote = false, ch = string[marker];
        const activeIndexes = (action === "dev") ? [] :
            Utils.array.longestSubChain(STASH.SortedIndexes, loadActiveIndexes(Utils.array.setback(classList), fileData.filePath));
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
                        const index = (STASH.LibraryStyle2Index[entry] ?? 0) +
                            (STASH.GlobalsStyle2Index[entry] ?? 0) +
                            ((STASH.styleLocals[fileData.filePath] && STASH.styleLocals[fileData.filePath][entry]) ?? 0);
                        if (index) {
                            switch (action) {
                                case "dev":
                                    const devClass = metaFront + STASH.Index2StylesObject[index].metaClass;
                                    scribed += devClass;
                                    MIDWAY.RENDERS["." + devClass] = index;
                                    break;
                                case "preview":
                                    if (activeIndexes.includes(index)) {
                                        scribed += STASH.Index2StylesObject[index].class;
                                    } else {
                                        const identity = MakeStyle();
                                        MIDWAY.RENDERS["." + identity.class] = index;
                                        scribed += identity.class;
                                    }
                                    break;
                                case "build":
                                    if (activeIndexes.includes(index)) {
                                        scribed += STASH.Index2StylesObject[index].class;
                                    } else {
                                        const deltaStyles = Utils.object.onlyB(activeStyles, STASH.Index2StylesObject[index].object);
                                        if (deltaStyles.score) scribed += STASH.Index2StylesObject[index].class;
                                        else {
                                            const identity = MakeStyle();
                                            scribed += identity.class;
                                            console.log()
                                            STASH.Index2StylesObject["." + identity.class] = deltaStyles.result;
                                            MIDWAY.RENDERS[className] = index;
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
