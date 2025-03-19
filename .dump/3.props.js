import U from '../xklaz/Utils/package.js'

export default function fn(string, extra = false) {
    string += ';'
    let isKey = true,
        isVal = false,
        ignore = false,
        isRefs = true,
        keyStart = 0,
        valStart = 0,
        deviance = 0,
        quote = '',
        value = '',
        property = '',
        properties = extra ? { '': [] } : {},
        length = string.length;

    for (let index = 0; index < length; index++) {
        const ch = string[index]
        if (ch === '\\') {
            index++;
            continue;
        }
        if (`\`\'\"`.includes(ch)) {
            if (quote === '') quote = ch;
            else if (quote === ch) quote = '';
        }
        if (quote === '') {
            if (ch === '{') ignore = true;
            if ("{[(".includes(ch)) deviance++;

            if (!deviance) {
                if (isKey) {
                    if ('@' === ch) isRefs = false;
                    else if (':' === ch) {
                        property = U.string.minify(string.substring(keyStart, index));
                        valStart = index + 1;
                        isKey = false;
                        isVal = true;
                    }
                    else if (';' === ch & extra) {
                        if (isRefs) {
                            value = U.string.minify(string.substring(keyStart, index));
                            property = '';
                        } else {
                            property = U.string.minify(string.substring(keyStart, index));
                            value = '';
                        }
                        isRefs = true
                        keyStart = index + 1;
                    }
                } else if (isVal) {
                    if (';'.includes(ch)) {
                        value = U.string.minify(string.substring(valStart, index));
                        keyStart = index + 1;
                        isVal = false;
                        isKey = true;
                    }
                }

                if (';' === ch) {
                    if (!ignore)
                        if (property === '' & extra)
                            properties[property].push(...U.string.breaks(value));
                        else
                            properties[property] = value;
                    ignore = false
                }
            }

            if ("]})".includes(ch)) deviance--;
        }
    }
    return properties
}

// const string =
//     `prop1: val1;
//     prop3: val3;
//     y: url("{ df}");
//     hover {
//         prop4 : hinokin;
//     };
//     @applay hg;
//     a b csd; k h;k;
//     `

// console.log(fn(string, true))