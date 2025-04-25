function classExtract(string, proxyLoad) {
    let marker = 0,
        ch = string[marker],
        quotes = ["'", "`", '"'],
        activeQuote = "",
        active = false,
        entry = "",
        classList = [],
        proxy = "";

    while (ch !== undefined) {

        if (ch === activeQuote) {
            proxy += (proxyLoad ? "entry" : entry) + ch
            active = false;
            activeQuote = "";
            classList.push(entry);
            entry = ""
        } else if (active) {
            if (ch === " ") {
                proxy += (proxyLoad ? "entry" : entry) + ch
                classList.push(entry);
                entry = ""
            } else entry += ch
        } else {
            proxy += ch;
            if (quotes.includes(ch)) {
                active = true;
                activeQuote = ch;
            }
        }

        ch = string[++marker];
    }

    return { classList, proxy }
}

const bracePair = {
    "{": "}",
    "[": "]",
    "(": ")",
    "'": "'",
    "`": "`",
    '"': '"',
}, openBraces = ["[", "{", "(", "'", '"', "`"], closeBraces = ["]", "}", ")"];

export default function scan(content, start = 0, proxyLoad = false, classProp = "class") {

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
            selector: "",
            styles: "",
            varients: {}
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
            } else if (/^[\w\-]*\$+[\w\-]+$/i.test(attr)) {
                styleObject.selector = attr;
                styleObject.styles = value;
            } else if (/[\$@#]/.test(attr)) {
                styleObject.varients[attr] = value;
            } else {
                if (attr === classProp) {
                    const result = classExtract(value, proxyLoad);
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
