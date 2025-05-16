import U from "../Utils/index.js"

const OPEN_CHARS: string[] = ['{', '[', '('];
const CLOSE_CHARS: string[] = ['}', ']', ')'];
const QUOTE_CHARS: string[] = ['`', "'", '"'];

interface ParseBlockResult {
    adds: string[];
    binds: string[];
    preBinds: string[];
    postBinds: string[];
    variables: string[];
    XatProps: [string, string][];
    atProps: { [key: string]: string };
    Xproperties: [string, string][];
    properties: { [key: string]: string };
    XatRules: [string, string][];
    atRules: { [key: string]: string };
    Xnested: [string, string][];
    nested: { [key: string]: string };
    Xclasses: [string, string][];
    classes: { [key: string]: string };
    Xflats: [string, string][];
    flats: { [key: string]: string };
    XallBlocks: [string, string][];
    allBlocks: { [key: string]: string };
}

export default function parseBlock(content: string, blockArrays: boolean = false): ParseBlockResult {
    content += ';'
    let keyStart: number = 0,
        valStart: number = 0,
        deviance: number = 0,
        quote: string = '',
        key: string = '',
        isProp: boolean = true,
        length: number = content.length;

    let result: ParseBlockResult = {
        adds: [],
        binds: [],
        preBinds: [],
        postBinds: [],
        variables: [],
        XatProps: [],
        atProps: {},
        Xproperties: [],
        properties: {},
        XatRules: [],
        atRules: {},
        Xnested: [],
        nested: {},
        Xclasses: [],
        classes: {},
        Xflats: [],
        flats: {},
        XallBlocks: [],
        allBlocks: {},
    };

    for (let index = 0; index < length; index++) {
        const ch: string = content[index];
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
                        key = U.string.minify(content.slice(keyStart, index));
                        valStart = index + 1;
                        break;
                    case '}':
                    case ';':
                        const value: string = U.string.minify(content.slice(valStart, index));
                        if (isProp) {
                            if (key.length > 0) {
                                if (key.startsWith("--"))
                                    result.variables.push(key);
                                result.properties[key] = value;
                                if (blockArrays) result.Xproperties.push([key, value]);
                            } else if (value[0] === '@') {
                                const spaceIndex: number = value.indexOf(" ")
                                const directive: string = value.slice(0, spaceIndex);
                                switch (directive) {
                                    case "@bind":
                                        result.binds.push(...U.string.zeroBreaks(value.slice(spaceIndex)));
                                        break;
                                    case "@pre-bind":
                                        result.preBinds.push(...U.string.zeroBreaks(value.slice(spaceIndex)));
                                        break;
                                    case "@post-bind":
                                        result.postBinds.push(...U.string.zeroBreaks(value.slice(spaceIndex)));
                                        break;
                                    case "@assemble":
                                        result.adds.push(...U.string.zeroBreaks(value.slice(spaceIndex)));
                                        break;
                                    default:
                                        result.atProps[value] = "";
                                        if (blockArrays) result.XatProps.push([value, ""]);
                                }
                            } else {
                                const breaks: string[] = U.string.zeroBreaks(value);
                                const groupMap: { [key: string]: keyof ParseBlockResult } = { "<": "preBinds", ">": "postBinds", "+": "adds", "*": "binds" };
                                const group: keyof ParseBlockResult = groupMap[breaks[0]] || "adds";
                                if (Object.keys(groupMap).includes(breaks[0])) breaks.shift();
                                breaks.forEach(link => {
                                    const targetGroup: keyof ParseBlockResult = groupMap[link[0]] || group;
                                    result[targetGroup].push(link[0] in groupMap ? link.slice(1) : link);
                                });
                            }
                        } else {
                            switch (key[0]) {
                                case "@":
                                    result.atRules[key] = value;
                                    if (blockArrays) result.XatRules.push([key, value]);
                                    break;
                                case "&":
                                    result.nested[key] = value;
                                    if (blockArrays) result.Xnested.push([key, value]);
                                    break;
                                case ".":
                                    result.classes[key] = value;
                                    if (blockArrays) result.Xclasses.push([key, value]);
                                    break;
                                default:
                                    result.flats[key] = value;
                                    if (blockArrays) result.Xflats.push([key, value]);
                            }
                            result.allBlocks[key] = value;
                            if (blockArrays) result.XallBlocks.push([key, value]);
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

    return result;
}
