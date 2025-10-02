import USE from "../utils/main.js";
import FILEMAN from "../fileman.js";
import * as CACHE from "./cache.js";
function collectTypeStringKeys(object) {
    return Object.entries(object).reduce((A, [K, V]) => {
        if (typeof V === "object") {
            collectTypeStringKeys(V).forEach(k => A.add(k));
        }
        else {
            A.add(K);
        }
        return A;
    }, new Set());
}
export function setVendors() {
    CACHE.ROOT.vendors = Array.from(collectTypeStringKeys(CACHE.STATIC.Prefix));
}
export function setTWEAKS(tweaks) {
    Object.assign(CACHE.STATIC.Tweaks, CACHE.ROOT.Tweaks);
    if (typeof tweaks === "object") {
        Object.keys(CACHE.STATIC.Tweaks).forEach(key => {
            if (typeof CACHE.STATIC.Tweaks[key] === typeof tweaks[key]) {
                CACHE.STATIC.Tweaks[key] = tweaks[key];
            }
        });
    }
    ;
}
export function SetENV(rootPath, workPath, packageEssential) {
    CACHE.STATIC.RootPath = rootPath;
    CACHE.STATIC.WorkPath = workPath;
    CACHE.ROOT.name = packageEssential.name || CACHE.ROOT.name;
    CACHE.ROOT.version = packageEssential.version || CACHE.ROOT.version;
    CACHE.ROOT.bin = packageEssential.bin;
    Object.entries(CACHE.PATH).forEach(([groupName, groupPaths]) => {
        if (groupName === "blueprint") {
            Object.values(groupPaths).forEach((source) => {
                source.path = FILEMAN.path.join(CACHE.STATIC.RootPath, ...source.frags);
            });
        }
        else {
            Object.values(groupPaths).forEach((source) => {
                source.path = FILEMAN.path.join(...source.frags);
            });
        }
    });
    Object.entries(CACHE.SYNC).forEach(([_, groupPaths]) => {
        Object.values(groupPaths).forEach((source) => {
            source.path = FILEMAN.path.join(CACHE.STATIC.RootPath, ...source.frags);
        });
    });
    const CDN = CACHE.ROOT.url.Cdn + "version/" + CACHE.ROOT.version.split(".")[0] + "/";
    Object.values(CACHE.SYNC).forEach((object) => {
        Object.values(object).forEach((entry) => {
            entry.url = CDN + entry.url;
            entry.path = FILEMAN.path.join(CACHE.STATIC.RootPath, ...entry.frags);
        });
    });
}
export function GetCacheUsage() {
    const chart = {
        "Sync": USE.string.stringMem(JSON.stringify(CACHE.SYNC)),
        "Path": USE.string.stringMem(JSON.stringify(CACHE.PATH)),
        "Root": USE.string.stringMem(JSON.stringify(CACHE.ROOT)),
        "Delta": USE.string.stringMem(JSON.stringify(CACHE.DELTA)),
        "Class": USE.string.stringMem(JSON.stringify(CACHE.CLASS)),
        "Files": USE.string.stringMem(JSON.stringify(CACHE.FILES)),
        "Static": USE.string.stringMem(JSON.stringify(CACHE.STATIC)),
        "Proxy": Object.values(CACHE.FILES.TARGETDIR).reduce((t, c) => {
            t += USE.string.stringMem(JSON.stringify(c));
            return t;
        }, 0),
    };
    chart["Total"] = Object.values(chart).reduce((a, i) => a += i, 0);
    return Object.entries(chart).map(([k, v]) => `${k} : ${v.toFixed(2)} Kb`);
}
//# sourceMappingURL=action.js.map