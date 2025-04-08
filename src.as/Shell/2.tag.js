import { canvas, width as canvasWidth, divider, tab, unstyle } from './0.root.js'
import style from './1.style.js';

export default {
    H1: (heading) => {
        const minWidth = 10;
        const width = Math.max(canvasWidth, minWidth);
        const lines = [];
        let currentLine = "";
        for (const word of heading.split(" ")) {
            if (currentLine.length + word.length + 1 <= width - 6) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);
        const paddedLines = lines.map(line => {
            const padding = width - 6 - line.length;
            const leftPad = " ".repeat(Math.max(0, Math.floor(padding / 2)));
            const rightPad = " ".repeat(Math.max(0, Math.ceil(padding / 2)));
            return `>>>${leftPad}${line}${rightPad}<<<`;
        });

        return [
            '',
            divider.mid,
            ...paddedLines,
            divider.mid,
            '',
        ].join("\n") + unstyle;
    },
    H2: (heading) => {
        return [
            divider.mid,
            heading,
            divider.mid,
            '',
        ].join('\n') + unstyle
    },
    H3: (heading) => {
        return [
            divider.mid,
            heading,
            ''
        ].join('\n') + unstyle
    },
    H4: (heading) => {
        return [
            heading,
            '',
        ].join('\n') + unstyle
    },
    H5: (heading) => {
        return [
            heading,
        ].join('\n') + unstyle
    },
    P: (content) =>
        tab() + content + unstyle + '\n',
    Li: (string) =>
        string = style.bold[canvas.tertiary]('>') + tab() + string + unstyle,
    Br: (repeat = 1) =>
        '\n'.repeat(repeat) + unstyle,
    Hr: (character = '─') =>
        '\n' + character.charAt(0).repeat(canvasWidth) + unstyle,
    Tab: (repeat = 1) =>
        tab(repeat) + unstyle,
    Div: (content) =>
        content + unstyle,
}