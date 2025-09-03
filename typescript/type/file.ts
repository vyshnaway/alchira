/* eslint-disable @typescript-eslint/naming-convention */
import * as _support from "./support.js";
import * as _style from "./style.js";

export type _Type = "NULL" | "EXTERNAL" | "EXATTACH" | "AXIOM" | "CLUSTER" | "TARGET" | "STYLESHEET" | "README";


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
    lookup: Lookup,
    public: ClassMetaMap,
    global: ClassMetaMap,
    local: ClassMetaMap,
    errors: string[],
    diagnostics: _support.Diagnostic[],
}

export interface Storage {
    liblevel: number,
    artifact: string,
    filePath: string,
    extension: string,
    classFront: string,
    sourcePath: string,
    targetPath: string,
    content: string,
    midway: string,
    scratch: string,
    label: string,
    manifesting: LocalManifest,
    debugclassFront: string,
    styleData: {
        attachments: string[],
        classTracks: string[][],
        usedIndexes: Set<number>,
        localClasses: _style.ClassIndexMap,
        globalClasses: _style.ClassIndexMap,
        publicClasses: _style.ClassIndexMap,
        styleMap: ClassMetaMap,
        tagReplacements: [ElementId: number, Position: number][]
    }
}