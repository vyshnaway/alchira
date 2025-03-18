import { shortHands } from '../0.env.js';
import $ from '../Docs/package.js';

const hashPattern = /\[#[a-z0-9]+\]/i;
const preHashPattern = /(?<!\[)#\w+/g;

export default function renderShorthand(string) {
    const response = {
        status: true,
        result: "",
    }
    let hashMatch;
    const source = string;
    const recursionPreview = {}
    const recursionSequence = [];
    string = string.replace(preHashPattern, match => '[' + match + ']')

    const errors = {
        recursionLoop: (recursionPreview, cause) => {
            response.status = false;
            recursionPreview["ERROR BY"] = $.custom.style.apply.bold.Red(cause)
            response.result = $.compose.std.List(source + $.custom.style.apply.bold.Red(" : Shorthand recursion loop."), $.list.failed.Props(recursionPreview), $.list.failed.Waterfall, 1);
            return response
        },
        undefinedHash: (recursionPreview, cause) => {
            response.status = false;
            recursionPreview["ERROR BY"] = $.custom.style.apply.bold.Red(cause)
            response.result = $.compose.std.List(source + $.custom.style.apply.bold.Red(" : Undefined shorthand."), $.list.failed.Props(recursionPreview), $.list.failed.Waterfall, 1);
            return response
        }
    }

    while ((hashMatch = hashPattern.exec(string))) {
        const hash = hashMatch[0];
        const key = hash.substring(2, -1);
        const replacement = shortHands[key];
        recursionPreview["FROM " + hash] = `GETS ${replacement}`
        if (replacement === undefined)
            return errors.undefinedHash(recursionPreview, hash);
        if (recursionSequence.includes(hash))
            return errors.recursionLoop(recursionPreview, hash);

        string = string.replace(hashPattern, replacement)
            .replace(preHashPattern, match => `[${match}]`); // added for recursion detection

        recursionSequence.push(hash);
    }

    response.result = string
    return response;
}
