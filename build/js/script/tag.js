import * as _Style from "../type/style.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";
import VALUE from "./value.js";
import * as CACHE from '../data/cache.js';
import Cursor from "./_cursor.js";
const bracePair = {
    "{": "}",
    "[": "]",
    "(": ")",
    "'": "'",
    "`": "`",
    '"': '"',
};
export const openBraces = Object.keys(bracePair);
export const closeBraces = ["]", "}", ")"];
export default function scanner(fileData, classProps = [], action, fileCursor = new Cursor(fileData.content)) {
    const classesList = [], attachments = [], braceTrack = [], nativeAttributes = {}, styleDeclarations = {
        elid: 0,
        element: "",
        elvalue: "",
        symclasses: [],
        attributes: {},
        scope: _Style._Type.NULL,
        tagCount: ++fileCursor.active.cycle,
        rowIndex: fileCursor.active.rowMarker,
        colIndex: fileCursor.active.colMarker,
        endMarker: 0,
        comments: [],
        styles: {},
        attachstring: "",
    };
    let deviance = 0, attr = "", value = "", awaitBrace = "", ok = false, isVal = false, selfClosed = false, classSynced = false, fallbackAquired = false;
    while (fileCursor.active.marker < fileCursor.content.length) {
        const ch = fileCursor.increment();
        if (fileCursor.active.last !== "\\") {
            if (!fallbackAquired && (fileCursor.active.next === "<")) {
                fallbackAquired = true;
                fileCursor.savefallback();
            }
            if (awaitBrace === ch) {
                braceTrack.pop();
                deviance = braceTrack.length;
                awaitBrace = bracePair[braceTrack[deviance - 1]];
            }
            else if (openBraces.includes(ch) && !["'", '"', "`"].includes(awaitBrace)) {
                braceTrack.push(ch);
                deviance = braceTrack.length;
                awaitBrace = bracePair[ch];
            }
            else if (deviance === 0 && closeBraces.includes(ch)) {
                break;
            }
            if (deviance === 0 && [" ", "\n", "\r", ">", "\t"].includes(ch) && (attr !== "")) {
                const tr_Attr = attr.trim();
                const tr_Value = value.trim();
                if (!styleDeclarations.element.length) {
                    styleDeclarations.elid = CACHE.ROOT.customElements[tr_Attr] || 0;
                    styleDeclarations.element = tr_Attr;
                    styleDeclarations.elvalue = tr_Value;
                }
                else if (tr_Attr === "&") {
                    if (tr_Value.length) {
                        tr_Value.slice(1, -1).split("\n").map(l => {
                            const commentTrimmed = l.trim();
                            if (commentTrimmed.length) {
                                styleDeclarations.comments.push(commentTrimmed);
                            }
                        });
                    }
                }
                else if (/^[\w\-]+\$+[\w\-]+$/i.test(tr_Attr)) {
                    if (styleDeclarations.symclasses.length === 0) {
                        if (tr_Attr.includes("$$$$")) {
                            styleDeclarations.scope = _Style._Type.NULL;
                        }
                        else if (fileData.manifesting.lookup.type === "ARTIFACT") {
                            styleDeclarations.scope = _Style._Type.ARTIFACT;
                        }
                        else if (tr_Attr.includes("$$$")) {
                            styleDeclarations.scope = _Style._Type.PUBLIC;
                        }
                        else if (tr_Attr.includes("$$")) {
                            styleDeclarations.scope = _Style._Type.GLOBAL;
                        }
                        else {
                            styleDeclarations.scope = _Style._Type.LOCAL;
                        }
                        if (styleDeclarations.scope !== _Style._Type.NULL) {
                            styleDeclarations.styles[""] = tr_Value;
                        }
                    }
                    styleDeclarations.symclasses.push(tr_Attr);
                }
                else if (tr_Attr.endsWith("&")) {
                    if (tr_Value.length) {
                        styleDeclarations.styles[tr_Attr] = tr_Value;
                    }
                }
                else if (classProps.includes(tr_Attr)) {
                    classSynced = true;
                    const result = VALUE(tr_Value, action, fileData, fileCursor.active);
                    if (result.classList.length) {
                        classesList.push(result.classList);
                    }
                    if (result.attachments.length) {
                        attachments.push(...result.attachments);
                    }
                    nativeAttributes[tr_Attr] = result.scribed;
                }
                else {
                    nativeAttributes[tr_Attr] = tr_Value;
                }
                isVal = false;
                attr = "";
                value = "";
            }
            if (deviance === 0 && (ch === ">" || ch === ";" || ch === ',' || ch === "<")) {
                ok = ch === ">";
                break;
            }
        }
        if ((deviance === 0 && ![" ", "=", "\n", "\r", "\t", ">"].includes(ch)) || deviance !== 0) {
            if (isVal) {
                value += ch;
            }
            else {
                attr += ch;
            }
        }
        else if (deviance === 0 && ch === "=") {
            isVal = true;
        }
    }
    ;
    styleDeclarations.endMarker = fileCursor.active.marker + (fileCursor.active.char === "<" ? 0 : 1);
    if (ok) {
        selfClosed = fileCursor.content[fileCursor.active.marker - 1] === '/';
    }
    else if (fallbackAquired) {
        fileCursor.loadfallback();
    }
    return {
        ok,
        selfClosed,
        classSynced,
        classesList,
        attachments,
        nativeAttributes,
        styleDeclarations,
    };
}
//# sourceMappingURL=tag.js.map