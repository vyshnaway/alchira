/* eslint-disable @typescript-eslint/naming-convention */
import * as _support from "./support.js";
import * as _style from "./style.js";
import * as _file from "./file.js";

export enum _Actions {
    read = 0,
    sync = 1,
    watch = 2,
    monitor = 3,
    archive = 4,
};

export interface RawStyle {
    element: string,
    elvalue: string,
    tagCount: number,
    rowIndex: number,
    colIndex: number,
    tagOpenMarker: number,
    selector: string,
    scope: _style._Type,
    comments: string[],
    styles: Record<string, string>
    attachstring: string,
}

export interface Cumulates {
    report: string[],
    errors: string[],
    usedIndexes: number[],
    diagnostics: _support.Diagnostic[],
    globalClasses: Record<string, number>,
    publicClasses: Record<string, number>,
    fileManifests: Record<string, _file.LocalManifest>
}
