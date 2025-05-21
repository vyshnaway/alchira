import canvas from "./0.root.js";
import style from "./1.style.js";
import tag from "./2.tag.js";
import list from "./3.list.js";
import write from './4.write.js'

import play from './frames/index.js'
import render from "../../interface/console.js";

const task = (string, rowshift = -1) => {
    if (canvas.settings.taskActive && canvas.settings.postActive)
        render.write([
            (rowshift >= 0) ? tag.Br(rowshift) : "",
            tag.Div(style.boldDim[canvas.settings.primary]('>>>')),
            canvas.tab,
            tag.Div(style.boldItalic[canvas.settings.tertiary](string + '.')),
            tag.Br(1)
        ].join(''), rowshift < 0 ? -rowshift : rowshift)
}

const step = (string, rowshift = -1) => {
    if (canvas.settings.taskActive && canvas.settings.postActive)
        render.write([
            (rowshift >= 0) ? tag.Br(rowshift) : "",
            tag.Div(style.boldDim[canvas.settings.primary]('>>>')),
            canvas.tab,
            tag.Div(style.italic[canvas.settings.tertiary](string + ' ...'))
        ].join(''), rowshift < 0 ? -rowshift : rowshift)
}

const post = (string = "", customStyle = style.dim[canvas.settings.text], customTag = tag.Div) => {
    if (canvas.settings.postActive) { render.write(customStyle(customTag(string))) }
}

function initialize(canvasWidth, taskActive = true, postActive = true, tabWidth = 2) {
    canvas.tab = canvas.tab.repeat(tabWidth);
    canvas.settings.taskActive = taskActive;
    canvas.settings.postActive = postActive;
    canvas.width = canvasWidth;
    canvas.divider.low = canvas.divider.low.repeat(canvas.width);
    canvas.divider.mid = canvas.divider.mid.repeat(canvas.width);
    canvas.divider.top = canvas.divider.top.repeat(canvas.width);
}

export default {
    tag,
    list,
    style,
    canvas,
    initialize,
    TASK: task,
    STEP: step,
    POST: post,
    PLAY: play,
    MOLD: write
}
