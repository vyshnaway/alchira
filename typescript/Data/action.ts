import Use from "../Utils/main.js";
import fileman from "../fileman.js";

import {
    t_Data_TWEAKS,
    T_PackageEssential,
    t_ClassData,
    t_ClassIndexMap
} from "../types.js";
import {
    ROOT,
    CACHE_STATIC,
    NAVIGATE,
    DOCUMENTS,
    CACHE_DYNAMIC,
    CACHE_STORAGE,
    CACHE_LIVEDOCS,
    PREFIXES,
    TWEAKS
} from "./cache.js";

function collectTypeStringKeys(object: object) {
    return Object.entries(object).reduce((A, [K, V]) => {
        if (typeof V === "object") { collectTypeStringKeys(V).forEach(k => A.add(k)); }
        else { A.add(K); }
        return A;
    }, new Set<string>());
}

export function collectVendors() {
    ROOT.vendors = Array.from(collectTypeStringKeys(PREFIXES));
}

export function collectTWEAKS(tweaks: t_Data_TWEAKS) {
    Object.assign(TWEAKS, ROOT.defaultTweaks);
    if (typeof tweaks === "object") {
        Object.keys(TWEAKS).forEach(key => {
            if (typeof TWEAKS[key] === typeof tweaks[key]) {
                TWEAKS[key] = tweaks[key];
            }
        });
    };
}

export function SetENV(rootPath: string, workPath: string, packageEssential: T_PackageEssential) {

    CACHE_STATIC.RootPath = rootPath;
    CACHE_STATIC.WorkPath = workPath;

    ROOT.name = packageEssential.name || ROOT.name;
    ROOT.version = packageEssential.version || ROOT.version;
    ROOT.website = packageEssential.website || ROOT.website;
    ROOT.bins = packageEssential.bins;

    Object.entries(NAVIGATE).forEach(([groupName, groupPaths]) => {
        if (groupName === "blueprint" || groupName === "autogen") {
            Object.values(groupPaths).forEach((source) => {
                source.path = fileman.path.join(CACHE_STATIC.RootPath, ...source.frags);
            });
        } else {
            Object.values(groupPaths).forEach((source) => {
                source.path = fileman.path.join(CACHE_STATIC.WorkPath, ...source.frags);
            });
        }
    });

    const CDN = ROOT.URL.Cdn + "version/" + ROOT.version.split(".")[0] + "/";
    Object.values(DOCUMENTS).forEach((object) => {
        Object.values(object).forEach((entry) => {
            entry.url = CDN + entry.url;
            entry.path = fileman.path.join(CACHE_STATIC.RootPath, ...entry.frags);
        });
    });
}

export function MemoryUsage() {
    const chart: Record<string, number> = {
        "Files": Use.string.stringMem(JSON.stringify(CACHE_STATIC)),
        "Cache": Use.string.stringMem(JSON.stringify(CACHE_DYNAMIC)),
        "Stack": Use.string.stringMem(JSON.stringify(CACHE_STORAGE)),
        "Report": Use.string.stringMem(JSON.stringify(CACHE_LIVEDOCS)),
        "Proxy": Object.values(CACHE_STORAGE.TARGET).reduce((t: number, c) => {
            t += Use.string.stringMem(JSON.stringify(c));
            return t;
        }, 0),
    };
    chart["Total"] = Object.values(chart).reduce((a: number, i) => a += i, 0);
    return Object.entries(chart).map(([k, v]) => `${k} : ${v.toFixed(2)} Kb`);
}


export const INDEX = {
    _NOW: 0,
    _BIN: new Set<number>(),
    FETCH: (index: number) => {
        return CACHE_DYNAMIC.Index_ClassData[index];
    },
    FIND: (classname: string, includeTargets = false, localmap: t_ClassIndexMap = {}) => {
        let index = 0;
        let group: ""
            | "PACKAGE"
            | "LIBRARY"
            | "ARCBIND"
            | "ARCHIVE"
            | "GLOBAL"
            | "PUBLIC"
            | "LOCAL"
            = '';

        if (CACHE_DYNAMIC.PackageClass_Index[classname]) {
            index = CACHE_DYNAMIC.PackageClass_Index[classname];
            group = "PACKAGE";
        } else if (CACHE_DYNAMIC.LibraryClass_Index[classname]) {
            index = CACHE_DYNAMIC.LibraryClass_Index[classname];
            group = "LIBRARY";
        } else if (CACHE_DYNAMIC.ArcbindClass_Index[classname]) {
            index = CACHE_DYNAMIC.ArcbindClass_Index[classname];
            group = "ARCBIND";
        } else if (includeTargets) {
            if (CACHE_DYNAMIC.ArchiveClass_Index[classname]) {
                index = CACHE_DYNAMIC.ArchiveClass_Index[classname];
                group = "ARCHIVE";
            } else if (CACHE_DYNAMIC.GlobalClass__Index[classname]) {
                index = CACHE_DYNAMIC.GlobalClass__Index[classname];
                group = "GLOBAL";
            } else if (CACHE_DYNAMIC.PublicClass__Index[classname]) {
                index = CACHE_DYNAMIC.PublicClass__Index[classname];
                group = "PUBLIC";
            }
        } else if (localmap[classname]) {
            index = localmap[classname];
            group = "LOCAL";
        }
        return { index, group };
    },
    DECLARE: (object: t_ClassData) => {
        object.index = INDEX._BIN.values().next().value || ++INDEX._NOW;
        if (INDEX._BIN.has(object.index)) { INDEX._BIN.delete(object.index); }

        const encounted = Use.string.enCounter(object.index + 768);
        object.watchclass = "____" + encounted;
        CACHE_DYNAMIC.Index_ClassData[object.index] = object;
        return { index: object.index, class: object.watchclass };
    },
    DISPOSE: (...indexes: number[]) => {
        indexes.forEach((index) => {
            if (index > 0) {
                INDEX._BIN.add(index);
                delete CACHE_DYNAMIC.Index_ClassData[index.toString()];
            }
        });
    },
    RESET: (after = 0) => {
        after = after > 0 ? after : 0;
        let removed = 0;
        Object.keys(CACHE_DYNAMIC.Index_ClassData).forEach((index) => {
            const number = Number(index);
            if (number > after) {
                if (INDEX._BIN.has(number)) { INDEX._BIN.delete(number); }
                delete CACHE_DYNAMIC.Index_ClassData[number];
                removed++;
            }
        });
        INDEX._NOW = after;
        return removed;
    }
};