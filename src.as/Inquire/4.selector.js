import inscribeProxy from './1.style-proxy.js'

export default function renderSelector(string) {
    const length = string.length;
    const response = [];

    for (let i = 0; i < length; i++) {
        const ch = string[i];
        if (ch === '{') {
            if (i + 1 < string.length && string[i + 1] !== ':') response.push(' ');
        } else if (ch !== '}') {
            response.push(ch);
        }
    }

    return inscribeProxy(response.join(''));
}

// const OPEN_BRACE_NOT_COLON = /{([^:])/g;
// const CLOSE_BRACE = /}/g;
// export default function renderNestedSelector(string) {
//     return string.replace(OPEN_BRACE_NOT_COLON, ' {$1')
//         .replace(CLOSE_BRACE, '');
// }

console.log(renderSelector(':hover'))
console.log(renderSelector('{::placeholder h:hover}'))
console.log(renderSelector('{:active placeholder h:hover}'))
console.log(renderSelector(':{a}'))
