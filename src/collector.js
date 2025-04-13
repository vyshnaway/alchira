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

function libFinder(pathString, noGroup = false) {
    let
        marker = pathString.length,
        scanning = true,
        endMarker = pathString.length;

    while (scanning) {
        const char = pathString[--marker]
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
        groupFinder(pathString.substring(marker, endMarker), pathString.substring(endMarker)) :
        { type: "", stamp: "" };
    const normalPath = pathString.replace(NON_ALPHANUMERIC_EXCEPT_SLASH, '-').replace(SLASH, '_');
    const library = pathString.substring(marker, endMarker).replace(LIB_CHARSET, '-');

    return {
        group: group.type,
        response: {
            library: (group.stamp === "") ? "" :
                pathString.substring(marker, endMarker) + group.stamp,
            path: pathString,
            meta: (library === "" || group.stamp === "") ?
                `${group.type}__${normalPath}__` :
                `${group.type}_${library}__${normalPath}__`
        },
    }
}

export default {
    css: (filesArray) => {
        const response = {
            atomic: [],
            micros: [],
            macros: [],
            compose: [],
            composite: [],
        }

        filesArray.forEach(filePath => {
            const lib = libFinder(filePath);
            response[lib.group].push(lib.response)
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