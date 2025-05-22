import cleaner from "./cleaner.js";

const NON_ALPHANUMERIC_EXCEPT_SLASH = /[^a-z0-9/\\]/gi;
const LIB_CHARSET = /[^\w-]/gi;
const SLASH = /[/\\]/g;

export default function libFinder(target, source, filePath, content, prefix = false, uncomment = false) {
    const targetPath = target + "/" + filePath;
    const sourcePath = source + "/" + filePath;

    let [extension, fileName, level, library] = targetPath.slice(targetPath.lastIndexOf("/") + 1).split(".").reverse()
    level = (isNaN(level) || level < 0) ? 0 : parseInt(level, 10);

    const axiom = !Boolean(library);
    const stamp = level === 0 ? "" : (library ?? "".replace(LIB_CHARSET, '-')) + "$".repeat(level)
    const normalPath = targetPath.replace(NON_ALPHANUMERIC_EXCEPT_SLASH, '-').replace(SLASH, '_');

    return {
        level,
        axiom,
        data: {
            stamp,
            fileName,
            filePath,
            extension,
            targetPath,
            sourcePath,
            usedIndexes: new Set(),
            metaFront: (prefix ? `${axiom ? "AXIOM-level" : "LEVEL"}-${level}` + ((library ?? "").length > 0 ? `_${library}` : ``) : "") + `__${normalPath}_`,
            content: uncomment ? cleaner.uncomment.Css(content) : content,
        },
    }
}