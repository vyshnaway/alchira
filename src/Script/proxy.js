import { stash, lists, finals, createXtyle } from "../executor.js"
import Utils from "../Utils/index.js";

function loadActiveIndexes(classList = [], filePath) {
    return classList.reduce((A, entry) => {
        const index = (stash.styleRefers[entry] ?? 0) +
            (stash.styleGlobals[entry] ?? 0) +
            ((stash.styleLocals[filePath] && stash.styleLocals[filePath][entry]) ?? 0)
        if (index) A.push(index);

        return A;
    }, [])
}

function loadActiveStyles(classList, filePath) {
    return Utils.object.multiMerge(classList.reduce((A, index) => {
        A.push(stash.indexStyles[index].object);
        return A;
    }, []), true)
}

export default function classExtract(string, action, fileData, shrad) {
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
        const metaFront = "_tag-" + shrad + fileData.metaFront;
        activeQuote = "", entry = "", scribed = "", marker = 0, inQuote = false, ch = string[marker];
        const activeIndexes = (action === "dev") ? [] :
            Utils.array.longestSubChain(lists.ordered, loadActiveIndexes(classList, fileData.filePath));
        const activeStyles = loadActiveStyles(activeIndexes);

        while (ch !== undefined) {
            if (inQuote) {
                if (ch === " " || ch === activeQuote) {
                    if (["<", ">", "*"].includes(entry[0])) {
                        const className = entry.slice(1);
                        switch (entry[0]) {
                            case ">":
                                lists.postBinds.add(className)
                            case "<":
                                lists.preBinds.add(className)
                            case "*":
                                if (className[0] === "-" || /\$-/.test(className))
                                    lists.preBinds.add(className)
                                else lists.postBinds.add(className)
                        }
                    } else {
                        const index = (stash.styleRefers[entry] ?? 0) +
                            (stash.styleGlobals[entry] ?? 0) +
                            ((stash.styleLocals[fileData.filePath] && stash.styleLocals[fileData.filePath][entry]) ?? 0);
                        if (index) {
                            switch (action) {
                                case "dev":
                                    const devClass = stash.indexStyles[index].scope + metaFront + stash.indexStyles[index].metaClass;
                                    scribed += devClass;
                                    finals["." + devClass] = index;
                                    break;
                                case "preview":
                                    if (activeIndexes.includes(index)) {
                                        scribed += stash.indexStyles[index].class;
                                    } else {
                                        const className = "." + createXtyle().class;
                                        finals[className] = index;
                                        scribed += className;
                                    }
                                    break;
                                case "build":
                                    if (activeIndexes.includes(index)) {
                                        scribed += stash.indexStyles[index].class;
                                    } else {
                                        const deltaStyles = Utils.object.extract(activeStyles, stash.indexStyles[index].object);
                                        if (Object.keys(deltaStyles).length) scribed += stash.indexStyles[index].class;
                                        else {
                                            const identity = createXtyle();
                                            stash.indexStyles["." + identity.class] = deltaStyles;
                                            finals[className] = index;
                                            scribed += identity.class;
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
