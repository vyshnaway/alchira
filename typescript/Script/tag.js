import classExtract from "./proxy.js";
import { env } from "../creator.js"
import { cursor } from "./file.js"

const bracePair = {
    "{": "}",
    "[": "]",
    "(": ")",
    "'": "'",
    "`": "`",
    '"': '"',
}, openBraces = ["[", "{", "(", "'", '"', "`"], closeBraces = ["]", "}", ")"];

export default function tagScan(content, action, classProps, fileData) {
    cursor.marker++;
    let deviance = 0,
        ch = content[cursor.marker],
        classList = [],
        braceTrack = [],
        tagObject = {
            element: "",
            attributes: {},
        },
        styleObject = {
            rowMarker: cursor.rowMarker,
            columnMarker: cursor.columnMarker,
            tagCount: cursor.tagCount,
            isGlobal: false,
            selector: "",
            styles: {},
        },
        attr = "",
        value = "",
        ok = false,
        isVal = false,
        awaitBrace;

    while (ch !== undefined) {
        ch = content[cursor.marker++];
        if (ch === "\n") { cursor.rowMarker++; cursor.columnMarker = 0 }
        else cursor.columnMarker++;
        // console.log({ CH: ch, cur: cursor.marker, row: cursor.rowMarker, col: cursor.columnMarker })

        if (awaitBrace === ch) {
            braceTrack.pop();
            deviance = braceTrack.length;
            awaitBrace = bracePair[braceTrack[deviance - 1]]
        } else if (openBraces.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
            braceTrack.push(ch);
            deviance = braceTrack.length;
            awaitBrace = bracePair[ch]
        } else if (deviance === 0 && closeBraces.includes(ch)) break;

        if ((deviance === 0 && ![" ", "=", "\n", "\r", "\t", ">"].includes(ch)) || deviance !== 0) {
            if (isVal) value += ch;
            else attr += ch;
        } else if (ch === "=") isVal = true;

        if (deviance === 0 &&
            [" ", "\n", "\r", ">", "\t"].includes(ch)
            & attr !== ""
        ) {
            if (!tagObject.element) {
                tagObject.element = attr;
                if (value !== "") styleObject.styles[""] = value.slice(1, -1);
            } else if (/^[\w\-]*\$+[\w\-]+$/i.test(attr)) {
                styleObject.selector = attr;
                if (/\$\$/.test(attr)) styleObject.isGlobal = true
                if (value !== "") styleObject.styles[""] = value.slice(1, -1);
            } else if (/[\$@#]/.test(attr)) {
                styleObject.styles[attr] = value.slice(1, -1);
            } else {
                if (classProps.includes(attr)) {
                    const result = classExtract(value, action, fileData, cursor.tagCount);
                    classList.push(...result.classList)
                    tagObject.attributes[attr] = result.scribed;
                } else tagObject.attributes[attr] = value;
            }
            isVal = false;
            attr = "";
            value = "";
        }

        if (deviance === 0 && ch === ">") { ok = true; break; }
        else if (deviance === 0 && ch === ";") break;
    }


    const newTag = tagObject.element === env.styleTag ? "" : "<" + tagObject.element +
        Object.entries(tagObject.attributes).reduce((A, [P, V]) => A += " " + P + ((V === "") ? "" : "=" + V), "") + ">";
    return {
        ok,
        marker: cursor.marker,
        rowMarker: cursor.rowMarker,
        columnMarker: cursor.columnMarker,
        reading: Boolean(ch),
        content: ok ? newTag : content.slice(cursor.marker, cursor.marker),
        classList,
        styleObject
    }
}
