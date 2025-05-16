import { canvas, tab, unstyle, appearance, color } from "./0.root.js";
import { compose, write } from './4.compose.js'
import style from "./1.style.js";
import list from "./3.list.js";
import play from './6.animate.js'
import tag from "./2.tag.js";

const task = (string, rowshift = -1) => {
    if (rowshift < 0) render.animation.Backrow(-rowshift)
    if (canvas.taskActive && canvas.postActive)
        console.log([
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
        console.log([
            (rowshift >= 0) ? tag.Br(rowshift) : "",
            tag.Div(style.boldDim[canvas.primary]('>>>')),
            tab(),
            tag.Div(style.italic[canvas.tertiary](string + ' ...'))
        ].join(''))
}
const post = (string = "", customStyle = style.dim[canvas.text], customTag = tag.Div) => {
    if (canvas.postActive) console.log(customStyle(customTag(
        typeof (string) === 'string' ?
            string :
            JSON.stringify(string, null, 2)
    )))
}

const head = (string, customStyle, pickTag) => {
    function hideHistory(numLinesToHide) {
        const cursorPos = process.stdout.rows - 1; // Go to last row
        // 2. Move the cursor up by numLinesToHide
        process.stdout.moveCursor(0, - process.stdout.rows - 1);
        // 3. Clear the lines (from the new cursor position downwards)
        process.stdout.clearScreenDown();
        // 4. Restore the cursor position (optional, but often desired)
        process.stdout.cursorTo(cursorPos.x, cursorPos.y); // Go back to last row

    }
    // rl.cursorTo(),
    // rl.moveCursor()
    // hideHistory()
    if (pickTag)
        console.log(customStyle(pickTag(string)))
    else
        console.log(customStyle(string))
}
const custom = {
    tag,
    style: {
        color,
        appearance,
        apply: style,
        Reset: unstyle,
    },
    canvas,
    render
}

export default {
    compose,
    custom,
    list,
    PLAY: play,
    TASK: task,
    STEP: step,
    POST: post,
    // HEAD: head,
    WRITE: write
}
