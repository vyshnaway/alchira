import U from "../Utils/index.js";
import read from "./block.js";
import compile from "./compile.js"
import SHORTHAND from "../shorthand.js";
import { stash, lists, env } from "../executor.js";

function xtylemerge(classList) {
    const styles = {}, preBinds = [], postBinds = [];
    for (const className of classList) {
        if (stash.indexStyles[stash.styleRefers[className]?.index]) {
            const index = stash.styleRefers[className].index;
            U.object.multiMerge([styles, stash.indexStyles[index].object[""]], true);
            preBinds.push(...stash.indexStyles[index].preBinds)
            postBinds.push(...stash.indexStyles[index].postBinds)
        }
    }
    return { styles, preBinds, postBinds };
};

function SCANNER(content, sourceSelector, filePath) {
    const response = read(content);
    const variables = response.variables;
    const merged = xtylemerge(response.adds);
    const
        preBinds = [...merged.preBinds, ...response.preBinds],
        postBinds = [...merged.postBinds, ...response.postBinds];

    response.binds.forEach(bind => /(^-|\$-)/.test(bind) ?
        preBinds.push(bind) : postBinds.push(bind))


    const styles = U.object.deepMerge(merged.styles, {
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
        const result = SCANNER(response.allBlocks[selector], sourceSelector + " >> " + selector, filePath)
        variables.push(...result.variables);
        preBinds.push(...result.preBinds)
        postBinds.push(...result.postBinds)
        styles[selector] = result.styles
    }

    return { preBinds, postBinds, styles, variables }
}

export default {
    SCANNER: (content) => SCANNER(content, "AXIOM", "xtyles"),
    RENDER: (content) => compile(styleObj,),
    CSSBULK: (sources = []) => {
        const selectors = {};
        sources.forEach(source => {
            const { stamp, fileName, extension, filePath, metaFront, content } = source;
            const scannedObj = read(content).allBlocks;
            for (const selector in scannedObj) {
                const metaSelector = U.string.normalize(selector[0] === "." ? selector.slice(1) : selector);
                const stampSelector = stamp + metaSelector;
                const scannedStyle = SCANNER(scannedObj[selector], selector, filePath);
                selectors[stampSelector] = {
                    index: ++env.counter,
                    data: {
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

        return Object.keys(stash.indexStyles);
    },
    TAG: ({ scope, selector, styles, collection }, metaFront, filePath) => {
        const metaClass = scope + metaFront + U.string.normalize(selector);
        const compiled = {}, preBinds = [], postBinds = [];

        for (let style in styles) {
            const query = SHORTHAND.RENDER(style);
            const styleObj = SCANNER(styles[style], style === "" ? selector : `${selector} >> ${style}`, filePath)
            lists.postBinds.push(...styleObj.postBinds)
            lists.preBinds.push(...styleObj.preBinds)
            postBinds.push(...styleObj.postBinds)
            preBinds.push(...styleObj.preBinds)

            if (!compiled[query.rule]) compiled[query.rule] = {}
            if (Object.keys(styleObj.styles).length)
                compiled[query.rule][query.selector] = styleObj.styles
        }

        if (selector !== "") {
            stash.indexStyles[++env.counter] = {
                collection,
                preBinds,
                postBinds,
                metaClass,
                object: compiled
            }

            switch (scope) {
                case "global": stash.styleGlobals = env.counter;
                    break;
                case "local": stash.styleLocals[filePath][selector] = env.counter;
                    break;
            }
        }
    }
}