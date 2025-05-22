import Use from "../Utils/index.js"

export const LISTEDPREFIX = {
    atRule: {},
    selector: {},
    property: {},
}

function getSelectorPrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    const stringList = Use.string.zeroBreaks(content, [","]).map(i => i.trim()), selectors = [];

    stringList.forEach((string = "") => {
        const result = {
            webkit: { out: "", score: 0 },
            moz: { out: "", score: 0 },
            ms: { out: "", score: 0 },
            o: { out: "", score: 0 },
            "": { out: "", score: 0 },
        };

        prefixes.forEach((group) => {
            result[group].out = string.replace(/:+[\w-]+/g, (selector) => {
                if (LISTEDPREFIX.selector[selector] && LISTEDPREFIX.selector[selector][group]) result[group].score++;
                return (LISTEDPREFIX.selector[selector] && LISTEDPREFIX.selector[selector][group]) || LISTEDPREFIX.selector[selector] || selector;
            })
        })

        selectors.push(...Object.values(result).reduce((acc, item) => {
            if (item.score) acc.push(item.out);
            return acc;
        }, []), string)
    })
    const finalIndex = selectors.length - 1;
    return selectors.map((s, i) => (finalIndex !== i) ? s + "," : s);
}

function getPropPrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    const result = prefixes.reduce((a, group) => {
        if (LISTEDPREFIX.property[content] && LISTEDPREFIX.property[content][group])
            a.push(LISTEDPREFIX.property[content][group]);
        return a;
    }, []);
    result.push(content)
    return result;
}

function getAtRulePrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    let index = content.indexOf(" ");
    index = index < 0 ? content.length : index
    const rule = content.slice(0, index), data = content.slice(index);

    const result = prefixes.reduce((a, group) => {
        if (LISTEDPREFIX.atRule[rule] && LISTEDPREFIX.atRule[rule][group])
            a[group] = LISTEDPREFIX.atRule[rule][group] + data;;
        return a;
    }, {});
    result[""] = content
    return result
}

function getAtPropPrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    let index = content.indexOf(" ");
    index = index < 0 ? content.length : index
    const rule = content.slice(0, index), data = content.slice(index);

    const result = prefixes.reduce((a, group) => {
        if (LISTEDPREFIX.atRule[rule] && LISTEDPREFIX.atRule[rule][group]) {
            a.push(LISTEDPREFIX.atRule[rule][group] + data);
        }
        return a;
    }, []);
    result.push(content)
    return result;
}


function propListBuild(object) {
    return Object.entries(object).reduce((A, [key, value]) => {
        if (typeof key === "object" || key[0] === "@") {
            A[key] = value;
        } else {
            getPropPrefixes(key).forEach(k => { if (!A[k]) A[k] = value })
            A[key] = value;
        }
        return A;
    }, {})
}

function unNester(selector = "", object = {}) {
    const nests = {}, result = {};
    Object.keys(object).forEach((subSelector) => {
        if (typeof object[subSelector] === "object") {
            if (subSelector[0] === "&") {
                const xelector = selector + subSelector.slice(1);
                const subResult = unNester(xelector, object[subSelector]);
                if (subSelector[1] === " ") {
                    Object.entries(subResult.nests).forEach(([nest, block]) => nests[nest] = block);
                    nests[subResult.selector] = subResult.result
                } else {
                    nests[subResult.selector] = subResult.result
                    Object.entries(subResult.nests).forEach(([nest, block]) => nests[nest] = block);
                }
            } else {
                const subResult = unNester(subSelector, object[subSelector]);
                result[subSelector] = subResult.result;
                Object.entries(subResult.nests).forEach(([nest, block]) => result[nest] = block);
            }
        } else result[subSelector] = object[subSelector];
        return result
    }, {})
    return { nests, selector, result }
}

function objectCompose(object, minify = false, prefixes = ["webkit", "moz", "ms", "o"]) {
    const tab = minify ? "" : "  ", space = minify ? "" : " ";
    let styleSheet = [];

    for (const key in object) {
        const value = object[key];
        if ((typeof value) === "object") {
            const subObject = propListBuild(value);
            if (Object.keys(subObject).length) {
                if (key[0] === "@") {
                    const selectors = Object.entries(getAtRulePrefixes(key, prefixes));
                    selectors.forEach(([group, selector]) => styleSheet.push(selector, "{", ...objectCompose(subObject, minify, [group]).map(i => tab + i), "}"));
                } else {
                    styleSheet.push(...getSelectorPrefixes(key, prefixes), "{", ...objectCompose(subObject, minify, prefixes).map(i => tab + i), "}");
                }
            }
        }
        else {
            if (key[0] === "@") {
                styleSheet.push(...getAtPropPrefixes(key, prefixes).map(rule => rule + ";"));
            } else {
                styleSheet.push(key + ":" + space + value + ";");
            }
        }
    }
    return styleSheet
}

export default function arrayCompose(array, minify = false, prefixes = ["webkit", "moz", "ms", "o"]) {
    const tab = minify ? "" : "  ", space = minify ? "" : " ", br = "";
    let styleSheet = [];
    array.forEach(([key, value]) => {
        const process = typeof value === "object" ? unNester(key, value) : { selector: key, result: value, nests: {} };
        [...Object.entries(process.nests), [process.selector, process.result]].forEach(([newKey, newValue]) => {
            if ((typeof newValue) === "object") {
                const subObject = propListBuild(newValue);
                if (newKey[0] === "@") {
                    const selectors = Object.entries(getAtRulePrefixes(newKey, prefixes));
                    selectors.forEach(([group, selector]) => styleSheet.push(br, selector, "{", ...objectCompose(subObject, minify = false, [group]).map(i => tab + i), "}"));
                } else {
                    styleSheet.push(br, ...getSelectorPrefixes(newKey, prefixes), "{", ...objectCompose(subObject, minify = false, prefixes).map(i => tab + i), "}");
                }
            }
            else {
                if (newKey[0] === "@") {
                    styleSheet.push(...getAtPropPrefixes(newKey, prefixes).map(rule => rule + ";"));
                } else {
                    styleSheet.push(newKey + ":" + space + newValue + ";");
                }
            }
        })
    })

    return styleSheet.join(minify ? "" : "\n")
}