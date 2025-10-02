// import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";
import PATH from "path";
import FILEMAN from "../fileman.js";
import * as CACHE from "./cache.js";
export async function cssImport(filePathArray = []) {
    const resolvedFiles = new Set(filePathArray.map((filePath) => FILEMAN.path.resolves(filePath)));
    async function inlineImports(filePath) {
        const baseDir = PATH.dirname(filePath);
        let content = (await FILEMAN.read.file(filePath)).data;
        const importRegex = /@import\s+(?:url\()?["']?(.*?)["']?\)?\s*;/g;
        for (const [fullMatch, importPath] of content.matchAll(importRegex)) {
            const absoluteImportPath = PATH.resolve(baseDir, importPath);
            const replacement = resolvedFiles.has(absoluteImportPath)
                ? ""
                : await inlineImports(absoluteImportPath);
            content = content.replace(fullMatch, replacement);
            resolvedFiles.add(absoluteImportPath);
        }
        return content;
    }
    const inlined = [...resolvedFiles].map((i) => inlineImports(i));
    return inlined.join("");
}
export async function proxyMapDependency(proxyMap = [], xtylesDirectory) {
    const warnings = [];
    const notifications = [];
    await Promise.all(proxyMap.map(async (map, index) => {
        if (!FILEMAN.path.isIndependent(map.source, map.target)) {
            warnings.push(`[${index}]:source::"${map.source}" & [${index}]:target::"${map.target}" are not independent.`);
        }
        if (!FILEMAN.path.isIndependent(map.source, xtylesDirectory)) {
            warnings.push(`[${index}]:source::"${map.source}" should not dependent on "${xtylesDirectory}".`);
        }
        if (!FILEMAN.path.isIndependent(xtylesDirectory, map.target)) {
            warnings.push(`[${index}]:target::"${map.target}" should not be dependent on "${xtylesDirectory}".`);
        }
        if (FILEMAN.path.ifFolder(map.source)) {
            const targetStat = FILEMAN.path.available(map.target);
            if (targetStat.type === "file") {
                warnings.push(`[${index}]:"${map.target}" expected folder instead of file.`);
            }
            else {
                if (!targetStat.exist) {
                    await FILEMAN.clone.safe(map.source, map.target);
                    notifications.push(`[${index}]:"${map.target}" cloned from [${index}]:"${map.source}"`);
                }
                const sourceStylesheetExists = FILEMAN.path.ifFile(FILEMAN.path.join(map.source, map.stylesheet));
                const targetStylesheetExists = FILEMAN.path.ifFile(FILEMAN.path.join(map.target, map.stylesheet));
                if (!sourceStylesheetExists) {
                    warnings.push(`[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.source}" folder.`);
                }
                if (!targetStylesheetExists) {
                    warnings.push(`[${index}]:stylesheet::"${map.stylesheet}" file not found in "${map.target}" folder.`);
                }
            }
        }
        else {
            warnings.push(`[${index}]:"${map.source}" folder not found.`);
        }
    }));
    for (let i = 0; i < proxyMap.length; i++) {
        for (let j = i + 1; j < proxyMap.length; j++) {
            if (FILEMAN.path.isIndependent(proxyMap[i].source, proxyMap[j].source) ||
                FILEMAN.path.isIndependent(proxyMap[j].target, proxyMap[i].target)) {
                warnings.push(`[${i}]:target::"${proxyMap[i].target}" & [${j}]:source::"${proxyMap[j].source}" are not independent.`);
            }
            if (FILEMAN.path.isIndependent(proxyMap[i].source, proxyMap[j].target) ||
                FILEMAN.path.isIndependent(proxyMap[i].target, proxyMap[j].source)) {
                warnings.push(`[${i}]:source::"${proxyMap[i].source}" & [${j}]:target::"${proxyMap[j].target}" are not independent.`);
            }
        }
    }
    return { warnings, notifications };
}
export async function proxyMapSync(proxyMaps = []) {
    const ProxyMapStatic = proxyMaps.reduce((acc, map) => {
        acc[map.target] = {
            ...map,
            fileContents: {},
            stylesheetContent: ''
        };
        return acc;
    }, {});
    await Promise.all(Object.values(ProxyMapStatic).map(async (map) => {
        map.extensions[CACHE.ROOT.extension] = [];
        const syncResult = await FILEMAN.sync.bulk(map.target, map.source, Object.keys(map.extensions), [CACHE.ROOT.extension], [map.stylesheet]);
        if (syncResult.status) {
            map.fileContents = syncResult.fileContents;
            map.stylesheetContent = (await FILEMAN.read.file(FILEMAN.path.join(map.target, map.stylesheet))).data;
        }
    }));
    return ProxyMapStatic;
}
//# sourceMappingURL=verify.js.map