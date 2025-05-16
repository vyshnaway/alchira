import canvas from './0.root';
import style from './1.style';
import tag from './2.tag';
import list from './3.list';
import write from './4.write';
import play from './frames/index';
import render from '../../interface/console';

interface Shell {
    tag: typeof tag;
    list: typeof list;
    style: typeof style;
    canvas: typeof canvas;
    initialize: (canvasWidth: number) => void;
    TASK: (string: string, rowshift?: number) => void;
    STEP: (string: string, rowshift?: number) => void;
    POST: (string?: string | object, customStyle?: Function, customTag?: Function) => void;
    PLAY: typeof play;
    WRITE: typeof write;
}

const task = (string: string, rowshift: number = -1): void => {
    if (rowshift < 0) render.animation.Backrow(-rowshift);
    if (canvas.settings.taskActive && canvas.settings.postActive)
        render.write([
            rowshift >= 0 ? tag.Br(rowshift) : '',
            tag.Div(style.boldDim[canvas.settings.primary]('>>>')),
            canvas.tab(),
            tag.Div(style.boldItalic[canvas.settings.tertiary](string + '.')),
            tag.Br(1),
        ].join(''));
};

const step = (string: string, rowshift: number = -1): void => {
    if (rowshift < 0) render.animation.Backrow(-rowshift);
    if (canvas.settings.taskActive && canvas.settings.postActive)
        render.write([
            rowshift >= 0 ? tag.Br(rowshift) : '',
            tag.Div(style.boldDim[canvas.settings.primary]('>>>')),
            canvas.tab(),
            tag.Div(style.italic[canvas.settings.tertiary](string + ' ...')),
        ].join(''));
};

const post = (
    string: string | object = '',
    customStyle: Function = style.dim[canvas.settings.text],
    customTag: Function = tag.Div
): void => {
    if (canvas.settings.postActive)
        render.write(
            customStyle(
                customTag(
                    typeof string === 'string' ? string : JSON.stringify(string, null, 2)
                )
            )
        );
};

function initialize(canvasWidth: number): void {
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
    WRITE: write,
} as Shell;