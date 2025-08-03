import canvas from "./0.root";
import style from "./1.style";

const textFormatter = {
  H1: (content: string) => {
    const minWidth = 10;
    const width = Math.max(canvas.settings.width, minWidth);
    const lines = [];
    let currentLine = "";
    const words = content.split(" ");
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width - 6) {
        currentLine += (currentLine ? " " : "") + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    lines.push(currentLine);
    const paddedLines = [];
    for (const line of lines) {
      const padding = width - 6 - line.length;
      const leftPad = " ".repeat(Math.max(0, Math.floor(padding / 2)));
      const rightPad = " ".repeat(Math.max(0, Math.ceil(padding / 2)));
      paddedLines.push(`>>>${leftPad}${line}${rightPad}<<<`);
    }

    return (
      ["", canvas.divider.mid, ...paddedLines, canvas.divider.mid, ""].join(
        "\n",
      ) + canvas.unstyle
    );
  },

  H2: (content: string) => {
    return (
      [canvas.divider.mid, content, canvas.divider.mid, ""].join("\n") +
      canvas.unstyle
    );
  },

  H3: (content: string) => {
    return [canvas.divider.mid, content, ""].join("\n") + canvas.unstyle;
  },

  H4: (content: string) => {
    return [content, canvas.divider.mid].join("\n") + canvas.unstyle;
  },

  H5: (content: string) => {
    return [content, ""].join("\n") + canvas.unstyle;
  },

  H6: (content: string) => {
    return [content].join("\n") + canvas.unstyle;
  },

  P: (content: string) => canvas.tab + content + canvas.unstyle + "\n",

  Li: (
    content: string, // Changed parameter name to str
  ) =>
    style.bold[canvas.settings.tertiary](">") +
    canvas.tab +
    content +
    canvas.unstyle,

  Br: (repeat = 1) => "\n".repeat(repeat) + canvas.unstyle,

  Hr: (character = "─") =>
    "\n" + character.charAt(0).repeat(canvas.settings.width) + canvas.unstyle,

  Tab: (count = 1) => canvas.tab.repeat(count) + canvas.unstyle,

  Div: (content: string) => content + canvas.unstyle,
};

export default textFormatter;
