import canvas from "../0.root.js";
import style from "../1.style.js";
import { blockType } from "../4.write.js";

export default (string) => {
    const padBothSides = (str, totalLength) => {
        const totalPadding = totalLength - str.length;
        const startPadding = Math.floor(totalPadding / 2);
        const endPadding = totalPadding - startPadding;
        return ' '.repeat(startPadding) + str + ' '.repeat(endPadding);
    };
    const previewFrames = Math.ceil(string.length / 16);
    const renders = [], preview = [
        ...new Array(previewFrames * 2).fill([
            '', '',
            canvas.divider.mid,
            ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            style.boldUline[canvas.settings.title](canvas.divider.top),
            '', ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            canvas.divider.low,
            '·' + padBothSides('·', canvas.width - 2) + '·',
            canvas.divider.top,
            ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            canvas.divider.mid,
            '>' + padBothSides('-', canvas.width - 2) + '<',
            canvas.divider.mid,
            ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            canvas.divider.top,
            '>>' + padBothSides('×', canvas.width - 4) + '<<',
            canvas.divider.low,
            ''
        ]),
    ].map(frame => style.bold[canvas.settings.title](frame.join('\n')));
    const modifyString = (str) => {
        str = str.substring(1, str.length - 1)
        if (str.startsWith(' ')) {
            str = str.substring(1, str.length - 1);
        } else {
            str = str.substring(0, str.length - 2);
        }
        return '>' + str + '<'
    };

    string = '   ' + string + '   ';
    while ((string.length !== 1) && (string.length !== 2)) {
        string = modifyString(string)
        renders.unshift(style.bold[canvas.settings.title](blockType.Chapter(string, [])));
    }

    return preview.concat(renders);
}