/* eslint-disable @typescript-eslint/naming-convention */
import * as _style from "./style.js";
import * as _file from "./file.js";

export enum _Actions {
    read = 0,
    sync = 1,
    watch = 2,
    monitor = 3,
    artifact = 4,
};

export interface RawStyle {
    elid: number,
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

export interface Cumulated {
    report: string[],
    globalClasses: Record<string, number>,
    publicClasses: Record<string, number>,
    fileManifests: Record<string, _file.LocalManifest>
}
