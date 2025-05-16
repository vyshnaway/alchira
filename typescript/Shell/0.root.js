const canvas = {
    unstyle: '\x1b[0m',

    appearance: {
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
    },

    color: {
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
    },

    width: 32,

    settings: {
        title: this.color.Green,
        text: this.color.White,
        primary: this.color.Orange,
        secondary: this.color.Yellow,
        tertiary: this.color.Grey,
        taskActive: true,
        postActive: true,
        tabSpace: 2,
    },

    divider: {
        top: '‾',
        mid: '─',
        low: '_',
    },
    
    tab(count = 1) {
        return ' '.repeat(this.settings.tabSpace * count);
    }
};

export default canvas;