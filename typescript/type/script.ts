/* eslint-disable @typescript-eslint/naming-convention */
import * as _support from "./support.js";
import * as _file from "./file.js";

export interface Cumulates {
    report: string[],
    errors: string[],
    usedIndexes: number[],
    diagnostics: _support.Diagnostic[],
    globalClasses: Record<string, number>,
    publicClasses: Record<string, number>,
    fileManifests: Record<string, _file.Manifest>
}

export interface RawStyle {
    element: string,
    elvalue: string,
    tagCount: number,
    rowIndex: number,
    colIndex: number,
    tagOpenMarker: number,
    selector: string,
    scope: '' | 'PACKAGE' | 'LOCAL' | 'GLOBAL' | 'PUBLIC',
    comments: string[],
    styles: Record<string, string>
    attachstring: string,
}

export type Actions = 'read' | 'archive' | 'monitor' | 'watch' | 'sync';