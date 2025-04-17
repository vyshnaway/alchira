import U from "./Utils/index.js"

const OPEN_CHARS = ['{', '[', '('];
const CLOSE_CHARS = ['}', ']', ')'];
const QUOTE_CHARS = ['`', "'", '"'];

export default function parseCssToObject(string, links = true, props = true, nests = true, flats = true, rules = true, classes = true) {
    string += ';'
    let keyStart = 0,
        valStart = 0,
        deviance = 0,
        quote = '',
        key = '',
        linksArray = [],
        isProp = true,
        length = string.length;

    let properties = {
        mixins: [], preBinds: [], postBinds: [], props: {}, nests: {}, flats: {}, rules: {}, classes: {}
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
                                            properties.rules[key] = value;
                                        }
                                        break;
                                    case "&":
                                        if (nests) {
                                            properties.nests[key] = value;
                                        }
                                        break;
                                    case ".":
                                        if (classes && U.identity.ClassName !== "")
                                            properties.classes[key] = value;
                                    default:
                                        if (flats)
                                            properties.flats[key] = value;
                                }
                            } else if (key[0] !== '@' && props) properties.props[key] = value;
                        } else if (isProp) {
                            if (value[0] === '@' && props) properties.props[value] = '';
                            else if (links) {
                                const breaks = U.string.breaks(value);
                                const groupMap = { "<": "preBinds", ">": "postBinds", "+": "mixins" };
                                const group = groupMap[breaks[0]] || "mixins";
                                if (Object.keys(groupMap).includes(breaks[0])) breaks.shift();
                                breaks.forEach(link => {
                                    const targetGroup = groupMap[link[0]] || group;
                                    properties[targetGroup].push(link[0] in groupMap ? link.slice(1) : link);
                                });
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
