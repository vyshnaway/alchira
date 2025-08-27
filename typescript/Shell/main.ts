import * as play from "./play/main.js";

import * as render from "./_.render.js";
import * as root from "./0.root.js";
import * as tag from "./1.tag.js";
import * as list from "./2.list.js";


function task(string: string, rowshift = -1) {
  if (root.canvas.config.taskActive && root.canvas.config.postActive) {
    render.write(
      [
        rowshift >= 0 ? tag.Br(rowshift) : "",
        root.fmt(">>>", root.style.AS_Bold, ...root.canvas.preset.primary),
        root.canvas.tab,
        root.fmt(string + ".", root.style.AS_Bold, root.style.AS_Italic, ...root.canvas.preset.tertiary),
        tag.Br(1),
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift,
    );
  }
};


function step(string: string, rowshift = -1) {
  if (root.canvas.config.taskActive && root.canvas.config.postActive) {
    render.write(
      [
        rowshift >= 0 ? tag.Br(rowshift) : "",
        root.fmt(">>>", root.style.AS_Rare, ...root.canvas.preset.primary),
        root.canvas.tab,
        root.fmt(string + " ...", root.style.AS_Italic, ...root.canvas.preset.tertiary),
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift,
    );
  }
};

function MAKE(
  heading: string,
  contents: string[] = [],
  ...listDeplyment: [type: list._T_list, intent: number, preset: string[], ...styles: string[]][]
) {
  if (contents.length) { contents.push(root.fmt()); }
  return [
    heading,
    ...listDeplyment.reduce((A, [type, intent, preset, ...styles]) => {
      A = type(A, intent, preset, ...styles);
      return A;
    }, contents)
  ].join("\n");
};

export default {
  tag,
  list,
  render,
  init: root.init,
  canvas: root.canvas,
  preset: root.canvas.preset,
  style: root.style,
  PLAY: play,
  MAKE,
  POST: root.post,
  TASK: task,
  STEP: step,
  FMT: root.fmt,
};
