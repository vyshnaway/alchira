import * as root from "./0.root.js";

export function H1(content = '', presets: string[] = [], ...styles: string[]) {
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

  return root.fmt(["", root.canvas.divider.mid, ...paddedLines, root.canvas.divider.mid, ""].join("\n"), ...presets, ...styles);
}

export function H2(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt([root.canvas.divider.mid, content, root.canvas.divider.mid, ""].join("\n"), ...presets, ...styles);
}

export function H3(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt(["", content, root.canvas.divider.mid, ""].join("\n"), ...presets, ...styles);
}

export function H4(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt([root.canvas.divider.mid, content, ""].join("\n"), ...presets, ...styles);
}

export function H5(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt([content, ""].join("\n"), ...presets, ...styles);
}

export function H6(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt([content + root.canvas.tab + root.canvas.divider.mid[0].repeat(root.canvas.width() - root.canvas.tab.length - content.length), ""].join("\n"), ...presets, ...styles);
}

export function P(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt(root.canvas.tab + content, ...presets, ...styles) + "\n";
}

export function Span(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt(content, ...presets, ...styles) + "\n";
}

export function Li(content = '', presets: string[] = [], ...styles: string[]) {
  return root.fmt(">" + root.canvas.tab + content, ...presets, ...styles);
}

export function Hr(content = root.canvas.divider.mid[0], presets: string[] = [], ...styles: string[]) {
  return root.fmt("\n" + content.charAt(0).repeat(Math.ceil(root.canvas.width() / content.length)).slice(0, root.canvas.width()), ...presets, ...styles);
}

export function Br(repeat = 1, presets: string[] = [], ...styles: string[]) {
  return root.fmt("\n".repeat(repeat < 0 ? 0 : repeat), ...presets, ...styles);
}

export function Tab(repeat = 1, presets: string[] = [], ...styles: string[]) {
  return root.fmt(root.canvas.tab.repeat(repeat < 0 ? 0 : repeat), ...presets, ...styles);
}
