import { classTable, currentFile } from "../src.js/appenv.js";

const VALID_CHARS = /[\$a-z0-9-_]/i;

export default function loadStyleProxy(input) {
    if (typeof input !== 'string') return '';

    const result = [];
    let buffer = '';

    const currentScope = classTable[currentFile]?.className ?? {};
    const fallbackScope = classTable['']?.className ?? {};

    for (const char of input) {
        if (VALID_CHARS.test(char)) {
            buffer += char;
        } else {
            if (buffer) {
                result.push(currentScope[buffer] ?? fallbackScope[buffer] ?? buffer);
                buffer = '';
            }
            result.push(char);
        }
    }

    if (buffer) {
        result.push(currentScope[buffer] ?? fallbackScope[buffer] ?? buffer);
    }

    return result.join('');
}

// console.log(loadXtyleProxy('a$th.$$[$jix]$jx') + ';l')