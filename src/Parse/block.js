import U from "./Utils/index.js"

const stash = {};
const index = {};

const OPEN_CHARS = ['{', '[', '('];
const CLOSE_CHARS = ['}', ']', ')'];
const QUOTE_CHARS = ['`', "'", '"'];

export default function parseBlock(content) {
    content += ';'
    let keyStart = 0,
        valStart = 0,
        deviance = 0,
        quote = '',
        key = '',
        isProp = true,
        length = content.length;

    let properties = {
        adds: [],
        binds: [],
        preBinds: [],
        postBinds: [],
        variables: [],
        atProps: {},
        atRules: {},
        nested: {},
        blocks: {},
        classes: {},
        properties: {},
    };

    for (let index = 0; index < length; index++) {
        const ch = content[index];
        if (ch === '\\') {
            index++;
            continue;
        }
        if (QUOTE_CHARS.includes(ch)) {
            if (quote === '') {
                quote = ch;
            } else if (quote === ch) {
                quote = ''
            }
        }

        if (quote === '') {
            if (CLOSE_CHARS.includes(ch)) deviance--;

            if (deviance === 0) {
                switch (ch) {
                    case '{': isProp = false;
                    case ':':
                        key = U.string.minify(content.slice(keyStart, index));
                        valStart = index + 1;
                        break;
                    case '}':
                    case ';':
                        const value = U.string.minify(content.slice(valStart, index));
                        if (isProp) {
                            if (key.length > 0) {
                                if (key.startsWith("--"))
                                    properties.variables.push(key);
                                properties.properties[key] = value;
                            } else if (value[0] === '@') {
                                const spaceIndex = value.indexOf(" ")
                                const directive = value.slice(0, spaceIndex);
                                switch (directive) {
                                    case "@bind":
                                        properties.binds.push(...U.string.breaks(value.slice(spaceIndex)));
                                        break;
                                    case "@post-bind":
                                        properties.preBinds.push(...U.string.breaks(value.slice(spaceIndex)));
                                        break;
                                    case "@pre-bind":
                                        properties.postBinds.push(...U.string.breaks(value.slice(spaceIndex)));
                                        break;
                                    case "@adds":
                                        properties.adds.push(...U.string.breaks(value.slice(spaceIndex)));
                                        break;
                                    default:
                                        properties.atProps[directive] = value.slice(spaceIndex + 1);
                                }
                            } else {
                                const breaks = U.string.breaks(value);
                                const groupMap = { "<": "preBinds", ">": "postBinds", "+": "adds", "*": "binds" };
                                const group = groupMap[breaks[0]] || "adds";
                                if (Object.keys(groupMap).includes(breaks[0])) breaks.shift();
                                breaks.forEach(link => {
                                    const targetGroup = groupMap[link[0]] || group;
                                    properties[targetGroup].push(link[0] in groupMap ? link.slice(1) : link);
                                });
                            }
                        } else {
                            switch (key[0]) {
                                case "@":
                                    properties.atRules[key] = value;
                                    break;
                                case "&":
                                    properties.nested[key] = value;
                                    break;
                                case ".":
                                    if (U.identity.ClassName !== "")
                                        properties.classes[key] = value;
                                default:
                                    properties.blocks[key] = value;
                            }
                        }
                        keyStart = index + 1;
                        valStart = index + 1;
                        key = '';
                        isProp = true;
                }
            }

            if (OPEN_CHARS.includes(ch)) deviance++;
        }
    }

    return properties;
}

function xtylemerge(classList, nested = true) {
    function deepMerge(target, source, includeInnerObjects = true) {
        if (!source || typeof source !== 'object') return target;

        for (const key in source) {
            const sourceValue = source[key];
            if (sourceValue === undefined) continue;

            const targetValue = target[key];

            if (includeInnerObjects &&
                targetValue &&
                sourceValue &&
                typeof targetValue === 'object' &&
                typeof sourceValue === 'object' &&
                !Array.isArray(targetValue)) {
                target[key] = deepMerge(targetValue, sourceValue);
            } else {
                target[key] = sourceValue;
            }
        }

        return target;
    }
    const result = {};
    for (const className of classList) {
        if (stash[className])
            deepMerge(result, stash[className].style, nested);
    }
    return result;
};

function read(content, depth = 0, startIt = true) {
    const properties = parseBlock(content);

    const variables = properties.variables;
    const binds = properties.binds;
    const preBinds = properties.preBinds;
    const postBinds = properties.postBinds;
    const styles = xtylemerge(styles.mixins);

    return { variables, binds, preBinds, postBinds, styles}
}

function parse({ content, idFront, metaFront, pathString }, nested) {
    const response = {};
    const extracts = read(content);

    for (const key in extracts.classes) {
        const modKey = key.slice(1);
        if (extracts.classes.hasOwnProperty(key)) {
            const styles = read(extracts.classes[key]);
            const nests = nested ? Object.fromEntries(
                Object.entries(styles.nested).map(([key, value]) => {
                    const nest = read(value)
                    return [key, {
                        ...xtylemerge(nest.mixins, false),
                        ...Object.entries(nest.properties).reduce((acc, [propKey, propValue]) => {
                            acc[propKey] = `${propValue} /* ${key} @ ${pathString} */`;
                            return acc;
                        }, {})
                    }]
                })
            ) : {};
            index[++counter] = idFront + modKey;
            response[index[counter]] = {
                preBinds: styles.preBinds,
                postBinds: styles.postBinds,
                selector: key,
                index: counter,
                metaClass: metaFront + modKey,
                style: {
                    ...xtylemerge(styles.mixins, nested),
                    ...Object.entries(styles.properties).reduce((acc, [propKey, propValue]) => {
                        acc[propKey] = `${propValue} /* ${pathString} :: ${key} */`;
                        return acc;
                    }, {}), ...nests
                }
            };
        }
    }

    for (const rule in extracts.atRrules) {
        const modKey = U.string.normalize(rule);
        if (extracts.atRrules.hasOwnProperty(rule)) {
            const styles = read(extracts.atRrules[rule])
            const nests = Object.fromEntries(
                Object.entries(styles.blocks).map(([key, value]) => {
                    const nest = read(value)
                    return [key, {
                        ...xtylemerge(nest.mixins, false),
                        ...Object.entries(nest.properties).reduce((acc, [propKey, propValue]) => {
                            acc[propKey] = `${propValue} /* ${pathString} :: ${rule} */`;
                            return acc;
                        }, {})
                    }]
                })
            );
            response[idFront + modKey] = {
                preBinds: styles.preBinds,
                postBinds: styles.postBinds,
                selector: rule,
                index: 0,
                metaClass: metaFront + modKey,
                style: {
                    ...xtylemerge(styles.mixins, nested),
                    ...Object.entries(styles.properties).reduce((acc, [propKey, propValue]) => {
                        acc[propKey] = `${propValue} /* ${pathString} :: ${rule} */`;
                        return acc;
                    }, {}),
                    ...(nested ? nests : {})
                }
            };
        }
    }

    return response;
};