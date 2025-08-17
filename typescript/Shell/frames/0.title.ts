import { canvas, style, format } from "../0.root.js";
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
        format(canvas.divider.top, style.TS_Bold, style.TS_Underline, ...canvas.config.title),
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
    ].map((frame) => format(frame.join("\n"), style.TS_Bold, ...canvas.config.title));

  string = "   " + string + "   ";
  while (string.length !== 1 && string.length !== 2) {
    string = modifyString(string);
    renders.unshift(
      format(blockType.Chapter(string, []), style.TS_Bold, ...canvas.config.title),
    );
  }

  return preview.concat(renders);
};
