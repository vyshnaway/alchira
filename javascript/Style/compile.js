import * as vendor from "./vendor.js"

function LoadVendors(collection = {}, vendor = '') {
    return vendor == '' ? ["webkit", "moz", "ms", "o"].filter(ven => !collection.hasOwnProperty(ven)) : [vendor]
}

function propListBuild(object) {
    return Object.entries(object).reduce((A, [key, value]) => {
        if (typeof key === "object" || key[0] === "@") {
            A[key] = value;
        } else {
            vendor.getPropPrefixes(key).forEach(k => { if (!A[k]) A[k] = value })
            A[key] = value;
        }
        return A;
    }, {})
}

function unNester(selector = "", object = {}, cumulates = {}) {
    const siblings = {}, myself = {}, children = {};

    const holder = myself[selector] = {};
    Object.entries(object).forEach(([subSelector, subContent]) => {
        if (typeof subContent === "object") {
            if (subSelector[0] === "&") {
                const xelector = selector + subSelector.slice(1);
                if (subSelector[1] === " ") {
                    unNester(xelector, subContent, children[xelector] = {});
                } else {
                    unNester(xelector, subContent, siblings[xelector] = {});
                }
            } else {
                unNester(subSelector, subContent, holder);
            }    
        } else holder[subSelector] = subContent;
    })
    console.log({ siblings, myself, children })
    Object.assign(cumulates, siblings, myself, children)
    return cumulates;
}

function objectCompose(object, prefixes = LoadVendors(), minify) {
    const tab = minify ? "" : "  ", space = minify ? "" : " ";
    let styleSheet = [];

    Object.entries(object).forEach(([key, value]) => {
        if ((typeof value) === "object") {
            const subObject = propListBuild(value);
            if (Object.keys(subObject).length) {
                if (key[0] === "@") {
                    const selectors = Object.entries(vendor.getAtRulePrefixes(key, prefixes));
                    selectors.forEach(([group, selector]) => styleSheet.push(selector, "{", ...objectCompose(subObject, [group], minify).map(i => tab + i), "}"));
                } else {
                    styleSheet.push(...vendor.getSelectorPrefixes(key, prefixes), "{", ...objectCompose(subObject, prefixes, minify).map(i => tab + i), "}");
                }
            }
        }
        else {
            if (key[0] === "@") {
                styleSheet.push(...vendor.getAtPropPrefixes(key, LoadVendors(prefixes)).map(rule => rule + ";"));
            } else {
                styleSheet.push(key + ":" + space + value + ";");
            }
        }
    })

    return styleSheet
}


export default function arrayCompose(array, minify) {
    const tab = minify ? "" : "  ", space = minify ? "" : " ", br = "";
    let styleSheet = [];
    array.forEach(([key, value]) => {
        const processed = typeof value === "object" ? unNester(key, value) : { [key]: value };

        Object.entries(processed).forEach(([newKey, newValue]) => {
            if ((typeof newValue) === "object") {
                const subObject = propListBuild(newValue);
                if (newKey[0] === "@") {
                    const selectors = Object.entries(vendor.getAtRulePrefixes(newKey, LoadVendors()));
                    selectors.forEach(([group, selector]) => styleSheet.push(br, selector, "{", ...objectCompose(subObject, LoadVendors(selectors, group), minify)
                        .map(i => tab + i), "}"));
                } else {
                    styleSheet.push(br, ...vendor.getSelectorPrefixes(newKey, LoadVendors()), "{", ...objectCompose(subObject, LoadVendors(), minify).map(i => tab + i), "}");
                }
            }
            else {
                if (newKey[0] === "@") {
                    styleSheet.push(...vendor.getAtPropPrefixes(newKey, LoadVendors()).map(rule => rule + ";"));
                } else {
                    styleSheet.push(newKey + ":" + space + newValue + ";");
                }
            }
        })
    })

    return styleSheet.join(minify ? "" : "\n")
}