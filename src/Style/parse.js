import U from "../Utils/index.js";
import read from "./block.js";
import SHORTHAND from "../shorthand.js";
import { stash, lists, env, createXtyle, essentials } from "../executor.js";

function xtylemerge(classList = []) {
    return classList.reduce((A, className) => {
        const index = stash.styleRefers[className];
        if (index) {
            A = U.object.multiMerge([A, stash.indexStyles[index].object[""]], true);
        }
        return A
    }, {})
};

function SCANNER(content, filePath, sourceSelector) {
    const response = read(content);
    const variables = response.variables;
    const merged = xtylemerge(response.adds);
    const preBinds = response.preBinds, postBinds = response.postBinds;

    response.binds.forEach(bind => /(^-|\$-)/.test(bind) ?
        preBinds.push(bind) : postBinds.push(bind))

    const styles = U.object.deepMerge(merged, {
        ...Object.entries(response.atProps).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = env.devMode ? `${propValue} /* ${sourceSelector} @ ${filePath} */` : propValue;
            return acc;
        }, {}),
        ...Object.entries(response.properties).reduce((acc, [propKey, propValue]) => {
            acc[propKey] = env.devMode ? `${propValue} /* ${sourceSelector} @ ${filePath} */` : propValue;
            return acc;
        }, {})
    });


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
    const response = read(content, true);
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

function CSSBULK(sources = []) {
    const selectors = {};
    sources.forEach(source => {
        const { stamp, fileName, extension, filePath, metaFront, content } = source;
        const scannedObj = read(content).allBlocks;
        for (const selector in scannedObj) {
            const metaSelector = U.string.normalize(selector[0] === "." ? selector.slice(1) : selector);
            const stampSelector = stamp + metaSelector;
            const scannedStyle = SCANNER(scannedObj[selector], filePath, selector);
            const CLX = createXtyle();
            selectors[stampSelector] = {
                index: CLX.number,
                data: {
                    class: CLX.class,
                    scope: "global",
                    selector,
                    collection: [],
                    preBinds: scannedStyle.preBinds,
                    postBinds: scannedStyle.postBinds,
                    metaClass: metaFront + metaSelector,
                    object: { "": scannedStyle.styles }
                }
            }
        }
    })

    for (const selector in selectors) {
        stash.indexStyles[selectors[selector].index] = selectors[selector].data;
        stash.styleRefers[selector] = selectors[selector].index;
    }

    return Object.keys(stash.styleRefers);
}

function TAGSTYLE({ scope, selector, styles, collection }, metaFront, filePath) {
    const metaClass = scope + metaFront + U.string.normalize(selector);
    const compiled = {}, preBinds = [], postBinds = [];
    const CLX = createXtyle();

    for (let style in styles) {
        const query = SHORTHAND.RENDER(style);
        const styleObj = SCANNER(styles[style], filePath, style === "" ? selector : `${selector} => ${style}`)
        postBinds.push(...styleObj.postBinds)
        preBinds.push(...styleObj.preBinds)
        if(env.devMode) {
            styleObj.postBinds.forEach(E => lists.postBinds.add(E))
            styleObj.preBinds.forEach(E => lists.preBinds.add(E))
        }

        if (!compiled[query.rule]) compiled[query.rule] = {}
        if (Object.keys(styleObj.styles).length)
            compiled[query.rule][query.selector] = styleObj.styles
    }

    if (selector === "") {
        Object.keys(essentials).forEach(key => {
            if (key === "")
                essentials.push(...compiled[""]);
            else
                essentials.push(compiled[key]);
        })
        postBinds.forEach(E => lists.postBinds.add(E))
        preBinds.forEach(E => lists.preBinds.add(E))
    } else {
        stash.indexStyles[CLX.number] = {
            class: CLX.class,
            scope,
            selector,
            collection,
            preBinds,
            postBinds,
            metaClass,
            object: compiled
        }

        switch (scope) {
            case "global": stash.styleGlobals = env.styleCount;
                break;
            case "local": stash.styleLocals[filePath][selector] = env.styleCount;
                break;
        }
    }
}

export default {
    XCANNER,
    SCANNER,
    CSSBULK,
    TAGSTYLE
}