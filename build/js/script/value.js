import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";
import Use from "../utils/main.js";
import * as INDEX from "../data/index.js";
import * as CACHE from "../data/cache.js";
function EvaluateIndexTraces(action, metaFront, classList, localClassMap) {
    let classMap = {};
    const index_array = [];
    const valid_class_trace = [];
    classList.forEach((entry) => {
        const found = INDEX.FIND(entry, localClassMap);
        if (found.index) {
            valid_class_trace.push([entry, found.index]);
            index_array.push(found.index);
        }
    });
    const indexSetback = Use.array.setback(index_array);
    if (action === _Script._Actions.sync) {
        const dictionary = CACHE.CLASS.Sync_ClassDictionary[JSON.stringify(indexSetback)] || {};
        valid_class_trace.forEach(([K, V]) => {
            classMap[K] = dictionary[V];
        });
    }
    else {
        if (action === _Script._Actions.watch) {
            classMap = Object.fromEntries(valid_class_trace.map(([K, V], index) => {
                const classname = metaFront + index;
                CACHE.CLASS.Sync_PublishIndexMap.push(["." + classname, Number(V)]);
                return [K, classname];
            }));
        }
        if (action === _Script._Actions.monitor) {
            classMap = Object.fromEntries(valid_class_trace.map(([K, V]) => {
                const classname = metaFront + INDEX.FETCH(V).debugclass;
                CACHE.CLASS.Sync_PublishIndexMap.push(["." + classname, Number(V)]);
                return [K, Use.string.normalize(classname, ["/", ".", ":", "|", "$"], ["\\"])];
            }));
        }
    }
    return classMap;
}
export default function classExtract(value, action, fileData, FileCursor) {
    const classList = [], quotes = ["'", "`", '"'];
    const attachments = [];
    let entry = "";
    let scribed = value;
    let activeQuote = "";
    let marker = 0;
    let inQuote = false;
    let ch = value[marker];
    while (ch !== undefined) {
        if (inQuote) {
            if (ch === " " || ch === activeQuote) {
                if (entry.startsWith(CACHE.ROOT.customOperations["attach"])) {
                    attachments.push(entry.slice(1));
                }
                else if (entry.startsWith(CACHE.ROOT.customOperations["assign"])) {
                    classList.push(entry.slice(1));
                }
                entry = "";
            }
            else {
                entry += ch;
            }
            if (ch === activeQuote) {
                inQuote = false;
                activeQuote = "";
            }
        }
        else if (quotes.includes(ch)) {
            inQuote = true;
            activeQuote = ch;
        }
        ch = value[++marker];
    }
    if (action !== _Script._Actions.read) {
        entry = "";
        scribed = "";
        activeQuote = "";
        marker = 0;
        inQuote = false;
        ch = value[marker];
        const metaFront = action === _Script._Actions.monitor
            ? `TAG${fileData.debugclassFront}\\:${FileCursor.rowMarker}\\:${FileCursor.colMarker}__`
            : action === _Script._Actions.watch ? `_${fileData.label}_${FileCursor.cycle}_` : '';
        const classMap = EvaluateIndexTraces(action, metaFront, classList, fileData.styleData.localClasses);
        while (ch !== undefined) {
            if (inQuote) {
                if (ch === " " || ch === activeQuote) {
                    if (!entry.startsWith(CACHE.ROOT.customOperations["attach"])) {
                        if (entry.startsWith(CACHE.ROOT.customOperations["assign"])) {
                            entry = entry.slice(1);
                        }
                        scribed += classMap[entry] ?
                            (action === _Script._Actions.monitor
                                ? Use.string.normalize(classMap[entry], ["/", ".", ":", "|", "$"], ["\\"])
                                : classMap[entry]) : entry;
                    }
                    scribed += ch;
                    entry = "";
                }
                else {
                    entry += ch;
                }
                if (ch === activeQuote) {
                    inQuote = false;
                    activeQuote = "";
                }
            }
            else {
                scribed += ch;
                if (quotes.includes(ch)) {
                    inQuote = true;
                    activeQuote = ch;
                }
            }
            ch = value[++marker];
        }
    }
    return { classList, attachments, scribed };
}
//# sourceMappingURL=value.js.map