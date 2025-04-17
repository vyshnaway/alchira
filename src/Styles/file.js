import read from "./block.js"
import compose from "./compose.js"
import U from "./Utils/index.js"

const stash = {};
let counter = 64;

const enCounter = () => {
    const digits = "_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-";
    const base = digits.length;

    let result = "", num = ++counter;
    while (num > 0) {
        result = digits[num % base] + result;
        num = Math.floor(num / base);
    }
    return "_" + result;
};

function xtylemerge(classList, nested) {
    function deepMerge(target, source, includeInnerObjects = true, comment = "") {
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
                target[key] = sourceValue + comment;
            }
        }

        return target;
    }
    const result = {};
    for (const className of classList) {
        if (stash[className])
            deepMerge(result, stash[className].style, nested, ` /* FROM ${stash[className].metaName} */`);
    }
    return result;
};

function parse({ content, idFront, metaFront }, nested) {
    const response = {};
    const extracts = read(content);

    for (const key in extracts.classes) {
        const modKey = key.slice(1);
        if (extracts.classes.hasOwnProperty(key)) {
            const styles = read(extracts.classes[key]);
            const nests = nested ? Object.fromEntries(
                Object.entries(styles.nests).map(([key, value]) => {
                    const nest = read(value)
                    return [key, { ...xtylemerge(nest.mixins, false), ...nest.props }]
                })
            ) : {};
            response[idFront + modKey] = {
                preBinds: styles.preBinds,
                postBinds: styles.postBinds,
                selector: key,
                buildClass: enCounter(),
                metaClass: metaFront + modKey,
                style: {
                    ...xtylemerge(styles.mixins, nested),
                    ...styles.props, ...nests
                }
            };
        }
    }

    for (const key in extracts.rules) {
        const modKey = U.string.normalize(key);
        if (extracts.rules.hasOwnProperty(key)) {
            const styles = read(extracts.rules[key])
            const nests = Object.fromEntries(
                Object.entries(styles.flats).map(([key, value]) => {
                    const nest = read(value)
                    return [key, { ...xtylemerge(nest.mixins, false), ...nest.props }]
                })
            );
            response[idFront + modKey] = {
                preBinds: styles.preBinds,
                postBinds: styles.postBinds,
                selector: key,
                buildClass: "___",
                metaClass: metaFront + modKey,
                style: {
                    ...xtylemerge(styles.mixins, nested),
                    ...styles.props,
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
    RENDER: (content) => compose(parse({content}, true)) 
}