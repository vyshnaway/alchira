import { STASH } from "../data-cache.js";
import FORGE from "../forgent.js";
import * as LOADPREFIX from "./vendor.js";
import Use from "../Utils/index.js"

function LoadVendors(collection = {}, vendor = '') {
    return vendor == '' ? ["webkit", "moz", "ms", "o"].filter(ven => !collection.hasOwnProperty(ven)) : [vendor]
}

function StylePartialsArray(object, vendors = LoadVendors()) {
    const result = [];
    Object.entries(object).forEach(([key, value]) => {
        if (typeof value === "object") {
            if (Object.keys(value).length) result.push([key, value]);
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
                if (subSelector[1] === " " || subSelector[1] === ":")
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

function objectCompose(object, minify = false, vendors = LoadVendors(), first = true) {
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


function stylesheetCreator(array, minify) {
    const styleSheet = [];

    array.forEach(([key, value]) => {
        const processed = typeof value === "object" ? unNester(key, value) : { [key]: value };
        styleSheet.push(...objectCompose(processed, minify))
    })

    return styleSheet.join(minify ? "" : "\n")
}


function rawCompose(selectorObjectArray = [], tab = "  ") {
    const styleSheet = [];

    selectorObjectArray.forEach(([key, value]) => {
        if ((typeof value) === "object") {
            styleSheet.push(key, "{", ...rawCompose(Object.entries(value), tab).map(i => tab + i), "}")
        }
        else if (key[0] === "@") {
            styleSheet.push(key) + ";";
        } else {
            styleSheet.push(key + ': ' + value + ";");
        }
    })

    return styleSheet
}

function portableCreator(bundle = "bundle", version = "0.0.0") {
    const tab = "    ", portable = [`# ${bundle}@${version}`, "", "> $$XCSS Portable-Xtylesheet"];
    const preBinds = new Set(), postBinds = new Set();
    const prefix = Use.string.normalize(bundle);

    Object.entries(STASH.GlobalsStyle2Index).forEach(([selector, index]) => {
        const pre = [], post = [], style = STASH.Index2StylesObject[index];

        style.preBinds.forEach(bind => {
            let i = STASH.LibraryStyle2Index[bind];
            if (i) { preBinds.add(bind); pre.push(prefix + "~~" + bind) }
        })
        style.postBinds.forEach(bind => {
            let i = STASH.LibraryStyle2Index[bind];
            if (i) { postBinds.add(bind); post.push(prefix + "~~" + bind) }
        })

        // console.log(Object.entries(style.object))
        portable.push(
            '',
            `## Selector: ${selector}`,
            '',
            "````html",
            "<xtyle",
            ...(Object.entries(style.object).reduce((accum, [subSelector, block]) => {
                if (subSelector === "") {
                    accum.push(
                        `${prefix}~${selector}="`,
                        tab + `@pre-binds ${post.join(" ")};`,
                        tab + `@post-binds ${pre.join(" ")};`,
                        ...rawCompose(Object.entries(block), tab).map(line => tab + line),
                        '"'
                    )
                } else {
                    const [rule, query] = subSelector.split(" ");
                    const attribute = `${rule.slice(1)}@{${query}}`
                    accum.push(
                        `${attribute}="`,
                        ...rawCompose(Object.entries(block), tab).map(line => tab + line),
                        '"'
                    )
                }
                return accum;
            }, [])).map(line => tab + line),
            "/>",
            "````",
        )
    })
    const bindObject = FORGE.bindIndex(preBinds, postBinds, true);
    const preBindContent = rawCompose(bindObject.preBinds.map(([k, v]) => [prefix + "~~" + k, v])).join("\n");
    const postBindContent = rawCompose(bindObject.postBinds.map(([k, v]) => [prefix + "~~" + k, v])).join("\n");

    return {
        portable: portable.join("\n"),
        depends: preBindContent + "\n" + postBindContent
    }
}

export default {
    Portable: portableCreator,
    Stylesheet: stylesheetCreator
}