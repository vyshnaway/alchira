import Use from "../Utils/index.js";
import READS from "./block.js";
import SHORTHAND from "../Worker/shorthand.js";
import { DATA, NAV, CACHE } from "../data-cache.js";

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
            delete CACHE.Index2StylesObject[index];
        })
    },
    RESET: () => {
        INDEX.NOW = 0;
        Object.keys(CACHE.Index2StylesObject).forEach(key => delete CACHE.Index2StylesObject(key))
    }
}

function xtylemerge(classList = []) {
    let result = {}, preBinds = [], postBinds = [];
    classList.forEach((className) => {
        const index = CACHE.LibraryStyle2Index[className];
        if (index) {
            const found = CACHE.Index2StylesObject[index];
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

function CSSLIBRARY(fileDatas = [], initial = '', forPortable = false) {
    const selectors = {}, IndexMap = forPortable ? CACHE.PortableStyle2Index : CACHE.LibraryStyle2Index;
    fileDatas.forEach(source => {
        source.usedIndexes = new Set();
        const { stamp, filePath, metaFront, content, group } = source;
        const scannedObj = READS(content).allBlocks;

        for (const selector in scannedObj) {
            const declarations = [(forPortable ? NAV.folder.portables : NAV.folder.library) + "/" + filePath];
            const stampSelector = stamp + Use.string.normalize(selector, ["$"], ["\\", "."]);
            const scannedStyle = SCANNER(scannedObj[selector], initial + " : " + filePath + " ||", selector);

            const index = (IndexMap[stampSelector] || 0) + (selectors[stampSelector] || 0);
            const InStash = CACHE.Index2StylesObject[index];
            const CLX = index ? { number: InStash.index, class: InStash.class } : INDEX.DECLARE();
            if (index) declarations.push(...CACHE.Index2StylesObject[index].declarations);

            source.usedIndexes.add(CLX.number)
            selectors[stampSelector] = CLX.number;
            CACHE.Index2StylesObject[CLX.number] = {
                index: CLX.number,
                class: CLX.class,
                scope: group,
                selector: stampSelector,
                object: { "": scannedStyle.styles },
                preBinds: scannedStyle.preBinds,
                postBinds: scannedStyle.postBinds,
                metaClass: metaFront + "_" + Use.string.normalize(stampSelector, [], [], ["$", "/"]),
                declarations,
            }
        }
    })

    for (const selector in selectors) {
        IndexMap[selector] = selectors[selector];
    }

    return { tillStyles: Object.keys(CACHE.LibraryStyle2Index), exclusiveStyles: Object.keys(selectors) };
}

function TAGSTYLE({
    scope,
    selector,
    styles,
    rowMarker,
    columnMarker
}, metaFront, filePath, normalPath, IndexMap = {}) {
    const declarations = [`${normalPath}:${rowMarker}:${columnMarker}`];
    const isPortable = scope === "";
    const metaClass = scope + metaFront + `\\:${rowMarker}\\:${columnMarker}_` + Use.string.normalize(selector, [], [], isPortable ? ["$", "/"] : ["$"]);
    const object = {}, preBinds = [], postBinds = [], errors = [], essentials = [];

    for (let subSelector in styles) {
        const query = SHORTHAND.RENDER(subSelector, declarations[0], isPortable);
        if (!query.status) errors.push(query.error)
        const styleObj = SCANNER(styles[subSelector], `${scope} : ${filePath} ||`, selector + subSelector);

        postBinds.push(...styleObj.postBinds)
        preBinds.push(...styleObj.preBinds)

        if (Object.keys(styleObj).length) {
            if (selector === "") {
                if (query.rule === "") {
                    if (query.subSelector !== "") { object[query.subSelector] = styleObj.styles }
                } else {
                    if (query.subSelector === "") {
                        object[query.rule] = styleObj.styles;
                    }
                    else {
                        if (!object[query.rule]) object[query.rule] = {}
                        object[query.rule][query.subSelector] = styleObj.styles;
                    }
                }
            } else {
                if (!object[query.rule]) object[query.rule] = {}
                if (query.subSelector === "")
                    object[query.rule] = { ...object[query.rule], ...styleObj.styles }
                else
                    object[query.rule]["&" + query.subSelector] = styleObj.styles;
            }
        }
    }

    let isDuplicate;
    if (selector === "") {
        essentials.push(...Object.entries(object));
    } else {
        const index = (IndexMap[selector] ?? 0) + (CACHE.LibraryStyle2Index[selector] ?? 0);
        const InStash = CACHE.Index2StylesObject[index];

        const CLX = index ? {
            number: InStash.index,
            class: InStash.class
        } : INDEX.DECLARE();

        if (index) {
            declarations.push(...InStash.declarations);
            isDuplicate = true
        } else {
            isDuplicate = false;
            IndexMap[selector] = CLX.number;
        }

        CACHE.Index2StylesObject[CLX.number] = {
            index: CLX.number,
            class: CLX.class,
            scope: scope === "GLOBAL",
            selector,
            object,
            preBinds,
            postBinds,
            metaClass,
            declarations,
        }
    }

    return { index: INDEX.NOW, errors, essentials, preBinds, postBinds, isDuplicate };
}

export default {
    CSSLIBRARY,
    CSSCANNER,
    TAGSTYLE,
    INDEX
}