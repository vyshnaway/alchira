import OBJ from "./1.object.js"
import CODE from "./code.js"

let style = {
    blocks: {

    },
    list: {
        micro: {},
        macro: {},
        library: {},
        global: {},
        local: {},
    },
    proxy: {
        micro: {},
        macro: {},
        library: {},
        global: {},
        local: {},
    }
};

function compose(minify = false, object = style.blocks) {
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
    const switchedObj = OBJ.switch(object)
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
        dev: CODE.uncomment.Css,
        preview: CODE.minify.Lite,
        build: CODE.minify.Strict,
    };
    styleSheets.map(sheet => renderOpt[command](sheet))
    styleSheets.push(compose(command !== "dev"))
    return styleSheets.join("\n")
}

export default {
    compose,
    render
}


