import { canvas, tab, unstyle } from "./0.root";
import style from "./1.style";
import tag from "./2.tag";
import list from "./3.list";
import { compose, write } from './4.compose'
import render from "./5.render"
import play from './6.play'

const color = {
    Red: 'Red',
    Orange: 'Orange',
    Yellow: 'Yellow',
    Green: 'Green',
    Cyan: 'Cyan',
    Blue: 'Blue',
    Purple: 'Purple',
    Magenta: 'Magenta',
    Pink: 'Pink',
    Grey: 'Grey',
    White: 'White',
}

const appearance = {
    ends: 'ends',
    text: 'text',
    bold: 'bold',
    dim: 'dim',
    italic: 'italic',
    uline: 'uline',
    shade: 'shade',
    boldItalic: 'boldItalic',
    boldUline: 'boldUline',
    italicUline: 'italicUline',
    boldItalicUline: 'boldItalicUline',
    boldDim: 'boldDim',
    dimItalic: 'dimItalic',
    dimUline: 'dimUline',
    boldDimItalic: 'boldDimItalic',
    boldDimUline: 'boldDimUline',
    boldDimItalicUline: 'boldDimItalicUline',
    invertDim: 'invertDim',
    invertBoldDim: 'invertBoldDim',
    invertDimItalic: 'invertDimItalic',
    invertDimUline: 'invertDimUline',
    invert: 'invert',
    invertBold: 'invertBold',
    invertItalic: 'invertItalic',
    invertBoldItalic: 'invertBoldItalic',
    invertBoldUline: 'invertBoldUline',
    invertItalicUline: 'invertItalicUline',
    invertBoldItalicUline: 'invertBoldItalicUline',
    invertBoldDimItalic: 'invertBoldDimItalic',
    invertBoldDimUline: 'invertBoldDimUline',
    invertDimItalicUline: 'invertDimItalicUline',
    invertBoldDimItalicUline: 'invertBoldDimItalicUline'
};

const task = (string: string, rowshift: i32 = -1): void => {
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

const step = (string: string, rowshift: i32 = -1): void => {
    if (rowshift < 0) render.animation.Backrow(-rowshift)
    if (canvas.taskActive && canvas.postActive)
        console.log([
            (rowshift >= 0) ? tag.Br(rowshift) : "",
            tag.Div(style.boldDim[canvas.primary]('>>>')),
            tab(),
            tag.Div(style.italic[canvas.tertiary](string + ' ...'))
        ].join(''))
}

const post = (string: string = "", customStyle = style.dim[canvas.text], customTag = tag.Div): void => {
    if (canvas.postActive) console.log(customStyle(customTag(
        typeof (string) === 'string' ?
            string :
            JSON.stringify(string, null, 2)
    )))
}

const head = (string: string, customStyle: any, pickTag: any): void => {
    function hideHistory(numLinesToHide: i32): void {
        const cursorPos: i32 = process.stdout.rows - 1; // Go to last row
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
