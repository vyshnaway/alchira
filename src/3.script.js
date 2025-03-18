// import { devianx } from "./devianx.js";
import $ from "./Docs/package.js"


String.prototype.splice = function (start, deleteCount, ...items) {
    return this.slice(0, start) + items.join('') + this.slice(start + deleteCount);
};

const renderStyler = (string, globalStylePrefix, localStylePrefix) => {
    string = string.replace(/\s+/g, ' ')
    try {
        if (pseudoElements.includes(string.match(/^[a-zA-Z]+/)[0]))
            string = string.replace(/^[a-zA-Z]+/, match => "::" + match);
        else if (string.match(/^[a-zA-Z]+/)[0])
            string = string.replace(/^[a-zA-Z]+/, match => ":" + match);
    } catch { }

    return string
}

const tagEngine = (tag, shortHands, prefix) => {
    let styleRules = { default: { style: tag.cxcClass.value } };
    tag.cxcAttributes.forEach(attr => {

        let [query, selector] = renderShorthand(attr.name, shortHands).split(/\$(.*)/);
        if (query !== '') {
            query = query.replace(/#+/g, '#').replaceAll(" ", "");
            query = '@' + query.replace("!", "not ").replace("&", " and ").replace("|", " or ").replace("@", ' ')
        }
        else
            query = 'default';

        if (selector) selector = renderStyler(selector, prefix.global, prefix.local);
        else selector = 'style';

        if (!styleRules[query]) styleRules[query] = {};
        styleRules[query][selector] = attr.value;
    })
    return { [tag.cxcClass.name]: styleRules }
}

const tagObjectModifier = (tagObj, index, rgx, prefixConfig) => {
    const element = tagObj.element;

    let cxcClass = Object.keys(tagObj.attributes).filter(attr =>
        rgx.cxcClass.test(attr))[0];
    const attributes = Object.entries(tagObj.attributes).map(attr => {
        return {
            name: attr[0],
            value: attr[1]
        }
    })
    const classList = attributes.filter((attribute) =>
        rgx.classList.test(attribute.name))[0].value.split(' ');
    const htmlAttributes = attributes.filter((attribute) =>
        !(rgx.htmlAttributes.test(attribute.name)));
    const cxcAttributes = attributes.filter((attribute) =>
        rgx.cxcAttributes.test(attribute.name) && (attribute.name !== cxcClass));
    if (cxcAttributes.length || cxcClass) {
        if (!cxcClass) cxcClass = "$"
        cxcClass = {
            name: classNameGenerator(prefixConfig, cxcClass, index),
            value: attributes.filter(attribute => attribute.name === cxcClass)[0].value
        }
        classList.push(cxcClass.name)
    }
    const properties = tagObj.properties;
    return { element, classList, htmlAttributes, properties, cxcClass, cxcAttributes }
}

const rebuildTag = ({ element, classList, htmlAttributes, properties }) => {
    return (
        `${element} class="${classList.join(" ")}" ${htmlAttributes.map((attr) => `${attr.name}${attr.value === "" ? "" : `="${attr.value}"`}`).join(" ")} ${properties.join(" ")}`)
}

export const scriptEngine = (content, path, config) => {
    // console.time(path);
    // let searchFrom = 0;
    // let localClassIndex = 0;
    // let styleRules = {};
    // let continueParse = true;
    // let classIndex = localClassIndex;

    // let styleRef = path.split('/');
    // const [component, scriptType] = styleRef.pop().split('.');
    // const globalPrefix = config.prefix.globalStyle;
    // const localPrefix = config.prefix.localStyle + styleRef.pop()[0] + '_' + component;
    // const lazyPrefix = config.prefix.lazyStyle;
    // const stylePrefixConfig = { global: globalPrefix, local: localPrefix, lazy: lazyPrefix }
    // const scriptRgx = config.scriptSupportRgx[scriptType]
    // try {
    //     while (continueParse) {
    //         let { tagString, tagObj, stratsFrom, exitValid, tagParseReq, tagLength } = devianx(content, searchFrom, '<', '>');
    //         continueParse = exitValid;
    //         tagObj.attributes.class = tagObj.attributes.class.replace(/(^|(\s+))(l|g)\$((\s+)|$)/g, ' ')
    //             .replace(/(^|\s)g\$([a-zA-Z0-9]+)(\s|$)/g, ` ${globalPrefix}_$2$3`)
    //             .replace(/(^|\s)l\$([a-zA-Z0-9]+)(\s|$)/g, ` ${localPrefix}_$2$3`);
    //         if (tagParseReq) {
    //             const newTagObj = tagObjectModifier(tagObj, classIndex++, scriptRgx, stylePrefixConfig);
    //             styleRules = { ...styleRules, ...(tagEngine(newTagObj, config.shorthands, stylePrefixConfig)) };
    //             const newTagString = rebuildTag(newTagObj);
    //             searchFrom = stratsFrom + newTagString.length;
    //             content = content.splice(stratsFrom, tagLength, newTagString)
    //         } else {
    //             searchFrom = stratsFrom + tagLength;
    //         }
    //     }
    // } catch {
    //     console.timeEnd(path)
    //     let xtyleBlocks = 'css', object = 'object', preview = 'preview';
    //     return { content, css: xtyleBlocks, object, preview, styleRules }
    // }
}
