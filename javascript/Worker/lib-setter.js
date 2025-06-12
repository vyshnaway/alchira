import Utils from "../Utils/index.js";
import cleaner from "./cleaner.js";

export default function libSetter(target, source, filePath, content, prefix = false, uncomment = false, isPortable = false) {
    const targetPath = target.length ? (target + "/" + filePath) : filePath;
    const sourcePath = source.length ? (source + "/" + filePath) : filePath;

    let [extension, fileName, id, cluster] = targetPath.slice(targetPath.lastIndexOf("/") + 1).split(".").reverse()
    id = (isNaN(id) || id < 0) ? 0 : parseInt(id, 10);

    const group = isPortable ? (extension === "css" ? "BINDING" : "PORTABLE") : (Boolean(cluster) ? "CLUSTER" : "AXIOM");
    const stamp = isPortable ? (Utils.string.normalize(fileName) + (group === "BINDING" ? "//" : "/")) :
        id === 0 ? "" : (Utils.string.normalize(cluster) + "$".repeat(id));
    const normalPath = Utils.string.normalize(targetPath, [], [], ["/", "."]);

    return {
        id,
        group,
        stamp,
        fileName,
        extension,
        filePath,
        targetPath,
        sourcePath,
        usedIndexes: new Set(),
        metaFront: `${prefix ? group : ""}\\|${normalPath}`,
        content: uncomment ? cleaner.uncomment.Css(content) : content,
    }
}