import { APP, RAW, NAV, CACHE, INDEX, ROOT, STACK } from "./data-cache.js";

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

export function ResetCACHE() {

    Object.assign(CACHE, {
        HashRule: {},
        SortedIndexes: [],
        PortableEssentials: [],
        Index2StylesObject: {},
        LibraryStyle2Index: {},
        GlobalsStyle2Index: {},
        PortableStyle2Index: {},
        FinalStack: {},
    });

    Object.assign(STACK, {
        PROXYCACHE: {},
        LIBRARIES: {},
        PORTABLES: {},
    });
}

export function ResetALL() {
    Object.assign(RAW, {
        HASHRULE: {},
        PROXYMAP: {},
        LIBRARIES: {},
        PORTABLES: {},
        PROXYFILES: {},
    })

    ResetCACHE();
    INDEX.RESET();
}
