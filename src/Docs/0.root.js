export const canvas = {
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

export const unstyle = '\x1b[0m'

export const width = (canvas.width < 24) ?
    process.stdout.columns :
    Math.min(process.stdout.columns, canvas.width)

export const tab = (count = 1) =>
    ' '.repeat(canvas.tabSpace * count)

export const divider = {
    top: '‾'.repeat(width),
    mid: '─'.repeat(width),
    low: '_'.repeat(width)
};