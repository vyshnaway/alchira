import extract from './1.extract.js';
import U from '../../Utils/package.js'
import I from '../../Inquire/package.js'

const OPEN_CHARS = ['{', '[', '('];
const CLOSE_CHARS = ['}', ']', ')'];
const QUOTE_CHARS = ['`', "'", '"'];

export default function parseCssToObject(string, refs = true, props = true, nests = true, flats = true, rules = true) {
    string += ';'
    let keyStart = 0,
        valStart = 0,
        deviance = 0,
        quote = '',
        key = '',
        isProp = true,
        length = string.length;

    let properties = {
        refs: [], props: {}, nests: {}, flats: {}, rules: {}
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
                                if (key[0] === '&' && nests)
                                    properties.nests[I.classProxy(key)] = parseCssToObject(value).props;
                                if (key[0] === '@' && rules)
                                    properties.rules[key] = parseCssToObject(value).props;
                                else if (key[0] !== '@' && flats) {
                                    const keyFrame = extract.keyFrame(key);
                                    if (keyFrame !== '') properties.flats[keyFrame] = parseCssToObject(value).props;
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
    properties.refs = I.classList(properties.refs)
    return properties;
}

// const string = `
// prop1: val1;
// prop3: val3;
// 222% {
//     prop4 : hinokin;
//     props4 : hinokins4;
// }
// @applay hg;
// &:media gh {
//     prop4 : 'hinokin';
//     prop43 : 'hinokin';
//     @applay hg;
// };
// @:hover {
//     prop4 : 'hinokin';
//     prop43 : 'hinokin';
//     @applay hg;
// a b csd;
// };
// a b csd;
// gha b csd;
// `

// console.log(JSON.stringify(fn(string), ' ', 4))