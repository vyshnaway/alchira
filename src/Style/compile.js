import U from "../Utils/index.js"
import { prefix, env, stash } from "../executor.js";

function getSelectorPrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    const stringList = U.string.zeroBreaks(content), selectors = [];

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
                if (prefix.selector[selector] && prefix.selector[selector][group]) result[group].score++;
                return (prefix.selector[selector] && prefix.selector[selector][group]) || prefix.selector[selector] || selector;
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
        if (prefix.property[content] && prefix.property[content][group])
            a.push(prefix.property[content][group]);
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
        if (prefix.atRule[rule] && prefix.atRule[rule][group])
            a[group] = prefix.atRule[rule][group];
        return a;
    }, {});
    result[""] = content
    return result
}

function getAtPropPrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    const result = prefixes.reduce((a, group) => {
        if (prefix.atRule[content] && prefix.atRule[content][group]) {
            a.push(prefix.atRule[content][group]);
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

function compose(object, minify = false, prefixes = ["webkit", "moz", "ms", "o"]) {
    const tab = minify ? "" : "    ", space = minify ? "" : " ", br = minify ? "" : "\n";
    let styleSheet = [];

    for (const key in object) {
        const value = object[key];
        if ((typeof value) === "object") {
            const subObject = propListBuild(value); 
            if (key[0] === "@") {
                const selectors = Object.entries(getAtRulePrefixes(key, prefixes));
                selectors.forEach(([group, selector]) => styleSheet.push(selector, "{", ...compose(subObject, minify, [group]).map(i => tab + i), "}" + br))
            } else {
                styleSheet.push(...getSelectorPrefixes(key, prefixes), "{", ...compose(subObject, minify, prefixes).map(i => tab + i), "}" + br)
            }
        }
        else {
            if (key[0] === "@") {
                styleSheet.push(...getAtPropPrefixes(key, prefixes).map(rule => rule + " " + value + ";"))
            } else {
                styleSheet.push(key + ":" + space + value + ";")
            }
        }
    }
    return styleSheet
}

function styleSwitch(object) {


}

export default {
    object: (object, minify = false) => {
        const styleSheet = compose(object, minify);
        return styleSheet.join(minify ? "" : "\n");
    },
    switch: (object) => {
        const styleSheet = styleSwitch(object);
        compose(styleSheet)
    }
}