import Use from "../Utils/index.js"
import loadColorFallback from "./color.js"

const PREFIX = {
    clrprops: [],
    atRule: {},
    selector: {},
    property: {},
    values: {},
}

export default function SavePrefix({
    clrprops,
    elements,
    atrules,
    classes,
    props,
    values,
}) {
    PREFIX.clrprops = clrprops;
    PREFIX.selector = { ...classes, ...elements };
    PREFIX.property = props;
    PREFIX.atRule = atrules;
    PREFIX.values = values;
}

export function getSelectorPrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
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
                if (PREFIX.selector[selector] && PREFIX.selector[selector][group]) result[group].score++;
                return (PREFIX.selector[selector] && PREFIX.selector[selector][group]) || PREFIX.selector[selector] || selector;
            })
        })

        selectors.push(...Object.values(result).reduce((acc, item) => {
            if (item.score) acc.push(item.out);
            return acc;
        }, []), string)
    })
    const finalIndex = selectors.length - 1;
    const result = selectors.map((s, i) => (finalIndex !== i) ? s + "," : s);
    // console.log(result)
    return result;
}

export function getAtRulePrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    let index = content.indexOf(" ");
    index = index < 0 ? content.length : index
    const rule = content.slice(0, index), data = content.slice(index);

    const result = prefixes.reduce((a, group) => {
        if (PREFIX.atRule[rule] && PREFIX.atRule[rule][group])
            a[group] = PREFIX.atRule[rule][group] + data;;
        return a;
    }, {});
    result[""] = content
    // console.log(result)
    return result
}

export function getAtPropPrefixes(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    let index = content.indexOf(" ");
    index = index < 0 ? content.length : index
    const rule = content.slice(0, index), data = content.slice(index);

    const result = prefixes.reduce((a, group) => {
        if (PREFIX.atRule[rule] && PREFIX.atRule[rule][group]) {
            a.push(PREFIX.atRule[rule][group] + data);
        }
        return a;
    }, []);
    result.push(content)
    // console.log(result)
    return result;
}


export function getPropPrefixes(property = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    const result = prefixes.reduce((a, group) => {
        if (PREFIX.property[property] && PREFIX.property[property][group])
            a.push(PREFIX.property[property][group]);
        return a;
    }, []);
    result.push(property)
    // console.log(result)
    return result;
}