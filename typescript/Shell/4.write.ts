import canvas from './0.root';
import style from './1.style';
import tag from './2.tag';
import list from './3.list';

type BlockFunction = (heading: string, contents: string[], startWith?: number) => string;

interface BlockType {
    Chapter: BlockFunction;
    Section: BlockFunction;
    Footer: BlockFunction;
    Note: BlockFunction;
    Points: BlockFunction;
}

type BlockColorFunction = (blockType: BlockFunction, heading: string, contents: string[]) => string;

interface WriteFunction {
    Text: (string: string, intent?: number) => string;
    Item: (string: string, intent?: number) => string;
    Chapter: (heading: string, contents?: string[], selectListType?: Function, intent?: number) => string;
    Section: (heading: string, contents?: string[], selectListType?: Function, intent?: number) => string;
    Footer: (heading: string, contents?: string[], selectListType?: Function, intent?: number) => string;
    Note: (heading: string, contents?: string[], selectListType?: Function, intent?: number) => string;
    List: (heading: string, contents?: string[], selectListType?: Function, intent?: number) => string;
    Block: (contents?: string[], selectListType?: Function, intent?: number) => string;
}

const composeBlock = (headingType: Function, heading: string, contents: string[]): string => {
    if (contents.length) contents.push(canvas.unstyle);
    return [headingType(heading), ...contents].join('\n');
};

export const blockType: BlockType = {
    Chapter: (heading, contents, startWith) =>
        composeBlock(tag.H1, heading, contents),
    Section: (heading, contents, startWith) =>
        composeBlock(tag.H2, heading, contents),
    Footer: (heading, contents, startWith) =>
        composeBlock(tag.H3, heading, contents),
    Note: (heading, contents, startWith) =>
        composeBlock(tag.H4, heading, contents),
    Points: (heading, contents, startWith) =>
        composeBlock(tag.H5, heading, contents),
};

const blockColor: Record<string, BlockColorFunction> = {
    std: (blockType, heading, contents) =>
        style.bold[canvas.settings.primary](blockType(heading, contents.map(content => content))),
    primary: (blockType, heading, contents) =>
        style.bold[canvas.settings.primary](blockType(heading, contents.map(content => style.text[canvas.settings.primary](content)))),
    secondary: (blockType, heading, contents) =>
        style.bold[canvas.settings.secondary](blockType(heading, contents.map(content => style.text[canvas.settings.secondary](content)))),
    failed: (blockType, heading, contents) =>
        style.bold.Red(blockType(heading, contents.map(content => canvas.unstyle + style.text.Red(content)))),
    success: (blockType, heading, contents) =>
        style.bold.Green(blockType(heading, contents.map(content => style.text.Green(content)))),
    warning: (blockType, heading, contents) =>
        style.bold.Orange(blockType(heading, contents.map(content => style.text.Orange(content)))),
};

export default {
    std: {
        Text: (string, intent = 0) =>
            canvas.tab(intent) + string,
        Item: (string, intent = 0) =>
            canvas.tab(intent) + tag.Li(string),
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
            style.text.White(selectListType(contents, intent).join('\n')) + '\n',
    },
    failed: {
        Text: (string, intent = 0) =>
            canvas.tab(intent) + style.text.Red(string),
        Item: (string, intent = 0) =>
            canvas.tab(intent) + tag.Li(style.text.Red(string)),
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
            style.text.Red(selectListType(contents, intent).join('\n')) + '\n',
    },
    success: {
        Text: (string, intent = 0) =>
            canvas.tab(intent) + style.text.Green(string),
        Item: (string, intent = 0) =>
            canvas.tab(intent) + tag.Li(style.text.Green(string)),
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
            style.text.Green(selectListType(contents, intent).join('\n')) + '\n',
    },
    primary: {
        Text: (string, intent = 0) =>
            canvas.tab(intent) + style.text[canvas.settings.primary](string),
        Item: (string, intent = 0) =>
            canvas.tab(intent) + tag.Li(style.text[canvas.settings.primary](string)),
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
            style.text[canvas.settings.primary](selectListType(contents, intent).join('\n')) + '\n',
    },
    secondary: {
        Text: (string, intent = 0) =>
            canvas.tab(intent) + style.text[canvas.settings.secondary](string),
        Item: (string, intent = 0) =>
            canvas.tab(intent) + tag.Li(style.text[canvas.settings.secondary](string)),
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
            style.text[canvas.settings.secondary](selectListType(contents, intent).join('\n')) + '\n',
    },
} as Record<string, WriteFunction>;