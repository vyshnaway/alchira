import * as _Config from "../type/config.js";
// import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
import * as _Support from "../type/support.js";

import USE from "../utils/main.js";
import FILEMAN from "../fileman.js";

import * as CACHE from "./cache.js";

function collectTypeStringKeys(object: object) {
    return Object.entries(object).reduce((A, [K, V]) => {
        if (typeof V === "object") { collectTypeStringKeys(V).forEach(k => A.add(k)); }
        else { A.add(K); }
        return A;
    }, new Set<string>());
}

export function setVendors() {
    CACHE.ROOT.vendors = Array.from(collectTypeStringKeys(CACHE.STATIC.Prefix));
}

export function setTWEAKS(tweaks: _Config.Tweaks) {
    Object.assign(CACHE.STATIC.Tweaks, CACHE.ROOT.defaultTweaks);
    if (typeof tweaks === "object") {
        Object.keys(CACHE.STATIC.Tweaks).forEach(key => {
            if (typeof CACHE.STATIC.Tweaks[key] === typeof tweaks[key]) {
                CACHE.STATIC.Tweaks[key] = tweaks[key];
            }
        });
    };
}

export function SetENV(rootPath: string, workPath: string, packageEssential: _Support.PackageEssential) {

    CACHE.STATIC.RootPath = rootPath;
    CACHE.STATIC.WorkPath = workPath;

    CACHE.ROOT.name = packageEssential.name || CACHE.ROOT.name;
    CACHE.ROOT.version = packageEssential.version || CACHE.ROOT.version;
    CACHE.ROOT.website = packageEssential.website || CACHE.ROOT.website;
    CACHE.ROOT.bin = packageEssential.bin;

    Object.entries(CACHE.PATH).forEach(([groupName, groupPaths]) => {
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

    Object.entries(CACHE.SYNC).forEach(([_, groupPaths]) => {
        Object.values(groupPaths).forEach((source) => {
            source.path = FILEMAN.path.join(CACHE.STATIC.RootPath, ...source.frags);
        });
    });

    const CDN = CACHE.ROOT.URL.Cdn + "version/" + CACHE.ROOT.version.split(".")[0] + "/";
    Object.values(CACHE.SYNC).forEach((object) => {
        Object.values(object).forEach((entry) => {
            entry.url = CDN + entry.url;
            entry.path = FILEMAN.path.join(CACHE.STATIC.RootPath, ...entry.frags);
        });
    });

    // console.log(CACHE.STATIC);
    // console.log(CACHE.ROOT);
    // console.log(CACHE.SYNC);
}

export function GetCacheUsage(): string[] {
    const chart: Record<string, number> = {
        "Sync": USE.string.stringMem(JSON.stringify(CACHE.SYNC)),
        "Path": USE.string.stringMem(JSON.stringify(CACHE.PATH)),
        "Root": USE.string.stringMem(JSON.stringify(CACHE.ROOT)),
        "Static": USE.string.stringMem(JSON.stringify(CACHE.STATIC)),
        "Delta": USE.string.stringMem(JSON.stringify(CACHE.DELTA)),
        "Class": USE.string.stringMem(JSON.stringify(CACHE.CLASS)),
        "Files": USE.string.stringMem(JSON.stringify(CACHE.FILES)),
        "Proxy": Object.values(CACHE.FILES.TARGET).reduce((t: number, c) => {
            t += USE.string.stringMem(JSON.stringify(c));
            return t;
        }, 0),
    };

    chart["Total"] = Object.values(chart).reduce((a: number, i) => a += i, 0);
    return Object.entries(chart).map(([k, v]) => `${k} : ${v.toFixed(2)} Kb`);
}
