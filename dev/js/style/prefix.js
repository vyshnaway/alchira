import Use from "../utils/main.js";
import palletes from "./color.js";
import * as CACHE from "../data/cache.js";
function forAttribute(content, prefixes = CACHE.ROOT.vendors) {
    const attrVals = CACHE.STATIC.Prefix.attributes[content];
    if (!attrVals) {
        return { "": content };
    }
    const result = {};
    Object.entries(attrVals).forEach(([vendor, value]) => {
        if (prefixes.includes(vendor)) {
            result[vendor] = value;
        }
    });
    result[""] = content;
    return result;
}
function forValues(attribute, value, prefixes = CACHE.ROOT.vendors) {
    const cleanValue = Use.code.uncomment.Css(value);
    const venVals = CACHE.STATIC.Prefix.values?.[attribute]?.[cleanValue];
    if (!venVals) {
        return { "": value };
    }
    const result = {};
    Object.entries(venVals).forEach(([vendor, val]) => {
        if (prefixes.includes(vendor)) {
            result[vendor] = value.replace(cleanValue, val);
        }
    });
    result[""] = value;
    return result;
}
export function LoadProps(attribute = "", value = "", prefixes = CACHE.ROOT.vendors) {
    const results = [];
    const attributes = forAttribute(attribute, prefixes);
    const values = forValues(attribute, value);
    Object.entries(attributes).forEach(([attrVen, attr]) => {
        Object.entries(values).forEach(([valVen, val]) => {
            if (attrVen === valVen || valVen === "") {
                const valvars = palletes(val);
                valvars.forEach(v => results.push([attr, v]));
            }
        });
    });
    return results;
}
export function forAtRule(content = "", prefixes = CACHE.ROOT.vendors) {
    let index = content.indexOf(" ");
    index = index < 0 ? content.length : index;
    const rule = content.slice(0, index), data = content.slice(index);
    const result = {};
    prefixes.forEach((group) => {
        if (CACHE.STATIC.Prefix.atrules[rule] && CACHE.STATIC.Prefix.atrules[rule][group]) {
            result[group] = CACHE.STATIC.Prefix.atrules[rule][group] + data;
        }
    }, {});
    result[""] = content;
    return result;
}
export function forPseudos(content = "", prefixes = CACHE.ROOT.vendors) {
    const stringList = Use.string.zeroBreaks(content, [","]).map((i) => i.trim()), selectors = [];
    stringList.forEach((string = "") => {
        const result = Object.fromEntries([...CACHE.ROOT.vendors, ""].map(ven => [ven, { out: "", score: 0 }]));
        prefixes.forEach((group) => {
            result[group].out = string.replace(/:+[\w-]+/g, (selector) => {
                if (CACHE.STATIC.Prefix.pseudos[selector] && CACHE.STATIC.Prefix.pseudos[selector][group]) {
                    result[group].score++;
                    return CACHE.STATIC.Prefix.pseudos[selector][group];
                }
                if (CACHE.STATIC.Prefix.pseudos[selector]) {
                    return selector;
                }
                return selector;
            });
        });
        selectors.push(...Object.values(result).reduce((acc, item) => {
            if (item.score) {
                acc.push(item.out);
            }
            return acc;
        }, []), string);
    });
    const finalIndex = selectors.length - 1;
    const result = selectors.map((s, i) => (finalIndex !== i ? s + "," : s));
    return result;
}
//# sourceMappingURL=prefix.js.map