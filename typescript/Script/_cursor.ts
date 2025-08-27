import * as TYPE from "../types.js";

function Initialize(content: string): TYPE.FileScanBuffer {
    const fileScanner: TYPE.FileScanBuffer = {
        content,
        active: {
            char: '',
            marker: 0,
            rowMarker: 0,
            colMarker: 0,
            cycle: 0,
            colFallback: 0,
        },
        fallback: {
            char: '',
            marker: 0,
            rowMarker: 0,
            colMarker: 0,
            cycle: 0,
            colFallback: 0,
        },
    };

    fileScanner.active.char = content[fileScanner.active.marker];
    if (fileScanner.active.char === "\n") {
        fileScanner.active.rowMarker++;
        fileScanner.active.colMarker = 0;
    } else {
        fileScanner.active.colMarker++;
    }
    return fileScanner;
}

function Incremnet(fileScanner: TYPE.FileScanBuffer) {
    fileScanner.active.char = fileScanner.content[++fileScanner.active.marker];
    if (fileScanner.active.char === "\n") {
        fileScanner.active.rowMarker++;
        fileScanner.active.colFallback = fileScanner.active.colMarker;
        fileScanner.active.colMarker = 0;
    } else {
        fileScanner.active.colMarker++;
    }
    return fileScanner.active.char;
}

function Decrement(fileScanner: TYPE.FileScanBuffer) {
    fileScanner.active.char = fileScanner.content[--fileScanner.active.marker];
    if (fileScanner.active.char === "\n") {
        fileScanner.active.rowMarker--;
        fileScanner.active.colMarker = fileScanner.active.colFallback;
    } else {
        fileScanner.active.colMarker--;
    }
    return fileScanner.active.char;
}

export default {
    Initialize,
    Decrement,
    Incremnet
};