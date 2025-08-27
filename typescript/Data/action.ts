import USE from "../Utils/main.js";
import FILEMAN from "../fileman.js";

import * as TYPE from "../types.js";
import * as CACHE from "./cache.js";

function collectTypeStringKeys(object: object) {
    return Object.entries(object).reduce((A, [K, V]) => {
        if (typeof V === "object") { collectTypeStringKeys(V).forEach(k => A.add(k)); }
        else { A.add(K); }
        return A;
    }, new Set<string>());
}

export function collectVendors() {
    CACHE._ROOT.vendors = Array.from(collectTypeStringKeys(CACHE._PREFIX));
}

export function collectTWEAKS(tweaks: TYPE.Data_TWEAKS) {
    Object.assign(CACHE._TWEAKS, CACHE._ROOT.defaultTweaks);
    if (typeof tweaks === "object") {
        Object.keys(CACHE._TWEAKS).forEach(key => {
            if (typeof CACHE._TWEAKS[key] === typeof tweaks[key]) {
                CACHE._TWEAKS[key] = tweaks[key];
            }
        });
    };
}

export function SetENV(rootPath: string, workPath: string, packageEssential: TYPE.PackageEssential) {

    CACHE.STATIC.RootPath = rootPath;
    CACHE.STATIC.WorkPath = workPath;
    
    CACHE._ROOT.name = packageEssential.name || CACHE._ROOT.name;
    CACHE._ROOT.version = packageEssential.version || CACHE._ROOT.version;
    CACHE._ROOT.website = packageEssential.website || CACHE._ROOT.website;
    CACHE._ROOT.bin = packageEssential.bin;

    Object.entries(CACHE._PATH).forEach(([groupName, groupPaths]) => {
        if (groupName === "blueprint" || groupName === "autogen") {
            Object.values(groupPaths).forEach((source) => {
                source.path = FILEMAN.path.join(CACHE.STATIC.RootPath, ...source.frags);
            });
        } else {
            Object.values(groupPaths).forEach((source) => {
                source.path = FILEMAN.path.join(CACHE.STATIC.WorkPath, ...source.frags);
            });
        }
    });

    const CDN = CACHE._ROOT.URL.Cdn + "version/" + CACHE._ROOT.version.split(".")[0] + "/";
    Object.values(CACHE._SYNC).forEach((object) => {
        Object.values(object).forEach((entry) => {
            entry.url = CDN + entry.url;
            entry.path = FILEMAN.path.join(CACHE.STATIC.RootPath, ...entry.frags);
        });
    });

    console.log(CACHE.STATIC);
    console.log(CACHE._ROOT);
    console.log(CACHE._SYNC);
}

export function MemoryUsage() {
    const chart: Record<string, number> = {
        "Files": USE.string.stringMem(JSON.stringify(CACHE.STATIC)),
        "Cache": USE.string.stringMem(JSON.stringify(CACHE.DYNAMIC)),
        "Stack": USE.string.stringMem(JSON.stringify(CACHE.STORAGE)),
        "Report": USE.string.stringMem(JSON.stringify(CACHE.LIVEDOCS)),
        "Proxy": Object.values(CACHE.STORAGE.TARGET).reduce((t: number, c) => {
            t += USE.string.stringMem(JSON.stringify(c));
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
        return CACHE.DYNAMIC.Index_ClassData[index];
    },
    FIND: (classname: string, includeTargets = false, localmap: TYPE.ClassIndexMap = {}) => {
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

        if (CACHE.DYNAMIC.PackageClass_Index[classname]) {
            index = CACHE.DYNAMIC.PackageClass_Index[classname];
            group = "PACKAGE";
        } else if (CACHE.DYNAMIC.LibraryClass_Index[classname]) {
            index = CACHE.DYNAMIC.LibraryClass_Index[classname];
            group = "LIBRARY";
        } else if (CACHE.DYNAMIC.ArcbindClass_Index[classname]) {
            index = CACHE.DYNAMIC.ArcbindClass_Index[classname];
            group = "ARCBIND";
        } else if (includeTargets) {
            if (CACHE.DYNAMIC.ArchiveClass_Index[classname]) {
                index = CACHE.DYNAMIC.ArchiveClass_Index[classname];
                group = "ARCHIVE";
            } else if (CACHE.DYNAMIC.GlobalClass__Index[classname]) {
                index = CACHE.DYNAMIC.GlobalClass__Index[classname];
                group = "GLOBAL";
            } else if (CACHE.DYNAMIC.PublicClass__Index[classname]) {
                index = CACHE.DYNAMIC.PublicClass__Index[classname];
                group = "PUBLIC";
            }
        } else if (localmap[classname]) {
            index = localmap[classname];
            group = "LOCAL";
        }
        return { index, group };
    },
    DECLARE: (object: TYPE.ClassData) => {
        object.index = INDEX._BIN.values().next().value || ++INDEX._NOW;
        if (INDEX._BIN.has(object.index)) { INDEX._BIN.delete(object.index); }

        const encounted = USE.string.enCounter(object.index + 768);
        object.watchclass = "____" + encounted;
        CACHE.DYNAMIC.Index_ClassData[object.index] = object;
        return { index: object.index, class: object.watchclass };
    },
    DISPOSE: (...indexes: number[]) => {
        indexes.forEach((index) => {
            if (index > 0) {
                INDEX._BIN.add(index);
                delete CACHE.DYNAMIC.Index_ClassData[index.toString()];
            }
        });
    },
    RESET: (after = 0) => {
        after = after > 0 ? after : 0;
        let removed = 0;
        Object.keys(CACHE.DYNAMIC.Index_ClassData).forEach((index) => {
            const number = Number(index);
            if (number > after) {
                if (INDEX._BIN.has(number)) { INDEX._BIN.delete(number); }
                delete CACHE.DYNAMIC.Index_ClassData[number];
                removed++;
            }
        });
        INDEX._NOW = after;
        return removed;
    }
};