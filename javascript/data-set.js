import Use from "./Utils/index.js";
import { APP, RAW, NAV, ROOT, CACHE, STACK, PUBLISH } from "./data-cache.js";


export function SetENV(rootPath, workPath, packageJson) {

    APP.name = packageJson.name;
    APP.version = packageJson.version;
    APP.website = packageJson.website;
    APP.command = packageJson.command;

    RAW.RootPath = rootPath + "/";
    RAW.WorkPath = workPath + "/";

    Object.entries(NAV).forEach(([groupName, groupPaths]) => {
        if (groupName === "blueprint") {
            Object.entries(groupPaths).forEach(([pathId, pathString]) => {
                groupPaths[pathId] = RAW.RootPath + pathString;
            });
        } else {
            Object.entries(groupPaths).forEach(([pathId, pathString]) => {
                groupPaths[pathId] = RAW.WorkPath + pathString;
            });
        }
    });

    const VersionSpecificCDN = APP.cdn + "version/" + packageJson.version.split(".")[1] + "/";
    Object.entries(ROOT).forEach(([group, object]) => {
        const CDN = group === "PREFIX" ? APP.cdn : VersionSpecificCDN;
        Object.values(object).forEach((entry) => {
            entry.url = CDN + entry.url;
            entry.path = RAW.RootPath + entry.path;
        })
    });
}

export function MemoryUsage() {
    const chart = {
        Files: Use.string.stringMem(JSON.stringify(RAW)),
        Cache: Use.string.stringMem(JSON.stringify(CACHE)),
        Stack: Use.string.stringMem(JSON.stringify(STACK)),
        Report: Use.string.stringMem(JSON.stringify(PUBLISH)),
        Proxy: Object.values(STACK.PROXYCACHE).reduce((t, c) => t += Use.string.stringMem(JSON.stringify(c)), 0),
    }
    chart["Total"] = Object.values(chart).reduce((a, i) => a += i, 0).toFixed(2);
    return Object.entries(chart).map(([k, v]) => `${k} : ${v} Kb`);
}

export const INDEX = {
    _NOW: 0,
    _BIN: new Set(),
    STYLE: (index = 0) => {
        return CACHE.Index2StylesObject[index];
    },
    CLONE: (index = 0) => {
        if (INDEX._BIN.size > 0) {
            object.index = INDEX._BIN.values().next().value;
            INDEX._BIN.delete(object.index);
        } else { object.index = ++INDEX._NOW; }

        object.class = "_" + Use.string.enCounter(object.index + 768);
        CACHE.Index2StylesObject[object.index] = CACHE.Index2StylesObject[index];
        return { index: object.index, class: object.class };
    },
    DECLARE: (object = {}) => {
        if (INDEX._BIN.size > 0) {
            object.index = INDEX._BIN.values().next().value;
            INDEX._BIN.delete(object.index);
        } else { object.index = ++INDEX._NOW; }

        object.class = "_" + Use.string.enCounter(object.index + 768);
        CACHE.Index2StylesObject[object.index] = object;
        return { index: object.index, class: object.class };
    },
    DISPOSE: (...indexes) => {
        indexes.forEach((index) => {
            if (index > 0) {
                INDEX._BIN.add(index);
                delete CACHE.Index2StylesObject[index.toString()];
            }
        });
    },
    RESET: (after = 0) => {
        after = after > 0 ? after : 0;
        let removed = 0;
        Object.keys(CACHE.Index2StylesObject).forEach((index) => {
            const number = Number(index);
            if (number > after) {
                if (INDEX._BIN.has(number)) INDEX._BIN.delete(number)
                delete CACHE.Index2StylesObject[index];
                removed++;
            }
        });
        INDEX._NOW = after;
        return removed;
    }
};