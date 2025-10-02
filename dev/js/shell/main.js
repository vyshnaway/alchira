import * as play from "./play/main.js";
import * as style from "./style.js";
import * as render from "./render.js";
import * as root from "./root.js";
import * as tag from "./tag.js";
import * as list from "./list.js";
function task(string, rowshift = -1) {
    if (root.canvas.config.taskActive && root.canvas.config.postActive) {
        render.write([
            rowshift >= 0 ? tag.Br(rowshift) : "",
            root.fmt(">>>", style.AS_Bold, ...root.preset.primary),
            root.canvas.tab,
            root.fmt(string + ".", style.AS_Bold, style.AS_Italic, ...root.preset.tertiary),
            tag.Br(1),
        ].join(""), rowshift < 0 ? -rowshift : rowshift);
    }
}
;
function step(string, rowshift = -1) {
    if (root.canvas.config.taskActive && root.canvas.config.postActive) {
        render.write([
            rowshift >= 0 ? tag.Br(rowshift) : "",
            root.fmt(">>>", style.AS_Rare, ...root.preset.primary),
            root.canvas.tab,
            root.fmt(string + " ...", style.AS_Italic, ...root.preset.tertiary),
        ].join(""), rowshift < 0 ? -rowshift : rowshift);
    }
}
;
function MAKE(heading, contents = [], ...listDeplyment) {
    const modContents = listDeplyment.reduce((A, [type, intent, preset, ...styles]) => {
        A = type(A, intent, preset, ...styles);
        return A;
    }, contents);
    if (contents.length) {
        modContents.push(root.fmt());
    }
    return (
    // heading.length ?
    [
        root.fmt(heading, style.AS_Bold),
        ...modContents
    ]
    // : modContents
    ).join("\n");
}
;
export default {
    tag,
    list,
    render,
    init: root.init,
    canvas: root.canvas,
    preset: root.preset,
    style: style,
    PLAY: play,
    MAKE,
    POST: root.post,
    TASK: task,
    STEP: step,
    FMT: root.fmt,
};
//# sourceMappingURL=main.js.map