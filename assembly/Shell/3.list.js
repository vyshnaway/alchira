import { canvas, tab, unstyle, canvas.settings.width } from './0.root.js'
import style from './1.style.js';
import tag from './2.tag.js'

const colors = {
    std: (item) => unstyle + item,
    white: (item) => style.text.White(item),
    primary: (item) => style.text[canvas.primary](item),
    secondary: (item) => style.text[canvas.secondary](item),
    warning: (item) => style.text.Orange(item),
    failed: (item) => style.text.Red(item),
    success: (item) => style.text.Green(item),
}
const types = {
    props: (items, color, intent) => {
        const keyLength = Object.keys(items).reduce((max, key) => (key.length > max) ? key.length : max, 0);
        return Object.entries(items).map(([key, value]) => {
            const keyColumn = key.padEnd(keyLength);
            return (tab(intent) + style.bold[canvas.secondary](keyColumn + tab() + ":") + tag.Div(color(tab() + value)));
        });
    },
    entries: (items, color, intent) => {
        const size = items.reduce((length, item) => { if (item.length > length) length = item.length; return length }, 0) + intent + canvas.tabSpace;
        const cols = Math.floor(canvas.settings.width / (size + 4))

        let result = [], subResult = "";
        items.forEach((item, index) => {
            if ((index + 1) % cols) {
                subResult += tag.Li(color(item.padEnd(size)))
            }
            else {
                subResult += tag.Li(color(item.padEnd(size)))
                result.push(subResult); subResult = ""
            }
        })
        if (subResult.length) result.push(subResult)

        return result
    },
    blocks: (items, color, intent) =>
        items.map(item => tab(intent) + tag.Div(color(item))),
    bullets: (items, color, intent) =>
        items.map(item => tab(intent) + tag.Li(color(item))),
    numbers: (items, color, intent) =>
        items.map((item, index) => tab(intent) + style.bold[canvas.secondary](index + 1) + tab() + tag.Div(color(item))),
    paragraphs: (items, color, intent) =>
        items.map(item => '\n'.repeat(intent - 1) + tag.P(color(item))),
    waterfall: (items, color, intent) =>
        items.map((item, key) => tab(intent) + ' '.repeat(canvas.tabSpace - 1) + style.bold[canvas.secondary](key === items.length - 1 ? "└─>" : "├─>") + color(tab() + item))
}
export default {
    std: {
        Props: (items = [], intent = 0) => types.props(items, colors.std, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.std, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.std, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.std, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.std, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.std, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.std, intent),
    },
    white: {
        Props: (items = [], intent = 0) => types.props(items, colors.white, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.white, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.white, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.white, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.white, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.white, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.white, intent),
    },
    failed: {
        Props: (items = [], intent = 0) => types.props(items, colors.failed, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.failed, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.failed, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.failed, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.failed, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.failed, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.failed, intent),
    },
    success: {
        Props: (items = [], intent = 0) => types.props(items, colors.success, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.success, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.success, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.success, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.success, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.success, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.success, intent),
    },
    warning: {
        Props: (items = [], intent = 0) => types.props(items, colors.warning, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.warning, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.warning, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.warning, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.warning, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.warning, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.warning, intent),
    },
    primary: {
        Props: (items = [], intent = 0) => types.props(items, colors.primary, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.primary, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.primary, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.primary, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.primary, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.primary, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.primary, intent),
    },
    secondary: {
        Props: (items = [], intent = 0) => types.props(items, colors.secondary, intent),
        Blocks: (items = [], intent = 0) => types.blocks(items, colors.secondary, intent),
        Entries: (items = [], intent = 0) => types.entries(items, colors.secondary, intent),
        Bullets: (items = [], intent = 0) => types.bullets(items, colors.secondary, intent),
        Numbers: (items = [], intent = 0) => types.numbers(items, colors.secondary, intent),
        Intents: (items = [], intent = 0) => types.paragraphs(items, colors.secondary, intent),
        Waterfall: (items = [], intent = 0) => types.waterfall(items, colors.secondary, intent),
    },
}