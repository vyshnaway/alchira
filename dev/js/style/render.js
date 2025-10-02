/* eslint-disable @typescript-eslint/no-explicit-any */
import * as INDEX from "../data/index.js";
import * as CACHE from "../data/cache.js";
import * as LOADPREFIX from "./prefix.js";
import Use from "../utils/main.js";
import HASHRULE from "./hashrule.js";
function objectSwitch(srcObject) {
    if (!srcObject || typeof srcObject !== "object") {
        return {};
    }
    const output = { "": {} };
    Object.entries(srcObject).forEach(([outerKey, outerObject]) => {
        Object.entries(outerObject).forEach(([innerKey, innerObject]) => {
            if (innerKey === "") {
                output[""][outerKey] = innerObject;
            }
            else {
                const keyseq = [...JSON.parse(innerKey), outerKey].map((key, index, array) => {
                    if ((index === 0) || (array[index - 1].startsWith("@") || key.startsWith("@"))) {
                        return key;
                    }
                    else {
                        return `& ${key}`;
                    }
                });
                HASHRULE.WRAPPER(output, keyseq, innerObject);
            }
        });
    });
    return output;
}
function styleSwitch(object) {
    const result = {};
    const inits = [], mins = [], maxs = [], flats = [];
    const switched = objectSwitch(object);
    Object.keys(switched).forEach((key) => {
        const min = key.indexOf("min");
        const max = key.indexOf("max");
        if (key !== "") {
            if (min === -1 && max === -1) {
                inits.push(key);
            }
            else if (min < max) {
                mins.push(key);
            }
            else if (min > max) {
                maxs.push(key);
            }
            else if (min === max) {
                flats.push(key);
            }
        }
    });
    inits.forEach(key => result[key] = switched[key]);
    Object.assign(result, switched[""]);
    [...flats.sort(), ...mins.sort().reverse(), ...maxs.sort()].forEach((key) => (result[key] = switched[key]));
    return result;
}
function LoadVendors(collection = {}, vendor = "") {
    return vendor == ""
        ? CACHE.ROOT.vendors.filter((ven) => !Object.prototype.hasOwnProperty.call(collection, ven)) : [vendor];
}
function partialsArrayPrefixer(object, vendors = LoadVendors()) {
    const result = [];
    Object.entries(object).forEach(([key, value]) => {
        if (typeof value === "object") {
            if (Object.keys(value).length) {
                result.push([key, value]);
            }
        }
        else if (key[0] === "@") {
            Object.values(LOADPREFIX.forAtRule(key, vendors)).forEach((r) => result.push([r + ";", ""]));
        }
        else {
            LOADPREFIX.LoadProps(key, value, vendors).forEach(([k, v]) => {
                if (k === key || !object[k]) {
                    result.push([k + ":", v + ";"]);
                }
            });
        }
    });
    return result;
}
// Pending to handle states &:* states.
function unNester(selector = "", object = {}, cumulates = {}) {
    const compounds = {}, pseudoclass = {}, pseudoelement = {}, children = {}, myself = {};
    const holder = myself[selector] = {};
    Object.entries(object).forEach(([subSelector, subContent]) => {
        if (typeof subContent === "object") {
            if (subSelector[0] === "&") {
                const xelector = selector + subSelector.slice(1);
                if (subSelector[1] === ":") {
                    unNester(xelector, subContent, subSelector[2] === ":" ? pseudoelement : pseudoclass);
                }
                else if (subSelector[1] === " ") {
                    unNester(xelector, subContent, children);
                }
                else {
                    unNester(xelector, subContent, compounds);
                }
            }
            else {
                unNester(subSelector, subContent, holder);
            }
        }
        else {
            holder[subSelector] = subContent;
        }
    });
    Object.assign(cumulates, compounds, pseudoclass, myself, pseudoelement, children);
    return cumulates;
}
function _objectCompose(object, minify = false, vendors = LoadVendors(), first = true) {
    const tab = minify ? "" : "  ", space = minify ? "" : " ", styleSheet = [];
    partialsArrayPrefixer(object, vendors).forEach(([key, value]) => {
        if (typeof value === "object") {
            if (Object.keys(value).length) {
                if (!minify && first) {
                    styleSheet.push("");
                }
                if (key[0] === "@") {
                    const atPrefixes = LOADPREFIX.forAtRule;
                    Object.entries(atPrefixes(key, vendors)).forEach(([vendor, selector]) => {
                        const composedObject = _objectCompose(value, minify, LoadVendors(atPrefixes, vendor), false);
                        if (composedObject.length) {
                            styleSheet.push(selector, "{", ...composedObject.map((i) => tab + i), "}");
                        }
                    });
                }
                else {
                    const composedObject = _objectCompose(value, minify, vendors, false);
                    if (Object.keys(composedObject).length) {
                        styleSheet.push(...LOADPREFIX.forPseudos(key, vendors));
                        styleSheet.push("{", ...composedObject.map((i) => tab + i), "}");
                    }
                }
            }
        }
        else if (key[0] === "@") {
            styleSheet.push(key);
        }
        else {
            styleSheet.push(key + space + value);
        }
    });
    return styleSheet;
}
function ComposePrefixed(array, minify = !CACHE.STATIC.DEBUG) {
    const styleSheet = [];
    array.forEach(([key, value]) => {
        if (typeof value === "object") {
            const unNested = unNester(key, value);
            if (Object.keys(unNested).length) {
                styleSheet.push(..._objectCompose(unNested, minify));
            }
        }
        else {
            styleSheet.push(..._objectCompose({ [key]: value }, minify));
        }
    });
    return styleSheet.join(minify ? "" : "\n");
}
function ComposeSwitched(selectorIndex, minify = !CACHE.STATIC.DEBUG) {
    const objectMap = {};
    const classOrder = [];
    selectorIndex.forEach(([selector, index]) => {
        objectMap[selector] = INDEX.FETCH(index).style_object;
        classOrder.push(selector);
    });
    const preped = styleSwitch(objectMap);
    return ComposePrefixed(Object.entries(preped), minify);
}
function ArtifactPartial(object, minify = true) {
    const array = Object.entries(object);
    const styleSheet = [];
    const tab = minify ? "" : "  ";
    array.forEach(([key, value]) => {
        if (typeof value === "object") {
            if (Object.keys(value).length) {
                styleSheet.push(key, "{", ...ArtifactPartial(value).map((i) => tab + i), "}");
            }
        }
        else if (key[0] === "@") {
            styleSheet.push(key + ";");
        }
        else {
            styleSheet.push(key + ": " + value + ";");
        }
    });
    return styleSheet;
}
function ComposeArtifact(index) {
    const style = INDEX.FETCH(index);
    const isPublic = style.symclass.includes("$$$");
    let element = "";
    if (style.snippet_staple.length) {
        element = "staple";
    }
    else if (style.metadata.summon.length) {
        element = "summon";
    }
    else {
        element = "style";
    }
    ;
    const symclass = style.definent.includes("$$$") ? style.definent : `$---${Use.string.enCounter(style.index || 0)}`;
    const stylesheet = isPublic
        ? Object.entries(style.style_object).map(([k, v]) => [k, ArtifactPartial(v).join("")])
        : [["", ""]];
    const attributes = isPublic ?
        Object.entries(style.metadata.attributes).map(([k, v]) => [k, Use.string.minify(v)])
        : [];
    const innertext = Use.string.minify(style.snippet_staple || style.metadata.summon || ArtifactPartial(style.snippet_style).join(""));
    return {
        element,
        symclass,
        innertext,
        stylesheet,
        attributes,
        attachments: []
    };
}
export default {
    Prefixed: ComposePrefixed,
    Switched: ComposeSwitched,
    Artifact: ComposeArtifact,
};
//# sourceMappingURL=render.js.map