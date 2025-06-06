import { divider, canvas, canvas.settings.width } from "../0.root.js";
import style from "../1.style.js";
import tag from "../2.tag.js";
import { blockType } from "../4.compose.js";

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
            divider.mid,
            ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            style.boldUline[canvas.title](tag.Hr('‾')),
            '', ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            divider.low,
            '·' + padBothSides('·', canvas.settings.width - 2) + '·',
            divider.top,
            ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            divider.mid,
            '>' + padBothSides('-', canvas.settings.width - 2) + '<',
            divider.mid,
            ''
        ]),
        ...new Array(previewFrames).fill([
            '',
            divider.top,
            '>>' + padBothSides('×', canvas.settings.width - 4) + '<<',
            divider.low,
            ''
        ]),
    ].map(frame => style.bold[canvas.title](frame.join('\n')));
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
        renders.unshift(style.bold[canvas.title](blockType.Chapter(string, [])));
    }

    return preview.concat(renders);
}