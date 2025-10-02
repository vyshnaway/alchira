import * as style from "../style.js";
import { H1 } from "../tag.js";
import { canvas, fmt, preset } from "../root.js";
const padBothSides = (str, totalLength) => {
    const totalPadding = totalLength - str.length;
    const startPadding = Math.floor(totalPadding / 2);
    const endPadding = totalPadding - startPadding;
    return " ".repeat(startPadding) + str + " ".repeat(endPadding);
};
const modifyString = (str) => {
    str = str.substring(1, str.length - 1);
    if (str.startsWith(" ")) {
        str = str.substring(1, str.length - 1);
    }
    else {
        str = str.substring(0, str.length - 2);
    }
    return ">" + str + "<";
};
export default (string) => {
    const previewFrames = Math.ceil(string.length / 16);
    const renders = [], preview = [
        ...new Array(previewFrames * 2).fill(["", "", canvas.divider.mid, ""]),
        ...new Array(previewFrames).fill([
            "",
            fmt(canvas.divider.top, style.AS_Bold, style.AS_Underline, ...preset.title),
            "",
            "",
        ]),
        ...new Array(previewFrames).fill([
            "",
            canvas.divider.btm,
            "·" + padBothSides("·", canvas.width() - 2) + "·",
            canvas.divider.top,
            "",
        ]),
        ...new Array(previewFrames).fill([
            "",
            canvas.divider.mid,
            ">" + padBothSides("-", canvas.width() - 2) + "<",
            canvas.divider.mid,
            "",
        ]),
        ...new Array(previewFrames).fill([
            "",
            canvas.divider.top,
            ">>" + padBothSides("×", canvas.width() - 4) + "<<",
            canvas.divider.btm,
            "",
        ]),
    ].map((frame) => fmt(frame.join("\n"), style.AS_Bold, ...preset.title));
    string = "   " + string + "   ";
    while (string.length !== 1 && string.length !== 2) {
        string = modifyString(string);
        renders.unshift(fmt(H1(string, []), style.AS_Bold, ...preset.title));
    }
    return preview.concat(renders);
};
//# sourceMappingURL=0.title.js.map