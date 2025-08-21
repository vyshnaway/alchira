export default class ScriptCursor {
    marker = 0;
    rowMarker = 0;
    colMarker = 0;
    colFallback = 0;
    tagCount = 0;
    char = "";

    fallback_marker = 0;
    fallback_rowMarker = 0;
    fallback_colMarker = 0;
    fallback_colFallback = 0;
    fallback_tagCount = 0;
    fallback_char = "";

    constructor(private content: string) {
        this.char = content[0] ?? "";
        if (this.char === "\n") {
            this.rowMarker = 1;
            this.colMarker = 0;
        } else {
            this.colMarker = 1;
        }
    }

    increment(): string {
        if (this.marker + 1 >= this.content.length) { return ''; }

        this.char = this.content[++this.marker];
        if (this.char === "\n") {
            this.rowMarker++;
            this.colFallback = this.colMarker;
            this.colMarker = 0;
        } else {
            this.colMarker++;
        }
        return this.char;
    }

    decrement(): string {
        if (this.marker - 1 < 0) { return ''; }

        this.char = this.content[--this.marker];
        if (this.char === "\n") {
            this.rowMarker--;
            this.colMarker = this.colFallback;
        } else {
            this.colMarker--;
        }
        return this.char;
    }

    saveFallback() {
        this.fallback_marker = this.marker;
        this.fallback_rowMarker = this.rowMarker;
        this.fallback_colMarker = this.colMarker;
        this.fallback_colFallback = this.colFallback;
        this.fallback_tagCount = this.tagCount;
        this.fallback_char = this.char;
    }

    loadFallback() {
        this.marker = this.fallback_marker;
        this.rowMarker = this.fallback_rowMarker;
        this.colMarker = this.fallback_colMarker;
        this.colFallback = this.fallback_colFallback;
        this.tagCount = this.fallback_tagCount;
        this.char = this.fallback_char;
    }

    getPosition() {
        return {
            marker: this.marker,
            row: this.rowMarker,
            col: this.colMarker,
            char: this.char,
        };
    }
}