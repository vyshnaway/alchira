import Use from "../Utils/index.js";
import READS from "./block.js";
import SHORTHAND from "../Worker/shorthand.js";
import { STASH } from "../data-cache.js";
import { DATA } from "../data-meta.js";

const INDEX = {
    NOW: 0,
    BIN: [],
    DECLARE: () => {
        const number = INDEX.BIN.length ? INDEX.BIN.pop() : ++INDEX.NOW;
        return { number, class: "_" + Use.string.enCounter(number + 768) };
    },
    DISPOSE: (...indexes) => {
        indexes.forEach(index => {
            INDEX.BIN.push(index);
            delete STASH.Index2StylesObject[index];
        })
    },
    RESET: () => {
        INDEX.NOW = 0;
        Object.keys(STASH.Index2StylesObject).forEach(key => delete STASH.Index2StylesObject(key))
    }
}

function xtylemerge(classList = []) {
    let result = {}, preBinds = [], postBinds = [];
    classList.forEach((className) => {
        const index = STASH.LibraryStyle2Index[className];
        if (index) {
            const found = STASH.Index2StylesObject[index];
            preBinds.push(...found.preBinds)
            postBinds.push(...found.postBinds)
            result = Use.object.multiMerge([result, found.object[""]], true);
        }
    })
    return { result, preBinds, postBinds }
};

function SCANNER(content, initial, sourceSelector) {

    const response = READS(content);
    const variables = response.variables;
    const merged = xtylemerge(response.assemble);
    const preBinds = [...merged.preBinds, ...response.preBinds],
        postBinds = [...merged.postBinds, ...response.postBinds];

    const styles = Use.object.deepMerge(merged.result, {
        ...Object.entries(response.atProps).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = DATA.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue;
            return acc;
        }, {}),
        ...Object.entries(response.properties).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = DATA.WATCH ? `${propValue}/* ${initial} ${sourceSelector} */` : propValue;
            return acc;
        }, {})
    });

    for (let selector in response.allBlocks) {
        const result = SCANNER(response.allBlocks[selector], initial, sourceSelector + " -> " + selector)
        variables.push(...result.variables);
        preBinds.push(...result.preBinds)
        postBinds.push(...result.postBinds)
        styles[selector] = result.styles;
    }

    return { preBinds, postBinds, styles, variables }
}

function CSSCANNER(content, initial = '') {
    const variables = [];
    const response = READS(content, true);
    const styles = response.XatProps;
    const preBinds = [], postBinds = [];

    response.XallBlocks.forEach(([key, value]) => {
        const result = SCANNER(value, initial, key)
        variables.push(...result.variables);
        preBinds.push(...result.preBinds)
        postBinds.push(...result.postBinds)
        styles.push([key, result.styles])
    })

    return { preBinds, postBinds, styles, variables }
}

function CSSLIBRARY(fileDatas = [], initial = '') {
    const selectors = {};
    fileDatas.forEach(source => {
        source.data.usedIndexes = new Set;
        const { stamp, filePath, metaFront, content } = source.data;
        const scannedObj = READS(content).allBlocks;
        for (const selector in scannedObj) {
            const metaSelector = Use.string.normalize(selector[0] === "." ? selector.slice(1) : selector);
            const stampSelector = stamp + metaSelector;
            const scannedStyle = SCANNER(scannedObj[selector], initial + " : " + filePath + " ||", selector);

            const CLX = INDEX.DECLARE();
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
    const type = !selector.length ? "ESSENTIAL" : isGlobal ? "GLOBAL" : "LOCAL"
    const metaClass = type + metaFront + `R${rowMarker}C${columnMarker}__` + Use.string.normalize(selector);
    const compiled = {}, preBinds = [], postBinds = [], errors = [], essentials = [];

    for (let subSelector in styles) {
        const query = SHORTHAND.RENDER(subSelector);
        if (!query.status) errors.push(query.error)
        const styleObj = SCANNER(styles[subSelector], `${type} : ${filePath} ||`, selector + subSelector);
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
        const CLX = INDEX.DECLARE()
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
    return { isEssentials: selector === "", index: INDEX.NOW, errors, essentials, preBinds, postBinds };
}

export default {
    CSSLIBRARY,
    CSSCANNER,
    TAGSTYLE,
    INDEX
}