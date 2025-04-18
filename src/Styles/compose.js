import U from "./Utils/index.js"

const enCounter = () => {
    const digits = "_0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-";
    const base = digits.length;

    let result = "", num = ++counter;
    while (num > 0) {
        result = digits[num % base] + result;
        num = Math.floor(num / base);
    }
    return "_" + result;
};

export default function compose(object, dotPrefix = false, minify = false, order = []) {
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
        for (const selector in ruleObj) {
            const value = ruleObj[selector]
            if (selector === '___')
                output += genClassBlock(value, selector);
            else
                output += (dotPrefix ? "." : "") + `${selector}${sp()}{${br()}${genClassBlock(value, selector)}}${br()}`;
        }
        return output;
    }

    let styleSheet = '';
    const switchedObj = order.length ? U.object.switch(object) :    Object.fromEntries(order.map((I) => [I, object[I]]))
    for (const rule in switchedObj) {
        if (rule === '')
            styleSheet += genRuleBlock(switchedObj[rule])
        else
            styleSheet += `${br()}${rule}${sp()}{${br()}${genRuleBlock(switchedObj[rule])}}${br()}`
    }

    return styleSheet
}