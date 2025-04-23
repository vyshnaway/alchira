import read from "./block.js"
import compose from "./compose.js"
import U from "./Utils/index.js"

const stash = {};
const index = {};
let counter = 0;

function xtylemerge(classList, nested) {
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

function parse({ content, idFront, metaFront, pathString }, nested) {
    const response = {};
    const extracts = read(content);

    for (const key in extracts.classes) {
        const modKey = key.slice(1);
        if (extracts.classes.hasOwnProperty(key)) {
            const styles = read(extracts.classes[key]);
            const nests = nested ? Object.fromEntries(
                Object.entries(styles.nests).map(([key, value]) => {
                    const nest = read(value)
                    return [key, {
                        ...xtylemerge(nest.mixins, false),
                        ...Object.entries(nest.props).reduce((acc, [propKey, propValue]) => {
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
                    ...Object.entries(styles.props).reduce((acc, [propKey, propValue]) => {
                        acc[propKey] = `${propValue} /* ${key} @ ${pathString} */`;
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
                Object.entries(styles.flats).map(([key, value]) => {
                    const nest = read(value)
                    return [key, {
                        ...xtylemerge(nest.mixins, false),
                        ...Object.entries(nest.props).reduce((acc, [propKey, propValue]) => {
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
                    ...Object.entries(styles.props).reduce((acc, [propKey, propValue]) => {
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

export default {
    READER: (sources = [], nested) => {
        const styles = {}
        sources.forEach(source => {
            const result = parse(source, nested);
            for (const key in result) {
                styles[key] = result[key]
            }
        })
        for (const key in styles) {
            stash[key] = styles[key]
        }
        return Object.keys(stash);
    },
    RENDER: (content) => compose(Object.values(parse({ content }, true)).reduce((A, I) => {
        A[I.selector] = I.style;
        return A
    }, {}))
}