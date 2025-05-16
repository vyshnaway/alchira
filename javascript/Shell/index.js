import canvas from "./0.root.js";
import style from "./1.style.js";
import tag from "./2.tag.js";
import list from "./3.list.js";
import write from './4.write.js'

import play from './frames/index.js'
import render from "../../interface/console.js";

const task = (string, rowshift = -1) => {
    if (rowshift < 0) render.animation.Backrow(-rowshift)
    if (canvas.taskActive && canvas.postActive)
        render.write([
            (rowshift >= 0) ? tag.Br(rowshift) : "",
            tag.Div(style.boldDim[canvas.primary]('>>>')),
            tab(),
            tag.Div(style.boldItalic[canvas.tertiary](string + '.')),
            tag.Br(1)
        ].join(''))
}

const step = (string, rowshift = -1) => {
    if (rowshift < 0) render.animation.Backrow(-rowshift)
    if (canvas.taskActive && canvas.postActive)
        render.write([
            (rowshift >= 0) ? tag.Br(rowshift) : "",
            tag.Div(style.boldDim[canvas.primary]('>>>')),
            tab(),
            tag.Div(style.italic[canvas.tertiary](string + ' ...'))
        ].join(''))
}

const post = (string = "", customStyle = style.dim[canvas.text], customTag = tag.Div) => {
    if (canvas.postActive)
        render.write(customStyle(customTag(typeof (string) === 'string' ? string : JSON.stringify(string, null, 2))))
}

function initialize(canvasWidth) {
    canvas.width = Math.min(canvasWidth, canvas.width) || canvas.width;
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
