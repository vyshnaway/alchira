const NON_ALPHANUMERIC_AND_US = /[^a-z0-9_]/gi;
const SPACE = /\s/g;

export default {
    normalize: (string) => {
        return string.replace(SPACE, '_').replace(NON_ALPHANUMERIC_AND_US, '-')
    },
    minify: (string) => {
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
    },
    breaks: (string) => {
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
}