import { canvas } from './0.root'; // Renamed to lowercase
import { style } from './1.style';  // Renamed to lowercase

const textFormatter = { // Changed to named export
    H1: (heading) => {
        const minWidth = 10;
        const width = Math.max(canvas.width, minWidth);
        const lines = [];
        let currentLine = "";
        const words = heading.split(" ");
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (currentLine.length + word.length + 1 <= width - 6) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);
        const paddedLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const padding = width - 6 - line.length;
            const leftPad = " ".repeat(Math.max(0, Math.floor(padding / 2)));
            const rightPad = " ".repeat(Math.max(0, Math.ceil(padding / 2)));
            paddedLines.push(`>>>${leftPad}${line}${rightPad}<<<`);
        }

        return [
            '',
            canvas.divider.mid,
            ...paddedLines,
            canvas.divider.mid,
            '',
        ].join("\n") + canvas.unstyle;
    },

    H2: (heading) => {
        return [
            canvas.divider.mid,
            heading,
            canvas.divider.mid,
            '',
        ].join('\n') + canvas.unstyle;
    },

    H3: (heading) => {
        return [
            canvas.divider.mid,
            heading,
            ''
        ].join('\n') + canvas.unstyle;
    },

    H4: (heading) => {
        return [
            heading,
            '',
        ].join('\n') + canvas.unstyle;
    },

    H5: (heading) => {
        return [
            heading,
        ].join('\n') + canvas.unstyle;
    },

    P: (content) =>
        canvas.tab() + content + canvas.unstyle + '\n',

    Li: (str) => // Changed parameter name to str
        style.bold[canvas.settings.tertiary]('>') + canvas.tab() + str + canvas.unstyle,

    Br: (repeat = 1) =>
        '\n'.repeat(repeat) + canvas.unstyle,

    Hr: (character = '─') =>
        '\n' + character.charAt(0).repeat(canvas.width) + canvas.unstyle,

    Tab: (repeat = 1) =>
        canvas.tab(repeat) + canvas.unstyle,

    Div: (content) =>
        content + canvas.unstyle,
};


export default textFormatter;