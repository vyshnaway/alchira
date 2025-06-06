export const color = {
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

export const appearance = {
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

export const width = (canvas.settings.width < 24) ?
    process.stdout.columns :
    Math.min(process.stdout.columns, canvas.settings.width)

export const tab = (count = 1) =>
    ' '.repeat(canvas.tabSpace * count)

export const divider = {
    top: '‾'.repeat(canvas.settings.width),
    mid: '─'.repeat(canvas.settings.width),
    low: '_'.repeat(canvas.settings.width)
};