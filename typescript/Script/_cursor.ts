// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";


export default class Cursor {
    content: string;
    active: _File.Position;
    fallback: _File.Position;

    constructor(content: string) {
        this.content = content;
        this.active = {
            last: '',
            char: '',
            next: '',
            marker: 0,
            rowMarker: 1,
            colMarker: 0,
            cycle: 0,
            colFallback: 0,
        };
        this.fallback = {
            last: '',
            char: '',
            next: '',
            marker: 0,
            rowMarker: 0,
            colMarker: 0,
            cycle: 0,
            colFallback: 0,
        };
        this.active.char = this.content[this.active.marker];
        if (this.active.char === "\n") {
            this.active.rowMarker++;
            this.active.colMarker = 0;
        } else {
            this.active.colMarker++;
        }
    }

    increment(): string {
        this.active.last = this.active.char;
        this.active.char = this.content[++this.active.marker];
        this.active.next = this.content[this.active.marker + 1];
        if (this.active.char === "\n") {
            this.active.rowMarker++;
            this.active.colFallback = this.active.colMarker;
            this.active.colMarker = 0;
        } else {
            this.active.colMarker++;
        }
        return this.active.char;
    }

    decrement(): string {
        this.active.next = this.active.char;
        this.active.char = this.content[--this.active.marker];
        this.active.last = this.content[this.active.marker - 1];
        if (this.active.char === "\n") {
            this.active.rowMarker--;
            this.active.colMarker = this.active.colFallback;
        } else {
            this.active.colMarker--;
        }
        return this.active.char;
    }

    savefallback() {
        Object.assign(this.fallback, this.active);
    }

    loadfallback() {
        Object.assign(this.active, this.fallback);
    }
}