
import { canvas, unstyle, tab } from './0.root.js'
import style from './1.style.js'
import tag from './2.tag.js'
import list from './3.list.js'

const composeBlock = (headingType, heading, contents) => {
    if (contents.length) contents.push(unstyle)
    return [
        headingType(heading),
        ...contents
    ].join('\n');
}
export const blockType = {
    Chapter: (heading, contents, startWith) =>
        composeBlock(tag.H1, heading, contents, startWith),
    Section: (heading, contents, startWith) =>
        composeBlock(tag.H2, heading, contents, startWith),
    Footer: (heading, contents, startWith) =>
        composeBlock(tag.H3, heading, contents, startWith),
    Note: (heading, contents, startWith) =>
        composeBlock(tag.H4, heading, contents, startWith),
    Points: (heading, contents, startWith) =>
        composeBlock(tag.H5, heading, contents, startWith),
}
const blockColor = {
    std: (blockType, heading, contents) =>
        style.bold[canvas.primary](blockType(heading, contents.map(content => content))),
    primary: (blockType, heading, contents) =>
        style.bold[canvas.primary](blockType(heading, contents.map(content => style.text[canvas.primary](content)))),
    secondary: (blockType, heading, contents) =>
        style.bold[canvas.secondary](blockType(heading, contents.map(content => style.text[canvas.secondary](content)))),
    failed: (blockType, heading, contents) =>
        style.bold.Red(blockType(heading, contents.map(content => unstyle + style.text.Red(content)))),
    success: (blockType, heading, contents) =>
        style.bold.Green(blockType(heading, contents.map(content => style.text.Green(content)))),
    warning: (blockType, heading, contents) =>
        style.bold.Orange(blockType(heading, contents.map(content => style.text.Orange(content)))),
}

export const compose = {
    std: {
        Text: (string, intent = 0) =>
            tab(intent) + string,
        Item: (string, intent = 0) =>
            tab(intent) + tag.Li(string),
        Chapter: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColor.std(blockType.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColor.std(blockType.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColor.std(blockType.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColor.std(blockType.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColor.std(blockType.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
            style.text.White(selectListType(contents, intent)).join('\n') + '\n',
    },
    failed: {
        Text: (string, intent = 0) =>
            tab(intent) + style.text.Red(string),
        Item: (string, intent = 0) =>
            tab(intent) + tag.Li(style.text.Red(string)),
        Chapter: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            blockColor.failed(blockType.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            blockColor.failed(blockType.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            blockColor.failed(blockType.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            blockColor.failed(blockType.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            blockColor.failed(blockType.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            style.text.Red(selectListType(contents, intent)).join('\n') + '\n',
    },
    success: {
        Text: (string, intent = 0) =>
            tab(intent) + style.text.Green(string),
        Item: (string, intent = 0) =>
            tab(intent) + tag.Li(style.text.Green(string)),
        Chapter: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            blockColor.success(blockType.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            blockColor.success(blockType.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            blockColor.success(blockType.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            blockColor.success(blockType.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            blockColor.success(blockType.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.success.Blocks, intent = 0) =>
            style.text.Green(selectListType(contents, intent)).join('\n') + '\n',
    },
    primary: {
        Text: (string, intent = 0) =>
            tab(intent) + style.text[canvas.primary](string),
        Item: (string, intent = 0) =>
            tab(intent) + tag.Li(style.text[canvas.primary](string)),
        Chapter: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.primary(blockType.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.primary(blockType.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.primary(blockType.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.primary(blockType.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.primary(blockType.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            style.text[canvas.primary](selectListType(contents, intent)).join('\n') + '\n',
    },
    secondary: {
        Text: (string, intent = 0) =>
            tab(intent) + style.text[canvas.secondary](string),
        Item: (string, intent = 0) =>
            tab(intent) + tag.Li(style.text[canvas.secondary](string)),
        Chapter: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.secondary(blockType.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.secondary(blockType.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.secondary(blockType.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.secondary(blockType.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            blockColor.secondary(blockType.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            style.text[canvas.secondary](selectListType(contents, intent)).join('\n') + '\n',
    },
}

export const write = {
    std: {
        Text: (string, intent = 0) =>
            console.log(tab(intent) + string),
        Item: (string, intent = 0) =>
            console.log(tab(intent) + tag.Li(string)),
        Chapter: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            console.log(blockColor.std(blockType.Chapter, heading, selectListType(contents, intent))),
        Section: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            console.log(blockColor.std(blockType.Section, heading, selectListType(contents, intent))),
        Footer: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            console.log(blockColor.std(blockType.Footer, heading, selectListType(contents, intent))),
        Note: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            console.log(blockColor.std(blockType.Note, heading, selectListType(contents, intent))),
        List: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            console.log(blockColor.std(blockType.Points, heading, selectListType(contents, intent))),
        Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
            console.log(style.text.White(selectListType(contents, intent).join("\n"))),
    },
    failed: {
        Text: (string, intent = 0) =>
            console.log(tab(intent) + style.text.Red(string)),
        Item: (string, intent = 0) =>
            console.log(tab(intent) + tag.Li(style.text.Red(string))),
        Chapter: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            console.log(blockColor.failed(blockType.Chapter, heading, selectListType(contents, intent))),
        Section: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            console.log(blockColor.failed(blockType.Section, heading, selectListType(contents, intent))),
        Footer: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            console.log(blockColor.failed(blockType.Footer, heading, selectListType(contents, intent))),
        Note: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            console.log(blockColor.failed(blockType.Note, heading, selectListType(contents, intent))),
        List: (heading, contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            console.log(blockColor.failed(blockType.Points, heading, selectListType(contents, intent))),
        Block: (contents = [], selectListType = list.failed.Blocks, intent = 0) =>
            console.log(style.text.Red(selectListType(contents, intent)).join('\n') + '\n'),
    },
    success: {
        Text: (string, intent = 0) =>
            console.log(tab(intent) + style.text.Green(string)),
        Item: (string, intent = 0) =>
            console.log(tab(intent) + tag.Li(style.text.Green(string))),
        Chapter: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            console.log(blockColor.success(blockType.Chapter, heading, selectListType(contents, intent))),
        Section: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            console.log(blockColor.success(blockType.Section, heading, selectListType(contents, intent))),
        Footer: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            console.log(blockColor.success(blockType.Footer, heading, selectListType(contents, intent))),
        Note: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            console.log(blockColor.success(blockType.Note, heading, selectListType(contents, intent))),
        List: (heading, contents = [], selectListType = list.success.Blocks, intent = 0) =>
            console.log(blockColor.success(blockType.Points, heading, selectListType(contents, intent))),
        Block: (contents = [], selectListType = list.success.Blocks, intent = 0) =>
            console.log(style.text.Green(selectListType(contents, intent)).join('\n') + '\n'),
    },
    primary: {
        Text: (string, intent = 0) =>
            console.log(tab(intent) + style.text[canvas.primary](string)),
        Item: (string, intent = 0) =>
            console.log(tab(intent) + tag.Li(style.text[canvas.primary](string))),
        Chapter: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.primary(blockType.Chapter, heading, selectListType(contents, intent))),
        Section: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.primary(blockType.Section, heading, selectListType(contents, intent))),
        Footer: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.primary(blockType.Footer, heading, selectListType(contents, intent))),
        Note: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.primary(blockType.Note, heading, selectListType(contents, intent))),
        List: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.primary(blockType.Points, heading, selectListType(contents, intent))),
        Block: (contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(style.text[canvas.primary](selectListType(contents, intent)).join('\n') + '\n'),
    },
    secondary: {
        Text: (string, intent = 0) =>
            console.log(tab(intent) + style.text[canvas.secondary](string)),
        Item: (string, intent = 0) =>
            console.log(tab(intent) + tag.Li(style.text[canvas.secondary](string))),
        Chapter: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.secondary(blockType.Chapter, heading, selectListType(contents, intent))),
        Section: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.secondary(blockType.Section, heading, selectListType(contents, intent))),
        Footer: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.secondary(blockType.Footer, heading, selectListType(contents, intent))),
        Note: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.secondary(blockType.Note, heading, selectListType(contents, intent))),
        List: (heading, contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(blockColor.secondary(blockType.Points, heading, selectListType(contents, intent))),
        Block: (contents = [], selectListType = list.primary.Blocks, intent = 0) =>
            console.log(style.text[canvas.secondary](selectListType(contents, intent)).join('\n') + '\n'),
    },
}
