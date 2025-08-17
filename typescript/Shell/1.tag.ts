import { canvas, style, format } from "./0.root.js";

const textFormatter = {
  H1: (content: string) => {
    const minWidth = 10;
    const width = Math.max(canvas.width(), minWidth);
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

    return format(
      ["", canvas.divider.mid, ...paddedLines, canvas.divider.mid, ""].join("\n")
    );
  },

  H2: (content: string) => format([canvas.divider.mid, content, canvas.divider.mid, ""].join("\n")),

  H3: (content: string) => format([canvas.divider.mid, content, ""].join("\n")),

  H4: (content: string) => format([content, canvas.divider.mid].join("\n")),

  H5: (content: string) => format([content, ""].join("\n")),

  H6: (content: string) => format([content].join("\n")),

  P: (content: string) => format(canvas.tab + content) + "\n",

  Li: (content: string,) => format(">", style.TS_Bold, ...canvas.config.tertiary) + canvas.tab + content,

  Div: (content: string) => format(content),

  Hr: (content = "─") => format("\n" + content.charAt(0).repeat(Math.ceil(canvas.width() / content.length)).slice(0, canvas.width())),

  Br: (repeat = 1) => format("\n".repeat(repeat)),

  Tab: (count = 1) => format(canvas.tab.repeat(count)),
};

export default textFormatter;
