import * as root from "./0.root.js";

export function H1(content: string) {
  const minWidth = 10;
  const width = Math.max(root.canvas.width(), minWidth);
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

  return root.format(["", root.canvas.divider.mid, ...paddedLines, root.canvas.divider.mid, ""].join("\n"));
}

export function H2(content: string) {
  return root.format([root.canvas.divider.mid, content, root.canvas.divider.mid, ""].join("\n"));
}

export function H3(content: string) {
  return root.format(["", content, root.canvas.divider.mid, ""].join("\n"));
}

export function H4(content: string) {
  return root.format([root.canvas.divider.mid, content, ""].join("\n"));
}

export function H5(content: string) {
  return root.format([content, ""].join("\n"));
}

export function H6(content: string) {
  return root.format([content + root.canvas.tab + root.canvas.divider.mid[0].repeat(root.canvas.width() - root.canvas.tab.length - content.length), ""].join("\n"));
}

export function P(content: string) {
  return root.format(root.canvas.tab + content) + "\n";
}

export function Li(content: string) {
  return root.format(">" + root.canvas.tab + content);
}

export function Div(content: string) {
  return root.format(content);
}

export function Hr(content = root.canvas.divider.mid[0]) {
  return root.format("\n" + content.charAt(0).repeat(Math.ceil(root.canvas.width() / content.length)).slice(0, root.canvas.width()));
}

export function Br(repeat = 1) {
  return root.format("\n".repeat(repeat < 0 ? 0 : repeat));
}

export function Tab(repeat = 1) {
  return root.format(root.canvas.tab.repeat(repeat < 0 ? 0 : repeat));
}
