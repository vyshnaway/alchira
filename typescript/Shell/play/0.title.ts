import { canvas, style, fmt } from "../0.root.js";
import { blockType } from "../3.write.js";

const padBothSides = (str: string, totalLength: number) => {
  const totalPadding = totalLength - str.length;
  const startPadding = Math.floor(totalPadding / 2);
  const endPadding = totalPadding - startPadding;
  return " ".repeat(startPadding) + str + " ".repeat(endPadding);
};

const modifyString = (str: string) => {
  str = str.substring(1, str.length - 1);
  if (str.startsWith(" ")) {
    str = str.substring(1, str.length - 1);
  } else {
    str = str.substring(0, str.length - 2);
  }
  return ">" + str + "<";
};

export default (string: string) => {
  const previewFrames = Math.ceil(string.length / 16);
  const renders = [],
    preview = [
      ...new Array(previewFrames * 2).fill(["", "", canvas.divider.mid, ""]),
      ...new Array(previewFrames).fill([
        "",
        fmt(canvas.divider.top, style.AS_Bold, style.AS_Underline, ...canvas.preset.title),
        "",
        "",
      ]),
      ...new Array(previewFrames).fill([
        "",
        canvas.divider.low,
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
        canvas.divider.low,
        "",
      ]),
    ].map((frame) => fmt(frame.join("\n"), style.AS_Bold, ...canvas.preset.title));

  string = "   " + string + "   ";
  while (string.length !== 1 && string.length !== 2) {
    string = modifyString(string);
    renders.unshift(
      fmt(blockType.Chapter(string, []), style.AS_Bold, ...canvas.preset.title),
    );
  }

  return preview.concat(renders);
};
