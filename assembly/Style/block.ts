import * as u from "../Utils/index"; // Renamed to lowercase

const OPEN_CHARS: string[] = ['{', '[', '('];
const CLOSE_CHARS: string[] = ['}', ']', ')'];
const QUOTE_CHARS: string[] = ['`', "'", '"'];

export class ParseBlockResult { // Changed to export class
    adds: string[] = [];
    binds: string[] = [];
    preBinds: string[] = [];
    postBinds: string[] = [];
    variables: string[] = [];
    XatProps: Array<string[]> = []; // Changed to Array<string[]>
    atProps: Map<string, string> = new Map();
    Xproperties: Array<string[]> = []; // Changed to Array<string[]>
    properties: Map<string, string> = new Map();
    XatRules: Array<string[]> = [];    // Changed to Array<string[]>
    atRules: Map<string, string> = new Map();
    Xnested: Array<string[]> = [];      // Changed to Array<string[]>
    nested: Map<string, string> = new Map();
    Xclasses: Array<string[]> = [];     // Changed to Array<string[]>
    classes: Map<string, string> = new Map();
    Xflats: Array<string[]> = [];        // Changed to Array<string[]>
    flats: Map<string, string> = new Map();
    XallBlocks: Array<string[]> = [];   // Changed to Array<string[]>
    allBlocks: Map<string, string> = new Map();
}

export function parseBlock(content: string, blockArrays: boolean = false): ParseBlockResult {
    let result = new ParseBlockResult();
    content += ';';
    let keyStart: i32 = 0;
    let valStart: i32 = 0;
    let deviance: i32 = 0;
    let quote: string = '';
    let key: string = '';
    let isProp: boolean = true;
    let length: i32 = content.length;

    for (let index: i32 = 0; index < length; index++) {
        const ch: string = content.charAt(index);
        if (ch === '\\') {
            index++;
            continue;
        }
        if (QUOTE_CHARS.includes(ch)) {
            if (quote === '') {
                quote = ch;
            } else if (quote === ch) {
                quote = '';
            }
        }

        if (quote === '') {
            if (CLOSE_CHARS.includes(ch)) {
                deviance--;
            }

            if (deviance === 0) {
                switch (ch) {
                    case '{':
                        isProp = false;
                    case ':':
                        key = u.string.minify(content.substring(keyStart, index));
                        valStart = index + 1;
                        break;
                    case '}':
                    case ';':
                        const value: string = u.string.minify(content.substring(valStart, index));
                        if (isProp) {
                            if (key.length > 0) {
                                if (key.startsWith("--")) {
                                    result.variables.push(key);
                                }
                                result.properties.set(key, value);
                                if (blockArrays) result.Xproperties.push([key, value]);
                            } else if (value.length > 0 && value.charAt(0) === '@') { // added check for value
                                const spaceIndex: i32 = value.indexOf(" ");
                                const directive: string = value.substring(0, spaceIndex);
                                switch (directive) {
                                    case "@bind":
                                        result.binds.push(...u.string.zeroBreaks(value.substring(spaceIndex)));
                                        break;
                                    case "@pre-bind":
                                        result.preBinds.push(...u.string.zeroBreaks(value.substring(spaceIndex)));
                                        break;
                                    case "@post-bind":
                                        result.postBinds.push(...u.string.zeroBreaks(value.substring(spaceIndex)));
                                        break;
                                    case "@assemble":
                                        result.adds.push(...u.string.zeroBreaks(value.substring(spaceIndex)));
                                        break;
                                    default:
                                        result.atProps.set(value, "");
                                        if (blockArrays) result.XatProps.push([value, ""]);
                                }
                            } else {
                                const breaks: string[] = u.string.zeroBreaks(value);
                                const groupMap: Map<string, keyof ParseBlockResult> = new Map();
                                groupMap.set("<", "preBinds");
                                groupMap.set(">", "postBinds");
                                groupMap.set("+", "adds");
                                groupMap.set("*", "binds");
                                let group: keyof ParseBlockResult = groupMap.get(breaks[0]) || "adds";
                                if (groupMap.has(breaks[0])) {
                                    breaks.shift();
                                }
                                breaks.forEach(link => {
                                    const targetGroup: keyof ParseBlockResult = groupMap.get(link.charAt(0)) || group;
                                    result[targetGroup].push(groupMap.has(link.charAt(0)) ? link.substring(1) : link);
                                });
                            }
                        } else {
                            switch (key.charAt(0)) {
                                case "@":
                                    result.atRules.set(key, value);
                                    if (blockArrays) result.XatRules.push([key, value]);
                                    break;
                                case "&":
                                    result.nested.set(key, value);
                                    if (blockArrays) result.Xnested.push([key, value]);
                                    break;
                                case ".":
                                    result.classes.set(key, value);
                                    if (blockArrays) result.Xclasses.push([key, value]);
                                    break;
                                default:
                                    result.flats.set(key, value);
                                    if (blockArrays) result.Xflats.push([key, value]);
                            }
                            result.allBlocks.set(key, value);
                            if (blockArrays) result.XallBlocks.push([key, value]);
                        }
                        keyStart = index + 1;
                        valStart = index + 1;
                        key = '';
                        isProp = true;
                        break; // Added break here
                }
            }
            if (OPEN_CHARS.includes(ch)) {
                deviance++;
            }
        }
    }
    return result;
}
