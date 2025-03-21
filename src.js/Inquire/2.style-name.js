import { currentCrumb, classCounter } from '../0.env.js';

const enCounter = (number) => {
    const digits = "0123456789abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-";
    const base = digits.length;

    if (number === 0) return "0";

    let result = "", num = number;
    while (num > 0) {
        result = digits[num % base] + result;
        num = Math.floor(num / base);
    }
    return result;
};

export default function generateStyleName(string) {
    let length = string.length,
        prefix = '',
        op = '',
        suffix = '',
        state = 0; // 0: prefix, 1: op, 2: suffix

    for (let i = 0; i < length; i++) {
        const ch = string[i];
        const normalizedCh = /[a-z0-9$]/i.test(ch) ? ch : '-';

        if (state === 0) {
            if (normalizedCh === '$') {
                op += normalizedCh;
                state = 1;
                continue
            } else prefix += normalizedCh;
        }
        if (state === 1) {
            state = 2;
            if (normalizedCh === '$' & prefix === '') {
                op += normalizedCh;
                continue
            }
        }
        if (state === 2) {
            suffix += normalizedCh === '$' ? '-' : normalizedCh;
        }
    }

    if (op === '$') prefix = (prefix === '') ? 'local' : `${prefix}-lib`;
    else if (op === '$$') prefix = 'global'

    suffix = (suffix === '') ? '' : `__${suffix}`;

    return (`${prefix}_${enCounter(classCounter++)}__${currentCrumb}${suffix}`)
}

// console.log('$' + '\n' + nameXtyle('$') + '\n')
// console.log('$one' + '\n' + nameXtyle('$one') + '\n')
// console.log('l$hik$s' + '\n' + nameXtyle('l$hik$s') + '\n')
// console.log('g$hellBros' + '\n' + nameXtyle('g$hellBros') + '\n')
// console.log('$$$$' + '\n' + nameXtyle('$$$$') + '\n')
// console.log('tw$$' + '\n' + nameXtyle('tw$$') + '\n')
// console.log('$$flex' + '\n' + nameXtyle('$$flex') + '\n')
// console.log('tw$$dbug' + '\n' + nameXtyle('tw$$dbug') + '\n')