/* eslint-disable @typescript-eslint/naming-convention */
import * as _support from "./support.js";
import * as _style from "./style.js";

export type Group = ""
    | "PACKAGE"
    | "PACBIND"
    | "STYLESHEET"
    | "AXIOM"
    | "CLUSTER"
    | "LOCAL"
    | "GLOBAL"
    | "TARGET"
    | "README";

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
    group: Group;
}

export interface Manifest {
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
    manifest: Manifest,
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