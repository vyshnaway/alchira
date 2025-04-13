export const canvas: {
    title: string,
    text: string,
    primary: string,
    secondary: string,
    tertiary: string,
    taskActive: boolean,
    postActive: boolean,
    tabSpace: i32,
    width: i32
} = {
    title: 'Green',
    text: 'White',
    primary: 'Orange',
    secondary: 'Yellow',
    tertiary: 'Grey',
    taskActive: true,
    postActive: true,
    tabSpace: 2,
    width: 0
};

export const unstyle: string = '\x1b[0m';

export const width: i32 = (canvas.width < 24) ?
    process.stdout.columns :
    Math.min(process.stdout.columns, canvas.width);

export const tab = (count: i32 = 1): string =>
    ' '.repeat(canvas.tabSpace * count);

export const divider: {
    top: string,
    mid: string,
    low: string
} = {
    top: '‾'.repeat(width),
    mid: '─'.repeat(width),
    low: '_'.repeat(width)
};