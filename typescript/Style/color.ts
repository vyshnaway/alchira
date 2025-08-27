import Utils from "../utils/main.js";

const bracePair: Record<string, string> = {
    "{": "}",
    "[": "]",
    "(": ")",
    "'": "'",
    "`": "`",
    '"': '"',
};
const openBraces = ["[", "{", "(", "'", '"', "`"];
const closeBraces = ["]", "}", ")"];

function stdScanner(
    content: string,
    marker: number,
    palette: string
) {
    const values: number[] = [], braceTrack: string[] = [];
    let value = "", awaitBrace = "", ok = true, deviance = 0, ch = content[marker];

    while (ch !== undefined) {
        ch = content[++marker];

        if (deviance === 0 && (ch === ")" || ch === "," || ch === " " || ch === '/')) {
            const trimmed = value.trim();
            if (trimmed.length > 0) {

                if (trimmed.endsWith("deg")) {
                    const numValue = parseFloat(trimmed.slice(0, -3));
                    if (!isNaN(numValue)) {
                        values.push(numValue);
                    } else {
                        ok = false;
                    }
                } else if (trimmed.endsWith("%")) {
                    const numValue = parseFloat(trimmed.slice(0, -1));
                    if (!isNaN(numValue)) {
                        if (ch === '/') {
                            values.push(numValue / 100);
                        } else if (
                            (palette === "rgb" || palette === "rgba") && values.length < 3
                        ) {
                            values.push(Math.round((numValue / 100) * 255));
                        } else if (palette === "hsl" && (values.length === 1 || values.length === 2)) {
                            values.push(numValue);
                        } else if ((palette === "hwb" || palette === "lab" || palette === "lch" ||
                            palette === "oklab" || palette === "oklch") && values.length > 0) {
                            values.push(numValue); // For these, % indicates relative to max, keep as is for now and convert later if needed
                        } else {
                            values.push(numValue);
                        }
                    } else {
                        ok = false;
                    }
                } else if (!isNaN(Number(trimmed))) {
                    const numValue = Number(trimmed);
                    if ((palette === "rgb" || palette === "rgba") && values.length < 3) {
                        if (Number.isInteger(numValue) && numValue >= 0 && numValue <= 255) {
                            values.push(numValue);
                        } else {
                            values.push(numValue);
                        }
                    } else {
                        values.push(numValue);
                    }
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
            awaitBrace = bracePair[braceTrack[deviance - 1] as keyof typeof bracePair];
        } else if (openBraces.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
            braceTrack.push(ch);
            deviance = braceTrack.length;
            awaitBrace = bracePair[ch as keyof typeof bracePair];
        } else if (deviance === 0 && closeBraces.includes(ch)) {
            break;
        }
    }

    return { values: ok ? values : [], endingMarker: marker + 1 };
}

export default function parser(
    source: string,
    fallback_RGB1_HEX0 = true,
    fallbackPalettes: string[] = ['oklch', 'oklab', 'lab', 'lch', 'hwb', 'rgsb']
): string[] {
    let activeMarker = 0, ch = source[activeMarker], capture = '', result = '', score = 0;
    try {
        while (activeMarker < source.length) {
            ch = source[activeMarker++];
            const isAlNum = /\w/i.test(ch);

            if (isAlNum) { capture += ch; }
            else { result += capture.length ? capture + ch : ch; capture = ''; }

            if (fallbackPalettes.includes(capture) && source[activeMarker] === "(") {
                const { values, endingMarker } = stdScanner(source, activeMarker, capture);
                if (values.length > 2) {
                    score++;
                    let r = 0, g = 0, b = 0, alpha = 1, converted = '';
                    switch (capture) {
                        case 'hsl':
                        case 'hsla':
                            [r, g, b, alpha, converted] = (() => {
                                const [h, s, l, a = 1] = values;
                                const rgb = Utils.color.from.hsl(h, s * 100, l * 100, a);
                                return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
                            })();
                            break;
                        case 'hwb':
                            [r, g, b, alpha, converted] = (() => {
                                const [h, w, b_, a = 1] = values;
                                const rgb = Utils.color.from.hwb(h, w * 100, b_ * 100, a);
                                return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
                            })();
                            break;
                        case 'lab':
                            [r, g, b, alpha, converted] = (() => {
                                const [l, a_, b_, a = 1] = values;
                                const rgb = Utils.color.from.lab(l, a_, b_, a);
                                return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
                            })();
                            break;
                        case 'lch':
                            [r, g, b, alpha, converted] = (() => {
                                const [l, c, h, a = 1] = values;
                                const rgb = Utils.color.from.lch(l, c, h, a);
                                return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
                            })();
                            break;
                        case 'oklab':
                            [r, g, b, alpha, converted] = (() => {
                                const [l, a_, b_, a = 1] = values;
                                const rgb = Utils.color.from.oklab(l, a_, b_, a);
                                return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
                            })();
                            break;
                        case 'oklch':
                            [r, g, b, alpha, converted] = (() => {
                                const [l, c, h, a = 1] = values;
                                const rgb = Utils.color.from.oklch(l, c, h, a);
                                return [rgb.r, rgb.g, rgb.b, a, rgb.converted];
                            })();
                            break;
                        default:
                            converted = capture + source.slice(activeMarker, endingMarker);
                    }
                    result += fallback_RGB1_HEX0 ? converted : Utils.color.LoadHex(r, g, b, alpha);
                } else {
                    result += capture + source.slice(activeMarker, endingMarker);
                }
                activeMarker = endingMarker;
                capture = '';
            }

        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error scanning content:', errorMessage);
    }

    return score ? [result, source] : [source];
}
