import cleaner from "./cleaner.js";

function objectToNumberedArray(obj, length) {
    const arr = new Array(length + 1);

    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            const index = Number(key);
            arr[index] = obj[key] ?? [];
        }
    }
    return arr;
}

const NON_ALPHANUMERIC_EXCEPT_SLASH = /[^a-z0-9/\\]/gi;
const LIB_CHARSET = /[^\w-]/gi;
const SLASH = /[/\\]/g;

function libFinder(filePath, content, useLevel) {

    let [extension, fileName, level, library] = filePath.slice(filePath.lastIndexOf("/") + 1).split(".").reverse()
    level = (isNaN(level) || level < 0) ? 0 : parseInt(level, 10);
    library = library ?? "".replace(LIB_CHARSET, '-');

    const stamp = library + "$".repeat(level)
    const normalPath = filePath.replace(NON_ALPHANUMERIC_EXCEPT_SLASH, '-').replace(SLASH, '_');

    return {
        level,
        data: {
            stamp,
            fileName,
            extension,
            filePath,
            metaFront: (useLevel ? `level-${level}` + (library.length > 0 ? `_${library}` : ``) : "") + `__${normalPath}__`,
            content: cleaner.uncomment.Css(content),
        },
    }
}

export default {
    css: (filesArray) => {
        const list = {}, index = {};
        let length = 0;

        Object.keys(filesArray).forEach(filePath => {
            const lib = libFinder(filePath, filesArray[filePath], true);
            const { level } = lib;

            if (!list[level]) list[level] = [];
            list[level].push(filePath);

            if (!index[level]) index[level] = [];
            index[level].push(lib.data);

            if (level > length) length = level;
        });
        
        return { list, index: objectToNumberedArray(index, length) };
    },
    files: (filesArray) => {
        const response = [];
        Object.keys(filesArray).forEach(filePath => {
            response.push(libFinder(filePath, filesArray[filePath], false).data);
        })
        return response
    }
}