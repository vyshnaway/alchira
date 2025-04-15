import U from "./Utils/index.js"

function xtylemerge(classList, blocks = true) {
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
        deepMerge(result, styleBlocks[className], blocks);
    }
    return result;
}

const OPEN_CHARS = ['{', '[', '('];
const CLOSE_CHARS = ['}', ']', ')'];
const QUOTE_CHARS = ['`', "'", '"'];

export default function parseCssToObject(string, refs = true, props = true, nests = true, flats = true, rules = true, classes = true) {
    string += ';'
    let keyStart = 0,
        valStart = 0,
        deviance = 0,
        quote = '',
        key = '',
        isProp = true,
        length = string.length;

    let properties = {
        refs: [], props: {}, nests: {}, flats: {}, rules: {}, classes: {}
    };

    for (let index = 0; index < length; index++) {
        const ch = string[index];
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
                        key = U.string.minify(string.slice(keyStart, index));
                        valStart = index + 1;
                        break;
                    case '}':
                    case ';':
                        const value = U.string.minify(string.slice(valStart, index));
                        if (key !== '') {
                            if (!isProp) {
                                switch (key[0]) {
                                    case "@":
                                        if (rules) {
                                            properties.rules[key] = parseCssToObject(value).props;
                                        }
                                        break;
                                    case "&":
                                        if (nests) {
                                            properties.nests[key] = parseCssToObject(value).props;
                                        }
                                        break;
                                    case ".":
                                        if (classes && U.identity.ClassName !== "") {
                                            properties.classes[key] = parseCssToObject(value).props;
                                            break;
                                        }
                                    default:
                                        if (flats)
                                            properties.flats[key] = parseCssToObject(value).props;
                                        break;
                                }
                            } else if (key[0] !== '@' && props) properties.props[key] = value;
                        } else if (isProp) {
                            if (value[0] === '@' && props) properties.props[value] = '';
                            else if (refs) properties.refs.push(...U.string.breaks(value));
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
    // properties.refs = INQUIRE.classList(properties.refs)
    return properties;
}
