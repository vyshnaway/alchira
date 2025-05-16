class Canvas {
    static unstyle: string = '\x1b[0m';

    divider: {
        top: string;
        mid: string;
        low: string
    };
    settings: {
        title: string;
        text: string;
        primary: string;
        secondary: string;
        tertiary: string;
        taskActive: boolean;
        postActive: boolean;
        tabSpace: number;
    };
    width: number;

    constructor(width: number) {
        this.width = Math.min(width, 80);
        this.settings = {
            title: "Green",
            text: "White",
            primary: "Orange",
            secondary: "Yellow",
            tertiary: "Grey",
            taskActive: true,
            postActive: true,
            tabSpace: 2,
        };
        this.divider = {
            top: '‾'.repeat(this.width),
            mid: '─'.repeat(this.width),
            low: '_'.repeat(this.width),
        };
    }

    tab(count = 1): string {
        return ' '.repeat(this.settings.tabSpace * count);
    }
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
};

export const canvas = new Canvas(60);