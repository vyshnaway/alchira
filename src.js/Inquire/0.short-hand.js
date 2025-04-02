import $ from '../Xhell/package.js';

const hashPattern = /\{#[a-z0-9]+\}/i;
const preHashPattern = /(?<!\{)#\w+/g;

function renderAtRule(string) {
    let result = [],
        length = string.length,
        deviance = 0;

    for (let i = 0; i < length; i++) {
        let ch = string[i];
        if ("({".includes(ch)) deviance++;
        if (")}".includes(ch)) deviance--;
        if (deviance) {
            result.push(ch);
        } else {
            switch (ch) {
                case '}': result.push(''); break;
                case ',': result.push(', '); break;
                case '|': result.push(' or '); break;
                case '&': result.push(' and '); break;
                case '!': result.push('not '); break;
                case '*': result.push('all '); break;
                case '^': result.push('only '); break;
                case '@': result.unshift('@');result.push(' ');break;
                default: result.push(ch);
            }
        }
    }

    return result.join('');
}

let shorthand = {
    stash: {},
    RENDER: (string) => {
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
            const replacement = shorthand.stash[key];
            recursionPreview["FROM " + hash] = `GETS ${replacement}`
            if (replacement === undefined)
                return errors.undefinedHash(recursionPreview, hash);
            if (recursionSequence.includes(hash))
                return errors.recursionLoop(recursionPreview, hash);

            string = string.replace(hashPattern, replacement)
                .replace(preHashPattern, match => "{" + match + "}"); // added for recursion detection

            recursionSequence.push(hash);
        }

        response.result = renderAtRule(string)
        return response;
    },
    BUILD: async (shorthands) => {
        $.TASK('Attempting shorthand build.')
        const shorthandErrors = [];
        
        shorthand.stash = shorthands;
        Object.keys(shorthands).map(key => {
            const hash = '#' + key
            const response = shorthand.RENDER(hash);
            if (typeof(shorthands[key]) === "string") {
                if (response.status) {
                    shorthands[key] = response.result;
                } else {
                    delete shorthands[key]
                    shorthandErrors.push(response.result)
                }
            }
        });
        shorthand.stash = shorthands;

        if (Object.keys(shorthand.stash).length)
            $.WRITE.success.Section("Valid Shorthands", $.list.success.Props(shorthands), $.list.std.Bullets)
        else $.WRITE.failed.Section("Unable to fetch Shorthands.")

        if (shorthandErrors.length)
            $.WRITE.failed.Footer("Invalid Shorthands", shorthandErrors, $.list.std.Bullets)
    }
}

export default shorthand;