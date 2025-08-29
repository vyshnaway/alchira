
export interface ParsedResult {
    assign: string[],
    attachment: string[],
    constants: Record<string, string>,
    XatProps: [string, string][],
    atProps: Record<string, string>,
    Xproperties: [string, string][],
    properties: Record<string, string>,
    XatRules: [string, string][],
    atRules: Record<string, string>,
    Xnested: [string, string][],
    nested: Record<string, string>,
    Xclasses: [string, string][],
    classes: Record<string, string>,
    Xflats: [string, string][],
    flats: Record<string, string>,
    XallBlocks: [string, string][],
    allBlocks: Record<string, string>,
}

export interface Metadata {
    info: string[],
    constants: Record<string, string>,
    skeleton: object,
    declarations: string[],
    stencil: string,
    watchclass: string,
}

export interface Classdata {
    index?: number,
    package: string,
    scope: string,
    selector: string,
    debugclass: string,
    watchclass: string,
    attachments: string[],
    object: Record<string, object>,
    metadata: Metadata,
    declarations: string[],
    attached_style: object,
    attached_staple: string,
    attached_stencil: string
}

export type Dictionary = Record<string, Record<number, string>>;

export type ClassIndexMap = Record<string, number>;

export interface SortedOutput {
    classcount: number;
    indexMap: ClassIndexMap;
    referenceMap: Dictionary;
    shortlistedArrays: number[][]
};

export type Group = ""
    | "PACKAGE"
    | "LIBRARY"
    | "ARCBIND"
    | "ARCHIVE"
    | "GLOBAL"
    | "PUBLIC"
    | "LOCAL";