import rl from 'readline'

const canvas = {
    title: 'Red',
    primary: 'Orange',
    secondary: 'Yellow',
    tertiary: 'Grey',
    tabSpace: '  ',
    width: 80
};

const canvasWidth = (canvas.width < 24) ? process.stdout.columns : Math.min(process.stdout.columns, canvas.width)
const styleReset = '\x1b[0m';
const divider = {
    top: '‾'.repeat(canvasWidth),
    mid: '─'.repeat(canvasWidth),
    low: '_'.repeat(canvasWidth)
}
const color = {
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
const style = {
    text: {
        Red: (text) => `\x1b[31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[33m${text}\x1b[0m`,
        Green: (text) => `\x1b[32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[37m${text}\x1b[0m`,
    },
    bold: {
        Red: (text) => `\x1b[1;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;37m${text}\x1b[0m`,
    },
    dim: {
        Red: (text) => `\x1b[2;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[2;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[2;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[2;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[2;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[2;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[2;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[2;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[2;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[2;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[2;37m${text}\x1b[0m`,
    },
    italic: {
        Red: (text) => `\x1b[3;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[3;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[3;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[3;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[3;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[3;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[3;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[3;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[3;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[3;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[3;37m${text}\x1b[0m`,
    },
    uline: {
        Red: (text) => `\x1b[4;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[4;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[4;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[4;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[4;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[4;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[4;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[4;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[4;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[4;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[4;37m${text}\x1b[0m`,
    },
    shade: {
        Red: (text) => `\x1b[41m${text}\x1b[0m`,
        Orange: (text) => `\x1b[48;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[43m${text}\x1b[0m`,
        Green: (text) => `\x1b[42m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[46m${text}\x1b[0m`,
        Blue: (text) => `\x1b[44m${text}\x1b[0m`,
        Purple: (text) => `\x1b[48;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[45m${text}\x1b[0m`,
        Pink: (text) => `\x1b[48;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[48;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[47m${text}\x1b[0m`,
    },
    boldItalic: {
        Red: (text) => `\x1b[1;3;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;3;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;3;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;3;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;3;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;3;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;3;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;3;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;3;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;3;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;3;37m${text}\x1b[0m`,
    },
    boldUline: {
        Red: (text) => `\x1b[4;1;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[4;1;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[4;1;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[4;1;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[4;1;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[4;1;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[4;1;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[4;1;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[4;1;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[4;1;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[4;1;37m${text}\x1b[0m`,
    },
    italicUline: {
        Red: (text) => `\x1b[4;3;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[4;3;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[4;3;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[4;3;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[4;3;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[4;3;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[4;3;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[4;3;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[4;3;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[4;3;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[4;3;37m${text}\x1b[0m`,
    },
    boldItalicUline: {
        Red: (text) => `\x1b[1;3;4;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;3;4;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;3;4;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;3;4;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;3;4;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;3;4;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;3;4;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;3;4;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;3;4;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;3;4;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;3;4;37m${text}\x1b[0m`,
    },
    boldDim: {
        Red: (text) => `\x1b[1;2;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;37m${text}\x1b[0m`,
    },
    dimItalic: {
        Red: (text) => `\x1b[2;3;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[2;3;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[2;3;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[2;3;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[2;3;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[2;3;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[2;3;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[2;3;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[2;3;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[2;3;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[2;3;37m${text}\x1b[0m`,
    },
    dimUline: {
        Red: (text) => `\x1b[2;4;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[2;4;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[2;4;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[2;4;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[2;4;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[2;4;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[2;4;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[2;4;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[2;4;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[2;4;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[2;4;37m${text}\x1b[0m`,
    },
    boldDimItalic: {
        Red: (text) => `\x1b[1;2;3;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;3;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;3;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;3;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;3;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;3;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;3;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;3;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;3;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;3;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;3;37m${text}\x1b[0m`,
    },
    boldDimUline: {
        Red: (text) => `\x1b[1;2;4;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;4;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;4;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;4;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;4;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;4;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;4;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;4;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;4;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;4;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;4;37m${text}\x1b[0m`,
    },
    boldDimItalicUline: {
        Red: (text) => `\x1b[1;2;3;4;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;3;4;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;3;4;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;3;4;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;3;4;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;3;4;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;3;4;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;3;4;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;3;4;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;3;4;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;3;4;37m${text}\x1b[0m`,
    },
    invertDim: {
        Red: (text) => `\x1b[2;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[2;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[2;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[2;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[2;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[2;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[2;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[2;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[2;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[2;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[2;7;37m${text}\x1b[0m`,
    },
    invertBoldDim: {
        Red: (text) => `\x1b[1;2;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;7;37m${text}\x1b[0m`,
    },
    invertDimItalic: {
        Red: (text) => `\x1b[2;3;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[2;3;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[2;3;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[2;3;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[2;3;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[2;3;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[2;3;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[2;3;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[2;3;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[2;3;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[2;3;7;37m${text}\x1b[0m`,
    },
    invertDimUline: {
        Red: (text) => `\x1b[2;4;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[2;4;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[2;4;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[2;4;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[2;4;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[2;4;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[2;4;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[2;4;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[2;4;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[2;4;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[2;4;7;37m${text}\x1b[0m`,
    },
    invert: {
        Red: (text) => `\x1b[31m\x1b[7m${text}\x1b[0m`,
        Orange: (text) => `\x1b[38;5;214m\x1b[7m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[33m\x1b[7m${text}\x1b[0m`,
        Green: (text) => `\x1b[32m\x1b[7m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[36m\x1b[7m${text}\x1b[0m`,
        Blue: (text) => `\x1b[34m\x1b[7m${text}\x1b[0m`,
        Purple: (text) => `\x1b[38;5;93m\x1b[7m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[35m\x1b[7m${text}\x1b[0m`,
        Pink: (text) => `\x1b[38;5;205m\x1b[7m${text}\x1b[0m`,
        Grey: (text) => `\x1b[38;5;240m\x1b[7m${text}\x1b[0m`,
        White: (text) => `\x1b[37m\x1b[7m${text}\x1b[0m`,
    },
    invertBold: {
        Red: (text) => `\x1b[1;31;7m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;38;5;214;7m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;33;7m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;32;7m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;36;7m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;34;7m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;38;5;93;7m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;35;7m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;38;5;205;7m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;38;5;240;7m${text}\x1b[0m`,
        White: (text) => `\x1b[1;37;7m${text}\x1b[0m`,
    },
    invertItalic: {
        Red: (text) => `\x1b[3;31;7m${text}\x1b[0m`,
        Orange: (text) => `\x1b[3;38;5;214;7m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[3;33;7m${text}\x1b[0m`,
        Green: (text) => `\x1b[3;32;7m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[3;36;7m${text}\x1b[0m`,
        Blue: (text) => `\x1b[3;34;7m${text}\x1b[0m`,
        Purple: (text) => `\x1b[3;38;5;93;7m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[3;35;7m${text}\x1b[0m`,
        Pink: (text) => `\x1b[3;38;5;205;7m${text}\x1b[0m`,
        Grey: (text) => `\x1b[3;38;5;240;7m${text}\x1b[0m`,
        White: (text) => `\x1b[3;37;7m${text}\x1b[0m`,
    },
    invertBoldItalic: {
        Red: (text) => `\x1b[1;3;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;3;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;3;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;3;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;3;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;3;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;3;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;3;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;3;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;3;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;3;7;37m${text}\x1b[0m`,
    },
    invertBoldUline: {
        Red: (text) => `\x1b[4;1;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[4;1;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[4;1;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[4;1;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[4;1;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[4;1;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[4;1;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[4;1;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[4;1;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[4;1;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[4;1;7;37m${text}\x1b[0m`,
    },
    invertItalicUline: {
        Red: (text) => `\x1b[4;3;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[4;3;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[4;3;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[4;3;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[4;3;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[4;3;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[4;3;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[4;3;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[4;3;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[4;3;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[4;3;7;37m${text}\x1b[0m`,
    },
    invertBoldItalicUline: {
        Red: (text) => `\x1b[1;3;4;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;3;4;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;3;4;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;3;4;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;3;4;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;3;4;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;3;4;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;3;4;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;3;4;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;3;4;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;3;4;7;37m${text}\x1b[0m`,
    },
    invertBoldDimItalic: {
        Red: (text) => `\x1b[1;2;3;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;3;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;3;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;3;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;3;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;3;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;3;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;3;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;3;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;3;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;3;7;37m${text}\x1b[0m`,
    },
    invertBoldDimUline: {
        Red: (text) => `\x1b[1;2;4;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;4;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;4;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;4;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;4;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;4;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;4;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;4;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;4;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;4;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;4;7;37m${text}\x1b[0m`,
    },
    invertDimItalicUline: {
        Red: (text) => `\x1b[2;3;4;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[2;3;4;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[2;3;4;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[2;3;4;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[2;3;4;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[2;3;4;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[2;3;4;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[2;3;4;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[2;3;4;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[2;3;4;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[2;3;4;7;37m${text}\x1b[0m`,
    },
    invertBoldDimItalicUline: {
        Red: (text) => `\x1b[1;2;3;4;7;31m${text}\x1b[0m`,
        Orange: (text) => `\x1b[1;2;3;4;7;38;5;214m${text}\x1b[0m`,
        Yellow: (text) => `\x1b[1;2;3;4;7;33m${text}\x1b[0m`,
        Green: (text) => `\x1b[1;2;3;4;7;32m${text}\x1b[0m`,
        Cyan: (text) => `\x1b[1;2;3;4;7;36m${text}\x1b[0m`,
        Blue: (text) => `\x1b[1;2;3;4;7;34m${text}\x1b[0m`,
        Purple: (text) => `\x1b[1;2;3;4;7;38;5;93m${text}\x1b[0m`,
        Magenta: (text) => `\x1b[1;2;3;4;7;35m${text}\x1b[0m`,
        Pink: (text) => `\x1b[1;2;3;4;7;38;5;205m${text}\x1b[0m`,
        Grey: (text) => `\x1b[1;2;3;4;7;38;5;240m${text}\x1b[0m`,
        White: (text) => `\x1b[1;2;3;4;7;37m${text}\x1b[0m`,
    },
}
const tag = {
    H1: (heading) => {
        const minWidth = 10;
        const width = Math.max(canvasWidth, minWidth);
        const lines = [];
        let currentLine = "";
        for (const word of heading.split(" ")) {
            if (currentLine.length + word.length + 1 <= width - 6) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }

        lines.push(currentLine);
        const paddedLines = lines.map(line => {
            const padding = width - 6 - line.length;
            const leftPad = " ".repeat(Math.max(0, Math.floor(padding / 2)));
            const rightPad = " ".repeat(Math.max(0, Math.ceil(padding / 2)));
            return `>>>${leftPad}${line}${rightPad}<<<`;
        });

        return [
            '',
            divider.mid,
            ...paddedLines,
            divider.mid,
            '',
        ].join("\n");
    },
    H2: (heading) => {
        return [
            divider.mid,
            heading,
            divider.mid,
            '',
        ].join('\n')
    },
    H3: (heading) => {
        return [
            divider.mid,
            heading,
            ''
        ].join('\n')
    },
    H4: (heading) => {
        return [
            heading,
            '',
        ].join('\n')
    },
    H5: (heading) => {
        return [
            heading,
        ].join('\n')
    },
    P: (content) => {
        return canvas.tabSpace + content;
    },
    Li: (string) => {
        string = style.bold[canvas.tertiary]('>') + canvas.tabSpace + string
        return (string)
    },
    Br: (repeat = 1) =>
        '\n'.repeat(repeat),
    Hr: (character = '─') =>
        '\n' + character.charAt(0).repeat(canvasWidth),
}

const composeBlock = (headingType, heading, contents =[], startWith = '') => {
    contents = contents.map(item => startWith + item)
    if (contents.length) contents.push('')
    return [
        headingType(heading),
        ...contents
    ].join('\n');
}

const blockTypes = {
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
const blockColors = {
    std: (blockType, heading, contents) =>
        style.bold[canvas.primary](blockType(heading, contents.map(content => style.text[canvas.secondary](content)), styleReset)),
    primary: (blockType, heading, contents) =>
        style.bold[canvas.primary](blockType(heading, contents.map(content => style.text[canvas.primary](content)), styleReset)),
    secondary: (blockType, heading, contents) =>
        style.bold[canvas.secondary](blockType(heading, contents.map(content => style.text[canvas.secondary](content)), styleReset)),
    failed: (blockType, heading, contents) =>
        style.bold.Red(blockType(heading, contents.map(content => style.text.Red(content)), styleReset)),
    success: (blockType, heading, contents) =>
        style.bold.Green(blockType(heading, contents.map(content => style.text.Green(content)), styleReset)),
    warning: (blockType, heading, contents) =>
        style.bold.Orange(blockType(heading, contents.map(content => style.text.Orange(content)), styleReset)),
}

const listTypes = {
    props: (items) => {
        const keyLength = Object.keys(items).reduce((max, key) => (key.length > max) ? key.length : max, 0);
        const newItems = Object.entries(items).map(([key, value]) => {
            const keyColumn = key.padEnd(keyLength);
            return (`${style.bold[canvas.secondary](keyColumn)}${canvas.tabSpace}:${canvas.tabSpace}${value}`);
        });
        return newItems
    },
    blocks: (items) => {
        return items;
    },
    bullets: (items) => {
        const newItems = items.map(item => {
            return (tag.Li(item));
        });
        return newItems
    },
    numbers: (items) => {
        const newItems = items.map((item, index) => {
            return `${index + 1}.${canvas.tabSpace}${item}`;
        });
        return newItems
    },
    intents: (items) => {
        return items.map(item => tag.P(item))
    },
    errors: (items) => {
        return items.map(item => blockTypes.error(item.file, item))
    }
}
const listColors = {
    std: (items, listType, intent) => {
        return (listType(items).map(item =>
            canvas.tabSpace.repeat(intent) + item)
        )
    },
    white: (items, listType, intent) => {
        return (listType(items).map(item =>
            canvas.tabSpace.repeat(intent) + style.text.White(item))
        )
    },
    primary: (items, listType, intent) => {
        return (listType(items).map(item =>
            canvas.tabSpace.repeat(intent) + style.text[canvas.primary](item))
        )
    },
    secondary: (items, listType, intent) => {
        return (listType(items).map(item =>
            canvas.tabSpace.repeat(intent) + style.text[canvas.secondary](item))
        )
    },
    failed: (items, listType, intent) => {
        return (listType(items).map(item =>
            canvas.tabSpace.repeat(intent) + style.text.Red(contentBlock(item)))
        )
    },
    success: (items, listType, intent) => {
        return (listType(items).map(item =>
            canvas.tabSpace.repeat(intent) + style.text.Green(item))
        )
    },
    success: (items, listType, intent = 0) => {
        return (listType(items).map(item =>
            canvas.tabSpace.repeat(intent) + style.text.Orange(item))
        )
    },
}
const list = {
    std: {
        Props: (items = [], intent = 0) => listColors.std(items, listTypes.props, intent),
        Bullets: (items = [], intent = 0) => listColors.std(items, listTypes.bullets, intent),
        Numbers: (items = [], intent = 0) => listColors.std(items, listTypes.numbers, intent),
        Intents: (items = [], intent = 0) => listColors.std(items, listTypes.intents, intent),
        Errors: (items = [], intent = 0) => listColors.std(items, listTypes.errors, intent),
        Blocks: (items = [], intent = 0) => listColors.std(items, listTypes.blocks, intent),
    },
    white: {
        Props: (items = [], intent = 0) => listColors.white(items, listTypes.props, intent),
        Bullets: (items = [], intent = 0) => listColors.white(items, listTypes.bullets, intent),
        Numbers: (items = [], intent = 0) => listColors.white(items, listTypes.numbers, intent),
        Intents: (items = [], intent = 0) => listColors.white(items, listTypes.intents, intent),
        Errors: (items = [], intent = 0) => listColors.white(items, listTypes.errors, intent),
        Blocks: (items = [], intent = 0) => listColors.white(items, listTypes.blocks, intent),
    },
    failed: {
        Props: (items = [], intent = 0) => listColors.failed(items, listTypes.props, intent),
        Bullets: (items = [], intent = 0) => listColors.failed(items, listTypes.bullets, intent),
        Numbers: (items = [], intent = 0) => listColors.failed(items, listTypes.numbers, intent),
        Intents: (items = [], intent = 0) => listColors.failed(items, listTypes.intents, intent),
        Errors: (items = [], intent = 0) => listColors.failed(items, listTypes.errors, intent),
        Blocks: (items = [], intent = 0) => listColors.failed(items, listTypes.blocks, intent),
    },
    success: {
        Props: (items = [], intent = 0) => listColors.success(items, listTypes.props, intent),
        Bullets: (items = [], intent = 0) => listColors.success(items, listTypes.bullets, intent),
        Numbers: (items = [], intent = 0) => listColors.success(items, listTypes.numbers, intent),
        Intents: (items = [], intent = 0) => listColors.success(items, listTypes.intents, intent),
        Errors: (items = [], intent = 0) => listColors.success(items, listTypes.errors, intent),
        Blocks: (items = [], intent = 0) => listColors.success(items, listTypes.blocks, intent),
    },
    warning: {
        Props: (items = [], intent = 0) => listColors.warning(items, listTypes.props, intent),
        Bullets: (items = [], intent = 0) => listColors.Warning(items, listTypes.bullets, intent),
        Numbers: (items = [], intent = 0) => listColors.Warning(items, listTypes.numbers, intent),
        Intents: (items = [], intent = 0) => listColors.Warning(items, listTypes.intents, intent),
        Errors: (items = [], intent = 0) => listColors.warning(items, listTypes.errors, intent),
        Blocks: (items = [], intent = 0) => listColors.warning(items, listTypes.blocks, intent),
    },
    primary: {
        Props: (items = [], intent = 0) => listColors.primary(items, listTypes.props, intent),
        Bullets: (items = [], intent = 0) => listColors.primary(items, listTypes.bullets, intent),
        Numbers: (items = [], intent = 0) => listColors.primary(items, listTypes.numbers, intent),
        Intents: (items = [], intent = 0) => listColors.primary(items, listTypes.intents, intent),
        Errors: (items = [], intent = 0) => listColors.primary(items, listTypes.errors, intent),
        Blocks: (items = [], intent = 0) => listColors.primary(items, listTypes.blocks, intent),
    },
    secondary: {
        Props: (items = [], intent = 0) => listColors.secondary(items, listTypes.props, intent),
        Bullets: (items = [], intent = 0) => listColors.secondary(items, listTypes.bullets, intent),
        Numbers: (items = [], intent = 0) => listColors.secondary(items, listTypes.numbers, intent),
        Intents: (items = [], intent = 0) => listColors.secondary(items, listTypes.intents, intent),
        Errors: (items = [], intent = 0) => listColors.secondary(items, listTypes.errors, intent),
        Blocks: (items = [], intent = 0) => listColors.secondary(items, listTypes.blocks, intent),
    },
}

const make = {
    std: {
        Line: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + string,
        Item: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + tag.Li(string),
        Chapter: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.std(blockTypes.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.std(blockTypes.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.std(blockTypes.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.std(blockTypes.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.std(blockTypes.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
            style.text.White(selectListType(contents, intent)).join('\n') + '\n',
    },
    failed: {
        Line: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text.Red(string),
        Item: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text.Red(tag.Li(string)),
        Chapter: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.failed(blockTypes.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.failed(blockTypes.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.failed(blockTypes.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.failed(blockTypes.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.failed(blockTypes.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
            style.text.Red(selectListType(contents, intent)).join('\n') + '\n',
    },
    success: {
        Line: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text.Green(string),
        Item: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text.Green(tag.Li(string)),
        Chapter: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.success(blockTypes.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.success(blockTypes.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.success(blockTypes.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.success(blockTypes.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.success(blockTypes.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
            style.text.Green(selectListType(contents, intent)).join('\n') + '\n',
    },
    primary: {
        Line: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text[canvas.primary](string),
        Item: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text[canvas.primary](tag.Li(string)),
        Chapter: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.primary(blockTypes.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.primary(blockTypes.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.primary(blockTypes.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.primary(blockTypes.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.primary(blockTypes.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
            style.text[canvas.primary](selectListType(contents, intent)).join('\n') + '\n',
    },
    secondary: {
        Line: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text[canvas.secondary](string),
        Item: (string, intent = 0) =>
            canvas.tabSpace.repeat(intent) + style.text[canvas.secondary](tag.Li(string)),
        Chapter: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.secondary(blockTypes.Chapter, heading, selectListType(contents, intent)),
        Section: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.secondary(blockTypes.Section, heading, selectListType(contents, intent)),
        Footer: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.secondary(blockTypes.Footer, heading, selectListType(contents, intent)),
        Note: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.secondary(blockTypes.Note, heading, selectListType(contents, intent)),
        List: (heading, contents = [], selectListType = list.std.Blocks, intent = 0) =>
            blockColors.secondary(blockTypes.Points, heading, selectListType(contents, intent)),
        Block: (contents = [], selectListType = list.std.Blocks, intent = 0) =>
            style.text[canvas.secondary](selectListType(contents, intent)).join('\n') + '\n',
    },
}



const clearPreviousLines = (lines) => {
    rl.clearLine(process.stdout, 0);
    for (let i = 0; i < lines; i++) {
        rl.moveCursor(process.stdout, 0, -1);
        rl.clearLine(process.stdout, 0);
    }
}
const refresh = (backRows, string = '') => {
    const rowsCreated = string.split('\n').length;
    clearPreviousLines(backRows);
    console.log(string);
    return rowsCreated;
}

const getInterval = {
    FrameRate: (numberOfFrames) => 1000 / numberOfFrames,
    SingleTime: (numberOfFrames, duration) => duration / numberOfFrames,
    RepeatTime: (numberOfFrames, duration, repeat) => duration / (numberOfFrames * repeat)
}
const renderFrames = {
    Loki: (string, frames = 1) => {
        const characters = Math.floor(Math.random() * string.length)
        const styles = Object.keys(style);
        const colors = Object.keys(style.bold);
        const renders = [];

        if (characters > string.length) {
            string = string.padEnd(characters, " ");
        }

        for (let i = 0; i < frames; i++) {
            const styledIndices = new Set();
            let styledString = string;
            for (let j = 0; j < characters; j++) {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * string.length);
                } while (styledIndices.has(randomIndex));

                styledIndices.add(randomIndex);

                const randomStyle = styles[Math.floor(Math.random() * styles.length)];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const styledCharacter = style[randomStyle][randomColor](string[randomIndex]);

                styledString =
                    styledString.substring(0, randomIndex) +
                    styledCharacter +
                    styledString.substring(randomIndex + 1);
            }
            renders.push(styledString);
        }

        return renders;
    },
    Title: (string) => {
        const padBothSides = (str, totalLength) => {
            const totalPadding = totalLength - str.length;
            const startPadding = Math.floor(totalPadding / 2);
            const endPadding = totalPadding - startPadding;
            return ' '.repeat(startPadding) + str + ' '.repeat(endPadding);
        };
        const previewFrames = Math.ceil(string.length / 16);
        const renders = [], preview = [
            ...new Array(previewFrames * 2).fill([
                '', '',
                divider.mid,
                '', ''
            ]),
            ...new Array(previewFrames).fill([
                '',
                style.boldUline[canvas.title](tag.Hr('‾')),
                '', ''
            ]),
            ...new Array(previewFrames).fill([
                '',
                divider.low,
                '·' + padBothSides('·', canvasWidth - 2) + '·',
                divider.top,
                ''
            ]),
            ...new Array(previewFrames).fill([
                '',
                divider.mid,
                '>' + padBothSides('-', canvasWidth - 2) + '<',
                divider.mid,
                ''
            ]),
            ...new Array(previewFrames).fill([
                '',
                divider.top,
                '>>' + padBothSides('×', canvasWidth - 4) + '<<',
                divider.low,
                ''
            ]),
        ].map(frame => style.bold[canvas.title](frame.join('\n')));
        const modifyString = (str) => {
            str = str.substring(1, str.length - 1)
            if (str.startsWith(' ')) {
                str = str.substring(1, str.length - 1);
            } else {
                str = str.substring(0, str.length - 2);
            }
            return '>' + str + '<'
        };

        string = '   ' + string + '   ';
        while ((string.length !== 1) && (string.length !== 2)) {
            string = modifyString(string)
            renders.unshift(style.bold[canvas.title](blockTypes.Chapter(string)));
        }
        return preview.concat(renders,);
    }
}
const animate = {
    Loop: (frames, interval, duration) => {
        return new Promise((resolve) => {
            const totalFrames = duration === 0 ? Infinity : Math.floor(duration / interval);
            let currentFrame = 0, backRows = 0;

            const intervalId = setInterval(() => {
                if (currentFrame >= totalFrames || currentFrame >= frames.length) {
                    if (duration !== 0) {
                        clearInterval(intervalId);
                        resolve();
                        return;
                    } else {
                        currentFrame = 0;
                    }
                }
                backRows = refresh(backRows, frames[currentFrame]);
                currentFrame++;
            }, interval);
        })
    },
    Repeat: (frames, interval, repeat = 1) => {
        return new Promise((resolve) => {
            let currentFrame = 0, backRows = 0;
            const totalFrames = repeat * frames.length;

            const intervalId = setInterval(() => {
                if (currentFrame >= totalFrames || currentFrame >= frames.length) {
                    clearInterval(intervalId);
                    resolve();
                    return;
                }
                backRows = refresh(backRows, frames[currentFrame]);

                currentFrame++;
            }, interval);
        });
    },
    Rewrite: (backRows, string) => {
        return refresh(backRows, string);
    },
    Backrow: (lines) => {
        clearPreviousLines(lines)
    }
}

function hideHistory(numLinesToHide) {
    // 1. Get the current cursor position (not reliably portable across terminals)
    const cursorPos = process.stdout.rows - 1; // Go to last row

    // 2. Move the cursor up by numLinesToHide
    process.stdout.moveCursor(0, - process.stdout.rows - 1);

    // 3. Clear the lines (from the new cursor position downwards)
    process.stdout.clearScreenDown();

    // 4. Restore the cursor position (optional, but often desired)
    process.stdout.cursorTo(cursorPos.x, cursorPos.y); // Go back to last row

}
const task = (string) => {
    console.log([
        style.boldDim[canvas.primary]('>>>') +
        canvas.tabSpace +
        style.boldItalic[canvas.tertiary](string + ' ...')
    ].join(''))
}
const head = (string, pickStyle = style.text.White, pickTag) => {
    // rl.cursorTo(),
    //     rl.moveCursor()
    // hideHistory()
    if (pickTag) {
        console.log(pickStyle(pickTag(string)))
    } else {
        console.log(pickStyle(string))
    }
}
const post = (string, pickStyle = style.text.White, pickTag) => {
    if (pickTag) {
        console.log(pickStyle(pickTag(string)))
    } else {
        console.log(pickStyle(string))
    }
}
const play = {
    Title: (string, duration) => {
        return new Promise(async (resolve) => {
            const headFrames = renderFrames.Title(string)
            const interval = getInterval.SingleTime(headFrames.length, duration)
            resolve(await animate.Repeat(headFrames, interval))
        })
    }
}


const custom = {
    tag,
    style,
    color,
    canvas,
    animate,
    getInterval,
    renderFrames,
}

export default {
    custom,
    list,
    make,
    PLAY: play,
    TASK: task,
    POST: post,
    HEAD: head,
}





















// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });
// export const form = async (question, options = []) => {

//     const askQuestion = async (question) => {
//         return new Promise((resolve) => {
//             rl.question(question, (answer) => {
//                 resolve(answer);
//             });
//         });
//     }
//     const pickOption = async (question, options) => {
//         let picked = 0;
//         let picking = true;

//         readline.emitKeypressEvents(process.stdin);
//         process.stdin.setRawMode(true);

//         function displayOptions(showOptions, firstLoad = false) {
//             if (showOptions) {
//                 if (!firstLoad) clearPreviousLines(options.length + 6);
//                 console.log(question)
//                 console.log(`    >>> ${options[picked]}\n`)
//                 options.forEach((option, index) => {
//                     if (index === picked) {
//                         console.log(`    >>> ${option}`);
//                     } else {
//                         console.log(`    >--    ${option}`);
//                     }
//                 });
//                 console.log("\n[Use 'up' and 'down' arrow to pick option.]");
//             }
//             else clearPreviousLines(options.length + 4);
//         }

//         return new Promise((resolve) => {
//             function onKeyPress(str, key) {
//                 if (key.name === 'up') {
//                     picked = (picked > 0) ? picked - 1 : options.length - 1;
//                 } else if (key.name === 'down') {
//                     picked = (picked < options.length - 1) ? picked + 1 : 0;
//                 } else if (key.name === 'return') {
//                     resolve(picked);
//                     picking = false;
//                     process.stdin.setRawMode(false);
//                     process.stdin.off('keypress', onKeyPress)
//                 } else { }
//                 displayOptions(picking);
//             }
//             displayOptions(picking, true);
//             process.stdin.on('keypress', onKeyPress)
//         });
//     }
//     let response;
//     question = `\n ${question}: `
//     if (options.length) {
//         response = await pickOption(question, options)
//     } else {
//         response = await askQuestion(question)
//     }
//     rl.close();
//     return response;
// }

// function getLongestKeyValueLength(obj) {
//     let maxString = 0;
//     let maxKey = 0;
//     let maxValue = 0;
//     Object.entries(obj).forEach(([key, value]) => {
//         const combinedLength = key.length + value.length;
//         if (combinedLength > maxString) {
//             maxString = combinedLength;
//         }
//         if (key.length > maxKey) {
//             maxKey = key.length;
//         }
//         if (value.length > maxValue) {
//             maxValue = value.length;
//         }
//     });
//     return { string: maxString, key: maxKey, value: maxValue };
// }

// export const table = (commands, heading) => {
//     const maxStringSize = getLongestKeyValueLength(commands);
//     const tableWidth = 12 + Math.max(maxStringSize.string, heading.length);
//     const separator = '─'.repeat(tableWidth);
//     const headingWidth = tableWidth - 4;
//     const headingLine = `││${heading.padStart((headingWidth + heading.length) / 2).padEnd(headingWidth)}││`;

//     const rows = Object.entries(commands).map(([key, value]) => {
//         const keyColumn = key.padEnd(maxStringSize.key);
//         const valueColumn = value.padEnd(maxStringSize.value);
//         return `││  ${keyColumn}  │ ${valueColumn}  ││`;
//     });

//     return [
//         separator,
//         headingLine,
//         separator,
//         ...rows,
//         separator
//     ].join('\n');
// }



// export const formatOptions = (array, doPrefix = false) => {
//     return array.map((item, index) => {
//         let prefix = '';
//         if (doPrefix) {
//             const uppercaseLetters = item.match(/[A-Z]/g);
//             if (uppercaseLetters) {
//                 prefix = uppercaseLetters.join('') + ': ';
//             }
//         }
//         return `${index + 1}. ${prefix}${item}`;
//     });
// }