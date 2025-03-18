const NON_ALPHANUMERIC_EXCEPT_SLASH = /[^a-z0-9/]/gi;
const SLASH = /\//g;

function normalize (string) {
    return string.replace(NON_ALPHANUMERIC_EXCEPT_SLASH, '-').replace(SLASH, '_')
}

function minify(string) {

    const length = string.length;
    const result = [];
    let lastCh = ' ';

    for (let i = 0; i < length; i++) {
        const ch = (string[i] === '\n') ? ' ' : string[i];

        if (ch === ' ' && lastCh !== ' ') {
            result.push(ch);
        } else if (ch !== ' ') {
            result.push(ch);
        }
        lastCh = ch;
    }
    if (result.length > 0 && lastCh === ' ') {
        result.pop();
    }
    return result.join('');
}
function breaks(string) {
    const length = string.length;
    const result = [];
    let start = 0;

    for (let i = 0; i < length; i++) {
        const ch = string[i];

        if (ch === ' ' || ch === '\n' || ch === ',') {
            if (i > start) {
                result.push(string.substring(start, i));
            }
            start = i + 1;
        }
    }

    if (length > start) {
        result.push(string.substring(start, length));
    }

    return result;
}

export default {
    normalize,
    minify,
    breaks
}

// const string = '  g f,d,, \n ghd  gfhsd ghn  g'
// console.log(minify(string) + '4');
// console.log(breaks(string));