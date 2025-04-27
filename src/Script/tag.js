import classExtract from "./proxy.x.js"

const bracePair = {
    "{": "}",
    "[": "]",
    "(": ")",
    "'": "'",
    "`": "`",
    '"': '"',
}, openBraces = ["[", "{", "(", "'", '"', "`"], closeBraces = ["]", "}", ")"];

export default function tagScan(content, start = 0, proxyLoad = false, classProp = "class") {

    let deviance = 0,
        marker = start + 1,
        ch = content[marker],
        classList = [],
        braceTrack = [],
        tagObject = {
            element: "",
            attributes: {},
        },
        styleObject = {
            scope: "style",
            selector: "",
            styles: {},
        },
        attr = "",
        value = "",
        ok = false,
        isVal = false,
        awaitBrace;

    while (ch !== undefined) {
        if (awaitBrace === ch) {
            braceTrack.pop();
            deviance = braceTrack.length;
            awaitBrace = bracePair[braceTrack[deviance - 1]]
        } else if (openBraces.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
            braceTrack.push(ch);
            deviance = braceTrack.length;
            awaitBrace = bracePair[ch]
        } else if (deviance === 0 && closeBraces.includes(ch)) break;

        if ((deviance === 0 && ![" ", "=", "\n", "\r", ">"].includes(ch)) || deviance !== 0) {
            if (isVal) value += ch;
            else attr += ch;
        } else if (ch === "=") isVal = true;

        if (deviance === 0 &&
            [" ", "\n", "\r", ">"].includes(ch)
            & attr !== ""
        ) {
            if (!tagObject.element) {
                tagObject.element = attr;
                if (value !== "") styleObject.styles[""] = value.slice(1, -1);
            } else if (/^[\w\-]*\$+[\w\-]+$/i.test(attr)) {
                styleObject.scope = /\$\$/.test(attr) ? "global" : "local"
                styleObject.selector = attr;
                if (value !== "") styleObject.styles[""] = value.slice(1, -1);
            } else if (/[\$@#]/.test(attr)) {
                styleObject.styles[attr] = value.slice(1, -1);
            } else {
                if (attr === classProp) {
                    const result = classExtract(value, proxyLoad);
                    styleObject.collection = result.collection;
                    classList.push(...result.classList)
                    tagObject.attributes[classProp] = result.proxy;
                } else tagObject.attributes[attr] = value;
            }

            isVal = false;
            attr = "";
            value = "";
        }

        if (ok) break
        else if (deviance === 0 && ch === ">") ok = true;
        else if (deviance === 0 && ch === ";") break;

        ch = content[++marker];
    }

    const newTag = tagObject.element === "$" ? "" : "<" + tagObject.element + Object.entries(tagObject.attributes)
        .reduce((A, [P, V]) => A += " " + P + ((V === "") ? "" : "=" + V), "") + ">";
    return {
        ok,
        marker,
        reading: Boolean(ch),
        content: ok ? newTag : content.slice(start, marker),
        classList,
        styleObject
    }
}
