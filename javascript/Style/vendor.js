import Use from "../Utils/index.js"
import cleaner from "../Worker/cleaner.js";
import { LoadColorFallback } from "./color.js"

const PREFIX = {
    clrprops: [],
    atRule: {},
    selector: {},
    attributes: {},
    values: {},
}

export default function SavePrefix({
    clrprops,
    elements,
    atrules,
    classes,
    attributes,
    values,
}) {
    PREFIX.clrprops = clrprops;
    PREFIX.selector = { ...classes, ...elements };
    PREFIX.attributes = attributes;
    PREFIX.atRule = atrules;
    PREFIX.values = values;
}


export function forAtRule(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    let index = content.indexOf(" ");
    index = index < 0 ? content.length : index
    const rule = content.slice(0, index), data = content.slice(index);

    const result = {}
    prefixes.forEach((group) => {
        if (PREFIX.atRule[rule] && PREFIX.atRule[rule][group])
            result[group] = PREFIX.atRule[rule][group] + data;;
    }, {});
    result[""] = content;

    return result
}

export function forSelector(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
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

    return result;
}

function forAttribute(content = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    const attrVals = PREFIX.attributes[content]
    if (!attrVals) return { "": content };

    const result = {};
    Object.entries(attrVals).forEach(([vendor, value]) => {
        if (prefixes.includes(vendor)) result[vendor] = value;
    });
    result[""] = content;

    return result;
}

function forValues(attribute, value, prefixes = ["webkit", "moz", "ms", "o"]) {
    const cleanValue = cleaner.uncomment.Css(value);
    const venVals = PREFIX.values?.[attribute]?.[cleanValue];
    if (!venVals) return { "": value };

    const result = {};
    Object.entries(venVals).forEach(([vendor, val]) => {
        if (prefixes.includes(vendor)) result[vendor] = value.replace(cleanValue, val);
    });
    result[""] = value;

    return result;
}

export function LoadProps(attribute = "", value = "", prefixes = ["webkit", "moz", "ms", "o"]) {
    const results = [];
    const attributes = forAttribute(attribute, prefixes);

    if (PREFIX.clrprops.includes(attribute)) {
        const values = LoadColorFallback(value);
        Object.values(attributes).forEach((attr) => values.forEach((val) => results.push([attr, val])))
    } else {
        const values = forValues(attribute, value);
        Object.entries(attributes).forEach(([attrVen, attr]) => {
            Object.entries(values).forEach(([valVen, val]) => {
                if (attrVen === valVen || valVen === '') {
                    results.push([attr, val]);
                }
            })
        })
    }


    return results
}