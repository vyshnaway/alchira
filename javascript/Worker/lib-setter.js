import { NAV } from "../data-cache.js";
import Utils from "../Utils/index.js";
import cleaner from "./cleaner.js";

export default function libSetter(target, source, filePath, content, isXtylesFolder = false, isPortable = false) {
    const targetPath = target.length ? (target + "/" + filePath) : filePath;
    const sourcePath = source.length ? (source + "/" + filePath) : filePath;

    let [extension, fileName, id, cluster] = targetPath.slice(targetPath.lastIndexOf("/") + 1).split(".").reverse()
    id = (isNaN(id) || id < 0) ? 0 : parseInt(id, 10);

    const group = isPortable ? (extension === "css" ? "binding" : extension === "xcss" ? "portable" : "readme") : (Boolean(cluster) ? "cluster" : "axiom");
    const normalFileName = Utils.string.normalize(fileName);
    const normalFilePath = filePath.slice(0, filePath.length - extension.length - 1);
    const stamp = isPortable ? ("/" + normalFilePath + (group === "binding" ? "/$/" : "/")) :
        id === 0 ? "" : (Utils.string.normalize(cluster) + "$".repeat(id));

    return {
        id,
        group,
        stamp,
        filePath,
        extension,
        sourcePath,
        targetPath: isXtylesFolder ? (isPortable ? NAV.folder.portables : NAV.folder.library) + "/" + targetPath : targetPath,
        metaFront: `${isXtylesFolder ? group.toLocaleUpperCase() : ""}\\|${Utils.string.normalize(targetPath, [], [], ["/", "."])}`,
        content: isXtylesFolder && extension !== "xcss" ? cleaner.uncomment.Css(content) : content,
        fileName: normalFileName,
        usedIndexes: new Set(),
    }
}