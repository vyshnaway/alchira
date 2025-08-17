import { canvas, style, format } from "./0.root.js";
import tag from "./1.tag.js";
import list from "./2.list.js";
import write from "./3.write.js";

import play from "./frames/index.js";
import render from "./4.post.js";

function initialize(
  taskActive = true,
  postActive = true,
  tabWidth = 2,
) {
  const width = canvas.width();

  canvas.tab = canvas.tab[0].repeat(tabWidth);
  canvas.config.taskActive = taskActive;
  canvas.config.postActive = postActive;
  canvas.divider.low = canvas.divider.low[0].repeat(width);
  canvas.divider.mid = canvas.divider.mid[0].repeat(width);
  canvas.divider.top = canvas.divider.top[0].repeat(width);
}

const task = (string: string, rowshift = -1) => {
  if (canvas.config.taskActive && canvas.config.postActive) {
    render.write(
      [
        rowshift >= 0 ? tag.Br(rowshift) : "",
        tag.Div(format(">>>", ...canvas.config.primary, style.TS_Rare)),
        canvas.tab,
        tag.Div(format(string + ".", style.TS_Bold, style.TS_Italic, ...canvas.config.tertiary)),
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
        tag.Div(format(">>>", style.TS_Rare, style.TS_Bold, ...canvas.config.primary)),
        canvas.tab,
        tag.Div(format(string + " ...", style.TS_Italic, ...canvas.config.tertiary)),
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
  initialize,
  TASK: task,
  STEP: step,
  PLAY: play,
  MOLD: write,
  POST: format,
};
