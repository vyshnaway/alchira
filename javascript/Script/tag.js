import classExtract from "./value.js";
import { FileCursor } from "./file.js"
import { APP } from "../data-meta.js";

const bracePair = {
    "{": "}",
    "[": "]",
    "(": ")",
    "'": "'",
    "`": "`",
    '"': '"',
}, openBraces = ["[", "{", "(", "'", '"', "`"], closeBraces = ["]", "}", ")"];

export const xtyleTag = `<${APP.styleTag} />`;
const tagRegex = new RegExp(`<\\s*${APP.styleTag}\\s*/\\s*>`)
const tagCheck = (string) => tagRegex.test(string);

export default function tagScan(content, action, classProps, fileData) {
    const startMarker = FileCursor.marker++;
    let deviance = 0,
        ch = content[FileCursor.marker],
        classList = [],
        braceTrack = [],
        tagObject = {
            element: "",
            attributes: {},
        },
        styleObject = {
            rowMarker: FileCursor.rowMarker,
            columnMarker: FileCursor.colMarker,
            tagCount: FileCursor.tagCount,
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
        ch = content[FileCursor.marker++];
        if (ch === "\n") { FileCursor.rowMarker++; FileCursor.colMarker = 0 }
        else FileCursor.colMarker++;
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
                    const result = classExtract(value, action, fileData, FileCursor.tagCount);
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

    const renderedTag = `<${tagObject.element}${Object.entries(tagObject.attributes)
        .reduce((A, [P, V]) => A += " " + P + ((V === "") ? "" : "=" + V), "")}>`;
    const replacement = (tagObject.element !== APP.styleTag) ? renderedTag :
        (tagCheck(content.slice(startMarker, FileCursor.marker))) ? xtyleTag : "";


    return {
        ok,
        marker: FileCursor.marker,
        rowMarker: FileCursor.rowMarker,
        columnMarker: FileCursor.colMarker,
        reading: Boolean(ch),
        content: ok ? replacement : fragment,
        classList,
        styleObject
    }
}