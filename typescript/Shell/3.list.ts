import canvas from './0.root';
import style from './1.style';
import tag from './2.tag';

type ColorFunction = (item: string) => string;
type ListFunction = (items: any[], color: ColorFunction, intent: number) => string[];
type propFunction = (items: Record<string, string>, color: ColorFunction, intent: number) => string[];

interface ListTypes {
    props: propFunction;
    entries: ListFunction;
    blocks: ListFunction;
    bullets: ListFunction;
    numbers: ListFunction;
    paragraphs: ListFunction;
    waterfall: ListFunction;
}

const colors: Record<string, ColorFunction> = {
    std: (item: string) => canvas.unstyle + item,
    white: (item: string) => style.text.White(item),
    primary: (item: string) => style.text[canvas.settings.primary](item),
    secondary: (item: string) => style.text[canvas.settings.secondary](item),
    warning: (item: string) => style.text.Orange(item),
    failed: (item: string) => style.text.Red(item),
    success: (item: string) => style.text.Green(item),
};

const types: ListTypes = {
    props: (items, color: ColorFunction, intent: number) => {
        const keyLength = Object.keys(items).reduce((max, key) => (key.length > max) ? key.length : max, 0);
        return Object.entries(items).map(([key, value]) => {
            const keyColumn = key.padEnd(keyLength);
            return (canvas.tab(intent) + style.bold[canvas.settings.secondary](keyColumn + canvas.tab() + ":") + tag.Div(color(canvas.tab() + value)));
        });
    },
    entries: (items: string[], color: ColorFunction, intent: number) => {
        const size = items.reduce((length, item) => { if (item.length > length) length = item.length; return length }, 0) + intent + canvas.settings.tabSpace;
        const cols = Math.floor(canvas.width / (size + 4));

        let result: string[] = [], subResult = "";
        items.forEach((item, index) => {
            if ((index + 1) % cols) {
                subResult += tag.Li(color(item.padEnd(size)));
            }
            else {
                subResult += tag.Li(color(item.padEnd(size)));
                result.push(subResult); subResult = "";
            }
        });
        if (subResult.length) result.push(subResult);

        return result;
    },
    blocks: (items: string[], color: ColorFunction, intent: number) =>
        items.map(item => canvas.tab(intent) + tag.Div(color(item))),
    bullets: (items: string[], color: ColorFunction, intent: number) =>
        items.map(item => canvas.tab(intent) + tag.Li(color(item))),
    numbers: (items: string[], color: ColorFunction, intent: number) =>
        items.map((item, index) => canvas.tab(intent) + style.bold[canvas.settings.secondary]((index + 1).toString()) + canvas.tab() + tag.Div(color(item))),
    paragraphs: (items: string[], color: ColorFunction, intent: number) =>
        items.map(item => '\n'.repeat(intent - 1) + tag.P(color(item))),
    waterfall: (items: string[], color: ColorFunction, intent: number) =>
        items.map((item, key) => canvas.tab(intent) + ' '.repeat(canvas.settings.tabSpace - 1) +
            style.bold[canvas.settings.secondary](key === items.length - 1 ? "└─>" : "├─>") + color(canvas.tab() + item)),
};

export interface ListGroup {
    Props: (items?: Record<string, any>, intent?: number) => string[];
    Blocks: (items?: string[], intent?: number) => string[];
    Entries: (items?: string[], intent?: number) => string[];
    Bullets: (items?: string[], intent?: number) => string[];
    Numbers: (items?: string[], intent?: number) => string[];
    Intents: (items?: string[], intent?: number) => string[];
    Waterfall: (items?: string[], intent?: number) => string[];
}

const list: Record<string, ListGroup> = {
    std: {
        Props: (items = {}, intent = 0) => types.props(items, colors.std, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.std, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.std, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.std, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.std, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.std, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.std, intent),
    },
    white: {
        Props: (items = {}, intent = 0) => types.props(items, colors.white, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.white, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.white, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.white, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.white, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.white, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.white, intent),
    },
    failed: {
        Props: (items = {}, intent = 0) => types.props(items, colors.failed, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.failed, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.failed, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.failed, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.failed, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.failed, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.failed, intent),
    },
    success: {
        Props: (items = {}, intent = 0) => types.props(items, colors.success, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.success, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.success, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.success, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.success, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.success, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.success, intent),
    },
    warning: {
        Props: (items = {}, intent = 0) => types.props(items, colors.warning, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.warning, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.warning, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.warning, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.warning, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.warning, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.warning, intent),
    },
    primary: {
        Props: (items = {}, intent = 0) => types.props(items, colors.primary, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.primary, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.primary, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.primary, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.primary, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.primary, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.primary, intent),
    },
    secondary: {
        Props: (items = {}, intent = 0) => types.props(items, colors.secondary, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.secondary, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.secondary, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.secondary, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.secondary, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.secondary, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.secondary, intent),
    },
};

export default list;