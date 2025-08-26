import { canvas, style, format } from "./0.root.js";
import tag from "./1.tag.js";
import list from "./2.list.js";
import write from "./3.write.js";

import play from "./frames/index.js";
import render from "./_.render.js";


const task = (string: string, rowshift = -1) => {
  if (canvas.config.taskActive && canvas.config.postActive) {
    render.write(
      [
        rowshift >= 0 ? tag.Br(rowshift) : "",
        tag.Div(format(">>>", style.AS_Bold, ...canvas.config.primary)),
        canvas.tab,
        tag.Div(format(string + ".", style.AS_Bold, style.AS_Italic, ...canvas.config.tertiary)),
        tag.Br(1),
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift,
    );
  }
};

const step = (string: string, rowshift = -1) => {
  if (canvas.config.taskActive && canvas.config.postActive) {
    render.write(
      [
        rowshift >= 0 ? tag.Br(rowshift) : "",
        tag.Div(format(">>>", style.AS_Rare, ...canvas.config.primary)),
        canvas.tab,
        tag.Div(format(string + " ...", style.AS_Italic, ...canvas.config.tertiary)),
      ].join(""),
      rowshift < 0 ? -rowshift : rowshift,
    );
  }
};

export default {
  tag,
  list,
  style,
  canvas,
  render,
  INIT: init,
  TASK: task,
  STEP: step,
  POST: post,
  PLAY: play,
  MOLD: write,
  MAKE: format,
};
