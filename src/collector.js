import cleaner from "./cleaner.js";

const NON_ALPHANUMERIC_EXCEPT_SLASH = /[^a-z0-9/\\]/gi;
const LIB_CHARSET = /[^a-z0-9\$-]/gi;
const SLASH = /[/\\]/g;

function groupFinder(head, tail) {
    if (tail.startsWith("$$")) {
        return { type: head ? "composite" : "compose", stamp: "$$" };
    }
    if (tail.startsWith("$")) {
        return { type: head ? "macros" : "micros", stamp: "$" };
    }
    return { type: "atomic", stamp: "" };
}

function libFinder(filePath, content, noGroup = false) {
    let
        marker = filePath.length,
        scanning = true,
        endMarker = filePath.length;

    while (scanning) {
        const char = filePath[--marker]
        if (char === "$")
            endMarker = marker;
        if (!["/", "\\"].includes(char) && endMarker !== 0)
            marker;
        if (["/", "\\"].includes(char)) {
            marker++
            scanning = false;
        }
        if (marker === 0)
            scanning = false;
    }

    const group = (!noGroup) ?
        groupFinder(filePath.substring(marker, endMarker), filePath.substring(endMarker)) :
        { type: "", stamp: "" };
    const normalPath = filePath.replace(NON_ALPHANUMERIC_EXCEPT_SLASH, '-').replace(SLASH, '_');
    const library = filePath.substring(marker, endMarker).replace(LIB_CHARSET, '-');

    return {
        group: group.type,
        response: {
            idFront: (group.stamp === "") ? "" :
                filePath.substring(marker, endMarker) + group.stamp,
            metaFront: (library === "" || group.stamp === "") ?
                `${group.type}__${normalPath}__` : `${library}_${group.type}__${normalPath}__`,
            pathString: filePath ,
            content: cleaner.uncomment.Css(content),
        },
    }
}

export default {
    css: (filesArray) => {
        const response = {
            atomic: { list: [], data: [] },
            micros: { list: [], data: [] },
            macros: { list: [], data: [] },
            compose: { list: [], data: [] },
            composite: { list: [], data: [] },
        }

        Object.keys(filesArray).forEach(filePath => {
            const lib = libFinder(filePath, filesArray[filePath]);
            response[lib.group].list.push(filePath)
            response[lib.group].data.push(lib.response)
        })

        return response;
    },
    files: (filesArray) => {
        const response = {};
        filesArray.forEach(filePath => {
            const lib = libFinder(filePath, true);
            response[lib.response.path] = lib.response.source
        })
        return response
    }
}