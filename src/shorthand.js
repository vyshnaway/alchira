import $ from './Shell/index.js';

const hashPattern = /\{#[a-z0-9]+\}/i;
const preHashPattern = /(?<!\{)#\w+/g;
let stash = {};

let SHORTHAND = {
    IMPORT: (string, watchUndef = true) => {
        const response = {
            status: true,
            result: "",
        }
        let hashMatch;
        const source = string;
        const recursionPreview = {}
        const recursionSequence = [];
        string = string.replace(preHashPattern, match => '{' + match + '}')

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

        while (hashMatch = hashPattern.exec(string)) {
            const hash = hashMatch[0];
            const key = hash.slice(2, -1);
            const replacement = watchUndef ? (stash[key] ?? hash) : stash[key];
            recursionPreview["FROM " + hash] = `GETS ${replacement}`

            if (replacement === undefined)
                return errors.undefinedHash(recursionPreview, hash);

            if (recursionSequence.includes(hash))
                return errors.recursionLoop(recursionPreview, hash);

            string = string.replace(hashPattern, replacement)
                .replace(preHashPattern, match => "{" + match + "}"); // added for recursion detection

            recursionSequence.push(hash);
        }

        response.result = string
        return response;
    },
    UPLOAD: async (shorthands) => {
        $.TASK('Attempting shorthand build.')
        const shorthandErrors = [];

        stash = shorthands;
        Object.keys(shorthands).map(key => {
            const hash = '#' + key
            const response = SHORTHAND.IMPORT(hash);
            if (typeof (shorthands[key]) === "string") {
                if (response.status) {
                    shorthands[key] = response.result;
                } else {
                    delete shorthands[key]
                    shorthandErrors.push(response.result)
                }
            }
        });
        stash = shorthands;
        let response = [];

        if (Object.keys(stash).length)
            response.push($.compose.success.Section("Valid Shorthands", $.list.success.Props(shorthands), $.list.std.Bullets))

        if (shorthandErrors.length)
            response.push($.compose.failed.Footer("Invalid Shorthands", shorthandErrors, $.list.std.Bullets))

        return $.compose.std.Block(response)
    },
    RENDER: (string) => {
        string = SHORTHAND.IMPORT(string).result
        let rule = [],
            selector = [],
            $Marker = 0,
            length = string.length,
            deviance = 0;

        for (let i = 0; i < length; i++) {
            let ch = string[i];

            if ("({".includes(ch)) {
                deviance++;
            }
            else if (")}".includes(ch)) {
                deviance--;
            }

            if (deviance) {
                rule.push(ch);
            }
            else if (ch === '$') {
                $Marker = i + 1;
                break;
            }
            else {
                switch (ch) {
                    case '}': rule.push(''); break;
                    case ',': rule.push(', '); break;
                    case '|': rule.push(' or '); break;
                    case '&': rule.push(' and '); break;
                    case '!': rule.push('not '); break;
                    case '*': rule.push('all '); break;
                    case '^': rule.push('only '); break;
                    case '@': rule.unshift('@'); rule.push(' '); break;
                    default: rule.push(ch);
                }
            }
        }

        if ($Marker > 0) {
            for (let i = $Marker; i < length; i++) {
                const ch = string[i];
                if (ch === '{') {
                    if (i + 1 < string.length && string[i + 1] !== ':') selector.push(' ');
                } else if (ch !== '}') {
                    selector.push(ch);
                }
            }
        }

        return { rule: rule.join(''), selector: selector.join('') };
    },
}

export default SHORTHAND;