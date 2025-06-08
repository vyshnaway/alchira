import * as LOADPREFIX from "./vendor.js"

function LoadVendors(collection = {}, vendor = '') {
    return vendor == '' ? ["webkit", "moz", "ms", "o"].filter(ven => !collection.hasOwnProperty(ven)) : [vendor]
}

function StylePartialsArray(object, vendors = LoadVendors()) {
    const result = [];
    Object.entries(object).forEach(([key, value]) => {
        if (typeof value === "object") {
            result.push([key, value]);
        } else if (key[0] === "@") {
            Object.values(LOADPREFIX.forAtRule(key, vendors)).forEach(r => result.push([r + ';', '']));
        } else {
            LOADPREFIX.LoadProps(key, value, vendors).forEach(([k, v]) => { if (k === key || !object[k]) result.push([k + ':', v + ';']) });
        }
    })
    return result;
}

function unNester(selector = "", object = {}, cumulates = {}) {
    const siblings = {}, children = {}, myself = {};
    const holder = myself[selector] = {};

    Object.entries(object).forEach(([subSelector, subContent]) => {
        if (typeof subContent === "object") {
            if (subSelector[0] === "&") {
                const xelector = selector + subSelector.slice(1);
                if (subSelector[1] === " ")
                    unNester(xelector, subContent, children);
                else
                    unNester(xelector, subContent, siblings);
            } else {
                unNester(subSelector, subContent, holder);
            }
        } else holder[subSelector] = subContent;
    })

    Object.assign(cumulates, siblings, myself, children);
    return cumulates;
}

function objectCompose(object, minify, vendors = LoadVendors(), first = true) {
    const tab = minify ? "" : "  ", space = minify ? "" : " ", styleSheet = [];

    StylePartialsArray(object, vendors).forEach(([key, value]) => {
        if ((typeof value) === "object") {
            if (!minify && first) styleSheet.push('');
            if (key[0] === "@") {
                const atPrefixes = LOADPREFIX.forAtRule;
                Object.entries(atPrefixes(key, vendors)).forEach(([vendor, selector]) => {
                    styleSheet.push(selector, "{", ...objectCompose(value, minify, LoadVendors(atPrefixes, vendor), false).map(i => tab + i), "}")
                });
            } else {
                styleSheet.push(...LOADPREFIX.forSelector(key, vendors));
                styleSheet.push("{", ...objectCompose(value, minify, vendors, false).map(i => tab + i), "}")
            }
        }
        else if (key[0] === "@") {
            styleSheet.push(key);
        } else {
            styleSheet.push(key + space + value);
        }
    })

    return styleSheet
}


export default function arrayCompose(array, minify) {
    const styleSheet = [];

    array.forEach(([key, value]) => {
        const processed = typeof value === "object" ? unNester(key, value) : { [key]: value };
        styleSheet.push(...objectCompose(processed, minify))
    })

    return styleSheet.join(minify ? "" : "\n")
}