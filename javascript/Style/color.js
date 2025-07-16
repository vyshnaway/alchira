import Utils from "../Utils/main.js";

const bracePair = {
    "{": "}",
    "[": "]",
    "(": ")",
    "'": "'",
    "`": "`",
    '"': '"',
};
const hexints = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    a: 10,
    b: 11,
    c: 12,
    d: 13,
    e: 14,
    f: 15,
};
const openBraces = [
    "[",
    "{",
    "(",
    "'",
    '"',
    "`"
];
const closeBraces = [
    "]",
    "}",
    ")"
];
const palletes = Object.keys(Utils.color.from);

function paletteScanner(
    content,
    marker
) {
    const values = [], braceTrack = [];
    let value = "", awaitBrace = "", ok = true, deviance = 0, ch = content[marker], substring = ch;

    while (ch !== undefined) {
        ch = content[++marker];
        substring += ch;

        if (deviance === 0 && (ch === ")" || ch === "," || ch === " " || ch === '/')) {
            const trimmed = value.trim();
            if (trimmed.length > 0 && ch !== "/") {
                if (!isNaN(Number(trimmed))) {
                    values.push(Number(trimmed));
                } else if (trimmed.endsWith("%") && !isNaN(Number(trimmed.slice(0, -1)))) {
                    values.push(Number(trimmed.slice(0, -1)) / 100);
                } else {
                    ok = false;
                }
            }
            value = "";
        } else {
            value += ch;
        }

        if (deviance === 0 && ch === ")") {
            break;
        } else if (awaitBrace === ch) {
            braceTrack.pop();
            deviance = braceTrack.length;
            awaitBrace = bracePair[braceTrack[deviance - 1]];
        } else if (openBraces.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
            braceTrack.push(ch);
            deviance = braceTrack.length;
            awaitBrace = bracePair[ch];
        } else if (deviance === 0 && closeBraces.includes(ch)) {
            break;
        }
    }

    return { substring, marker, values: ok ? values : [] };
}

export default function parser(string) {
    let result = '', capture = '', score = 0, marker = 0;

    try {
        do {
            const ch = string[marker++];
            if (/\w/i.test(ch)) {
                capture += ch;
            } else {
                result += capture + ch;
                capture = '';
            }

            if (palletes.includes(capture) && string[marker] === "(") {
                const response = paletteScanner(string, marker);
                const start = marker;
                if (response.values.length) {
                    score++;
                    const rgba = Utils.color.from[capture](...response.values);
                    result += Utils.color.LoadHex(rgba.r, rgba.g, rgba.b, rgba.alpha);
                } else {
                    result += `${capture}${response.substring}`;
                }
                marker = response.marker + 1;
                capture = '';
                continue;
            }
        } while (marker < string.length)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error scanning content:', errorMessage);
    }

    return Boolean(score) ? [result, string] : [string];;
}