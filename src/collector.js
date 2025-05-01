import cleaner from "./cleaner.js";
import Utils from "./Utils/index.js";

const NON_ALPHANUMERIC_EXCEPT_SLASH = /[^a-z0-9/\\]/gi;
const LIB_CHARSET = /[^\w-]/gi;
const SLASH = /[/\\]/g;

function libFinder(filePath, content, prefix = false) {

    let [extension, fileName, level, library] = filePath.slice(filePath.lastIndexOf("/") + 1).split(".").reverse()
    level = (isNaN(level) || level < 0) ? 0 : parseInt(level, 10);

    const axiom = !Boolean(library);
    const stamp = level === 0 ? "" : (library ?? "".replace(LIB_CHARSET, '-')) + "$".repeat(level)
    const normalPath = filePath.replace(NON_ALPHANUMERIC_EXCEPT_SLASH, '-').replace(SLASH, '_');

    return {
        level,
        axiom,
        data: {
            stamp,
            fileName,
            extension,
            filePath,
            metaFront: (prefix ? `${axiom ? "AXIOM-level" : "LEVEL"}-${level}` + ((library ?? "").length > 0 ? `_${library}` : ``) : "") + `__${normalPath}__`,
            content: cleaner.uncomment.Css(content),
        },
    }
}

export default {
    css: (filesArray) => {
        const list = {}, index = { axiom: {}, library: {} };
        let length = 0;

        Object.keys(filesArray).forEach(filePath => {
            const lib = libFinder(filePath, filesArray[filePath], true);
            const { level, axiom } = lib;
            const group = axiom ? "axiom" : "library";

            list[filePath] = {group, level};
            if (!index[group][level]) index[group][level] = [];
            index[group][level].push(lib.data);

            if (level > length) length = level;
        });

        return {
            list,
            axiom: Utils.array.formNumberedObject(index.axiom, length),
            library: Utils.array.formNumberedObject(index.library, length)
        };
    },
    files: (filesArray) => {
        const response = [];
        Object.keys(filesArray).forEach(filePath => {
            response.push(libFinder(filePath, filesArray[filePath], false).data);
        })
        return response
    }
}