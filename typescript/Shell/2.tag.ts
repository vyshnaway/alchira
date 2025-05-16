import canvas from './0.root';
import { style } from './1.style';

interface TextFormatter {
    H1: (heading: string) => string;
    H2: (heading: string) => string;
    H3: (heading: string) => string;
    H4: (heading: string) => string;
    H5: (heading: string) => string;
    P: (content: string) => string;
    Li: (str: string) => string;
    Br: (repeat?: number) => string;
    Hr: (character?: string) => string;
    Tab: (repeat?: number) => string;
    Div: (content: string) => string;
}

const textFormatter: TextFormatter = {
    H1: (heading: string): string => {
        const minWidth = 10;
        const width = Math.max(canvas.width, minWidth);
        const lines: string[] = [];
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
        const paddedLines: string[] = [];
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

    H2: (heading: string): string => {
        return [
            canvas.divider.mid,
            heading,
            canvas.divider.mid,
            '',
        ].join('\n') + canvas.unstyle;
    },

    H3: (heading: string): string => {
        return [
            canvas.divider.mid,
            heading,
            ''
        ].join('\n') + canvas.unstyle;
    },

    H4: (heading: string): string => {
        return [
            heading,
            '',
        ].join('\n') + canvas.unstyle;
    },

    H5: (heading: string): string => {
        return [
            heading,
        ].join('\n') + canvas.unstyle;
    },

    P: (content: string): string =>
        canvas.tab() + content + canvas.unstyle + '\n',

    Li: (str: string): string =>
        style.bold[canvas.settings.tertiary]('>') + canvas.tab() + str + canvas.unstyle,

    Br: (repeat: number = 1): string =>
        '\n'.repeat(repeat) + canvas.unstyle,

    Hr: (character: string = '─'): string =>
        '\n' + character.charAt(0).repeat(canvas.width) + canvas.unstyle,

    Tab: (repeat: number = 1): string =>
        canvas.tab(repeat) + canvas.unstyle,

    Div: (content: string): string =>
        content + canvas.unstyle,
};

export default textFormatter;