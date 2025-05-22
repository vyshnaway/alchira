import Use from "../Utils/index.js";
import READS from "./block.js";
import SHORTHAND from "../Worker/shorthand.js";
import { STASH, ENV, DECLARESTYLE } from "../data-cache.js";

function xtylemerge(classList = []) {
    return classList.reduce((A, className) => {
        const index = STASH.LibraryStyle2Index[className];
        if (index) {
            A = Use.object.multiMerge([A, STASH.Index2StylesObject[index].object[""]], true);
        }
        return A
    }, {})
};

function SCANNER(content, filePath, sourceSelector) {
    const response = READS(content);
    const variables = response.variables;
    const merged = xtylemerge(response.adds);
    const preBinds = response.preBinds, postBinds = response.postBinds;

    response.binds.forEach(bind => /(^-|\$-)/.test(bind) ?
        preBinds.push(bind) : postBinds.push(bind))

    const styles = Use.object.deepMerge(merged, {
        ...Object.entries(response.atProps).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = ENV.devMode ? `${propValue} /* [${sourceSelector}] FROM [${filePath}] */` : propValue;
            return acc;
        }, {}),
        ...Object.entries(response.properties).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = ENV.devMode ? `${propValue} /* [${sourceSelector}] FROM [${filePath}] */` : propValue;
            return acc;
        }, {})
    });

    Object.assign(styles, Use.object.deepMerge(merged, {
        ...Object.entries(response.atProps).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = ENV.devMode ? `${propValue} /* [${sourceSelector}] FROM [${filePath}] */` : propValue;
            return acc;
        }, {}),
        ...Object.entries(response.properties).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = ENV.devMode ? `${propValue} /* [${sourceSelector}] FROM [${filePath}] */` : propValue;
            return acc;
        }, {})
    }))

    for (let selector in response.allBlocks) {
        const result = SCANNER(response.allBlocks[selector], filePath, sourceSelector + " -> " + selector)
        variables.push(...result.variables);
        preBinds.push(...result.preBinds)
        postBinds.push(...result.postBinds)
        styles[selector] = result.styles
    }

    return { preBinds, postBinds, styles, variables }
}

function XCANNER(content, filePath, sourceSelector) {
    const variables = [];
    const response = READS(content, true);
    const styles = response.XatProps;
    const preBinds = [], postBinds = [];

    response.XallBlocks.forEach(([key, value]) => {
        const result = SCANNER(value, filePath, `${sourceSelector} +> ${key}`)
        variables.push(...result.variables);
        preBinds.push(...result.preBinds)
        postBinds.push(...result.postBinds)
        styles.push([key, result.styles])
    })

    return { preBinds, postBinds, styles, variables }
}

function CSSMULTI(fileDatas = []) {
    const selectors = {};
    fileDatas.forEach(source => {
        source.data.usedIndexes = new Set;
        const { stamp, filePath, metaFront, content } = source.data;
        const scannedObj = READS(content).allBlocks;
        for (const selector in scannedObj) {
            const metaSelector = Use.string.normalize(selector[0] === "." ? selector.slice(1) : selector);
            const stampSelector = stamp + metaSelector;
            const scannedStyle = SCANNER(scannedObj[selector], filePath, selector);

            const CLX = DECLARESTYLE();
            source.data.usedIndexes.add(CLX.number)
            selectors[stampSelector] = {
                index: CLX.number,
                data: {
                    class: CLX.class,
                    scope: "global",
                    selector,
                    preBinds: scannedStyle.preBinds,
                    postBinds: scannedStyle.postBinds,
                    metaClass: metaFront + metaSelector,
                    object: { "": scannedStyle.styles }
                }
            }
        }
    })

    for (const selector in selectors) {
        STASH.Index2StylesObject[selectors[selector].index] = selectors[selector].data;
        STASH.LibraryStyle2Index[selector] = selectors[selector].index;
    }

    return { tillStyles: Object.keys(STASH.LibraryStyle2Index), exclusiveStyles: Object.keys(selectors) };
}

function TAGSTYLE({ isGlobal, selector, styles, rowMarker, columnMarker }, metaFront, filePath) {
    const metaClass = (isGlobal ? "GLOBAL" : "LOCAL") + metaFront + `R${rowMarker}C${columnMarker}__` + Use.string.normalize(selector);
    const compiled = {}, preBinds = [], postBinds = [], errors = [], CLX = DECLARESTYLE(), essentials = [];

    for (let subSelector in styles) {
        const query = SHORTHAND.RENDER(subSelector);
        if (!query.status) errors.push(query.error)
        const styleObj = SCANNER(styles[subSelector], filePath, subSelector === "" ? selector : `${selector} => ${subSelector}`)
        postBinds.push(...styleObj.postBinds)
        preBinds.push(...styleObj.preBinds)

        if (Object.keys(styleObj).length) {
            if (selector === "") {
                if (query.rule === "") {
                    if (query.subSelector !== "") { compiled[query.subSelector] = styleObj.styles }
                } else {
                    if (query.subSelector === "") {
                        compiled[query.rule] = styleObj.styles;
                    }
                    else {
                        if (!compiled[query.rule]) compiled[query.rule] = {}
                        compiled[query.rule][query.subSelector] = styleObj.styles;
                    }
                }
            } else {
                if (!compiled[query.rule]) compiled[query.rule] = {}
                if (query.subSelector === "")
                    compiled[query.rule] = { ...compiled[query.rule], ...styleObj.styles }
                else
                    compiled[query.rule]["&" + query.subSelector] = styleObj.styles;
            }
        }
    }
    if (selector === "") {
        Object.entries(compiled).forEach(([key, value]) => {
            essentials.push([key, value]);
        })
    } else {
        STASH.Index2StylesObject[CLX.number] = {
            class: CLX.class,
            scope: isGlobal,
            selector,
            preBinds,
            postBinds,
            metaClass,
            object: compiled
        }
    }

    return { index: ENV.styleCount, errors, essentials, preBinds, postBinds };
}

export default {
    XCANNER,
    CSSMULTI,
    TAGSTYLE
}