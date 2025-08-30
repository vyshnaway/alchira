/* eslint-disable @typescript-eslint/naming-convention */
import * as _support from "./support.js";
import * as _style from "./style.js";

export enum _Type {
    NULL = 0,
    PACKAGE = 1,
    PACBIND = 2,
    AXIOM = 3,
    CLUSTER = 4,
    TARGET = 5,
    STYLESHEET = 6,
    README = 7,
};

export const _Import = [
    '',
    'PACKAGE',
    'PACBIND',
    'AXIOM',
    'CLUSTER',
    'TARGET',
    'STYLESHEET',
    'README',
];



export type ClassMetaMap = Record<string, _style.Metadata>;

export interface Source {
    path: string,
    frags: string[],
    content: string,
}
export interface Sync extends Source {
    title: string,
    url: string,
}
export interface Path extends Source {
    essential: boolean,
    content: string,
}


export interface Position {
    char: string | undefined,
    marker: number,
    rowMarker: number,
    colMarker: number,
    cycle: number,
    colFallback: number,
}

export interface Reader {
    content: string,
    active: Position,
    fallback: Position,
}



export interface Lookup {
    id: string;
    type: _Type;
}

export interface LocalManifest {
    refer: Lookup,
    public: ClassMetaMap,
    global: ClassMetaMap,
    local: ClassMetaMap,
    errors: string[],
    diagnostics: _support.Diagnostic[],
}

export interface Storage {
    classFront: string,
    filePath: string,
    packageName: string,
    extension: string,
    sourcePath: string,
    targetPath: string,
    debugclassFront: string,
    content: string,
    midway: string,
    label: string,
    manifest: LocalManifest,
    styleData: {
        attachments: string[],
        classesList: string[][],
        usedIndexes: Set<number>,
        localClasses: _style.ClassIndexMap,
        globalClasses: _style.ClassIndexMap,
        publicClasses: _style.ClassIndexMap,
        styleMap: ClassMetaMap,
        styleTagReplaces: number[],
        stapleTagReplaces: number[],
    }
}