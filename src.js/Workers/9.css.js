import objectSwitch from '../../.dump/4.switch.js'
import code from '../Style/code.js'
// import extract from './1.extract.js'
// import getBlock from './StyleBlock/0.block.js'
// import U from '../../.dump/Utils/package.js'

export function parse(string) {
    let keyStart = 0,
        valStart = 0,
        deviance = 0,
        quote = '',
        key = '',
        length = string.length,
        styleObject = { '': {} };

    for (let index = 0; index < length; index++) {
        const ch = string[index];
        if (ch === '\\') {
            index++;
            continue;
        }
        if (`\`\'\"`.includes(ch)) {
            if (quote === '') {
                quote = ch;
            } else if (quote === ch) {
                quote = ''
            }
        }

        if (quote === '') {
            if ("}" === ch) deviance--;

            if (!deviance) {
                switch (ch) {
                    case '{':
                        key = U.string.minify(string.slice(keyStart, index));
                        valStart = index + 1;
                        break;
                    case '}':
                    case ';':
                        if (key !== '' && ch === '}') {
                            if (key[0] === '@') {
                                styleObject[key] = parse(string.slice(valStart, index))['']
                            } else {
                                key = extract.className(key)
                                if (key !== '') {
                                    const block = getBlock(string.slice(valStart, index), false, true, true, false, false);
                                    styleObject[''][key] = { ...block.props, ...block.nests }
                                }
                            }
                        }
                        keyStart = index + 1;
                        valStart = index + 1;
                        key = '';
                }
            }

            if ("{" === ch) deviance++;
        }
    }
    return styleObject;
}

function compose(object, minify = false) {
    const tb = (count = 0) => minify ? '' : '    '.repeat(count)
    const br = (count = 1) => minify ? '' : '\n'.repeat(count);
    const sp = (count = 1) => minify ? '' : ' '.repeat(count);

    function genNestsBlock(propObj) {
        let output = '';
        for (const key in propObj) {
            const value = propObj[key]
            output += `${tb(2)}${key}${(value === '') ? `` : `:${sp()}${value}`};${br()}`;
        }
        return output
    }
    function genClassBlock(classObj) {
        let output = '';
        for (const key in classObj) {
            if (key === '') continue;
            const value = classObj[key]
            if (typeof (value) === 'string') {
                output += `${tb(1)}${key}${(value === '') ? `` : `:${sp()}${value}`};${br()}`
            } else {
                output += `${tb(1)}${key}${sp()}{${br()}${genNestsBlock(classObj[key], key)}${tb(1)}}${br()}`;
            }
        }
        return output;
    }
    function genRuleBlock(ruleObj) {
        let output = '';
        for (const className in ruleObj) {
            const value = ruleObj[className]
            if (className === '')
                output += genClassBlock(value, className);
            else
                output += `.${className}${sp()}{${br()}${genClassBlock(value, className)}}${br()}`;
        }
        return output;
    }

    let styleSheet = '';
    const switchedObj = objectSwitch(object)
    for (const rule in switchedObj) {
        if (rule === '')
            styleSheet += genRuleBlock(switchedObj[rule])
        else
            styleSheet += `${br()}${rule}${sp()}{${br()}${genRuleBlock(switchedObj[rule])}}${br()}`
    }
    return styleSheet
}

function render(styleSheets = [], command = "dev") {
    const renderOpt = {
        dev: code.uncomment.Css,
        preview: code.minify.Lite,
        build: code.minify.Strict,
    };
    return styleSheets.map(sheet => renderOpt[command](sheet))
}

export default {
    parse,
    compose,
    render
}
