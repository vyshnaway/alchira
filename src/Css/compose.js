import objectSwitch from '../../.dump/4.switch.js'
import code from '../cleaner.js'
// import extract from './1.extract.js'
// import getBlock from './StyleBlock/0.block.js'
// import U from '../../.dump/Utils/package.js'

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
