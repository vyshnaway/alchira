import fileman from "../fileman.js";
import { t_Data_TWEAKS, T_PackageEssential } from "../types.js";
import Use from "../Utils/main.js";
import { APP, RAW, NAV, SYNC, CACHE, STACK, PUBLISH, PREFIX, TWEAKS } from "./cache.js";

function collectTypeStringKeys(object: object) {
    return Object.entries(object).reduce((A, [K, V]) => {
        if (typeof V === "object") { collectTypeStringKeys(V).forEach(k => A.add(k)); }
        else { A.add(K); }
        return A;
    }, new Set<string>());
}

export function collectVendors() {
    APP.vendors = Array.from(collectTypeStringKeys(PREFIX));
}

export function collectTWEAKS(tweaks: t_Data_TWEAKS) {
    Object.assign(TWEAKS, APP.defaultTweaks);
    if (typeof tweaks === "object") {
        Object.keys(TWEAKS).forEach(key => {
            if (typeof TWEAKS[key] === typeof tweaks[key]) {
                TWEAKS[key] = tweaks[key];
            }
        });
    };
}

export function SetENV(rootPath: string, workPath: string, packageEssential: T_PackageEssential) {

    APP.name = packageEssential.name;
    APP.version = packageEssential.version;
    APP.website = packageEssential.website;
    APP.bins = packageEssential.bins;

    RAW.RootPath = rootPath;
    RAW.WorkPath = workPath;

    Object.entries(NAV).forEach(([groupName, groupPaths]) => {
        if (groupName === "blueprint" || groupName === "autogen") {
            Object.values(groupPaths).forEach((source) => {
                source.path = fileman.path.join(RAW.RootPath, ...source.frags);
            });
        } else {
            Object.values(groupPaths).forEach((source) => {
                source.path = fileman.path.join(RAW.WorkPath, ...source.frags);
            });
        }
    });

    const CDN = APP.URL.Cdn + "version/" + APP.version.split(".")[0] + "/";
    Object.values(SYNC).forEach((object) => {
        Object.values(object).forEach((entry) => {
            entry.url = CDN + entry.url;
            entry.path = fileman.path.join(RAW.RootPath, ...entry.frags);
        });
    });
}

export function MemoryUsage() {
    const chart: Record<string, number> = {
        "Files": Use.string.stringMem(JSON.stringify(RAW)),
        "Cache": Use.string.stringMem(JSON.stringify(CACHE)),
        "Stack": Use.string.stringMem(JSON.stringify(STACK)),
        "Report": Use.string.stringMem(JSON.stringify(PUBLISH)),
        "Proxy": Object.values(STACK.PROXYCACHE).reduce((t: number, c) => {
            t += Use.string.stringMem(JSON.stringify(c));
            return t;
        }, 0),
    };
    chart["Total"] = Object.values(chart).reduce((a: number, i) => a += i, 0);
    return Object.entries(chart).map(([k, v]) => `${k} : ${v.toFixed(2)} Kb`);
}


// export const INDEX = {
//     _NOW: 0,
//     _BIN: new Set(),
//     STYLE: (index = 0) => {
//         return CACHE.Index2StylesObject[index];
//     },
//     CLONE: (index = 0) => {
//         if (INDEX._BIN.size > 0) {
//             object.index = INDEX._BIN.values().next().value;
//             INDEX._BIN.delete(object.index);
//         } else { object.index = ++INDEX._NOW; }

//         const encounted = Use.string.enCounter(object.index + 768);
//         object.class = "_" + encounted;
//         CACHE.Index2StylesObject[object.index] = CACHE.Index2StylesObject[index];
//         return { index: object.index, class: object.class };
//     },
//     DECLARE: (object = {}) => {
//         if (INDEX._BIN.size > 0) {
//             object.index = INDEX._BIN.values().next().value;
//             INDEX._BIN.delete(object.index);
//         } else { object.index = ++INDEX._NOW; }

//         const encounted = Use.string.enCounter(object.index + 768);
//         object.class = "_" + encounted;
//         object.spare = "-" + encounted;
//         CACHE.Index2StylesObject[object.index] = object;
//         return { index: object.index, class: object.class, spare: object.spare };
//     },
//     DISPOSE: (...indexes) => {
//         indexes.forEach((index) => {
//             if (index > 0) {
//                 INDEX._BIN.add(index);
//                 delete CACHE.Index2StylesObject[index.toString()];
//             }
//         });
//     },
//     RESET: (after = 0) => {
//         after = after > 0 ? after : 0;
//         let removed = 0;
//         Object.keys(CACHE.Index2StylesObject).forEach((index) => {
//             const number = Number(index);
//             if (number > after) {
//                 if (INDEX._BIN.has(number)) { INDEX._BIN.delete(number); }
//                 delete CACHE.Index2StylesObject[index];
//                 removed++;
//             }
//         });
//         INDEX._NOW = after;
//         return removed;
//     }
// };