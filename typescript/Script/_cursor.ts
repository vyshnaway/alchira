// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";


function Initialize(content: string): _File.Reader {
    const fileScanner: _File.Reader = {
        content,
        active: {
            char: '',
            marker: 0,
            rowMarker: 1,
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

function Incremnet(fileScanner: _File.Reader) {
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

function Decrement(fileScanner: _File.Reader) {
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