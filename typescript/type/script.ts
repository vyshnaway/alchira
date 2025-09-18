/* eslint-disable @typescript-eslint/naming-convention */
import * as _style from "./style.js";
import * as _file from "./file.js";

export enum _Actions {
    read = 0,
    sync = 1,
    watch = 2,
    monitor = 3,
};

export interface RawStyle {
    elid: number,
    element: string,
    elvalue: string,
    tagCount: number,
    rowIndex: number,
    colIndex: number,
    endMarker: number,
    symclasses: string[],
    scope: _style._Type,
    comments: string[],
    attachstring: string,
    styles: Record<string, string>
    attributes: Record<string, string>,
}

export interface Cumulated {
    report: string[],
    globalClasses: Record<string, number>,
    publicClasses: Record<string, number>,
    fileManifests: Record<string, _file.LocalManifest>
}
