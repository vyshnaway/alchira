import OBJ from "../Utils/2.object.js"
import CODE from "../cleaner.js"

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


function extractClassList(array, incCompStyles = true) {
    function setback(array) {
        const lastSeen = new Map();
        for (let i = 0; i < array.length; i++) {
            lastSeen.set(array[i], i);
        }
        return array.filter((item, index) => lastSeen.get(item) === index);
    }

    const currentScope = classTable[currentFile]?.styleGroup ?? {};
    const fallbackScope = classTable[defaultScope]?.styleGroup ?? {};

    const expandedArray = setback(array).flatMap(xtyle => {
        if ((xtyle.startsWith('$') && incCompStyles)) {
            const xtylex = xtyle.endsWith('+') ? xtyle.slice(0, -1) : xtyle;
            return currentScope[xtylex] ?? fallbackScope[xtylex] ?? [xtylex];
        }
        return xtyle;
    });

    return setback(expandedArray)
}

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


