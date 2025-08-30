export enum _Type {
    NULL = 0,
    LOCAL = 1,
    GLOBAL = 2,
    PUBLIC = 3,
    PACKAGE = 4,
    LIBRARY = 5,
    ARCBIND = 6,
    ARCHIVE = 7,
};

export const _Import = [
    '',
    'LOCAL',
    'GLOBAL',
    'PUBLIC',
    'PACKAGE',
    'LIBRARY',
    'ARCBIND',
    'ARCHIVE',
];



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
}

export interface Classdata {
    index?: number,
    package: string,
    selector: string,
    debugclass: string,
    watchclass: string,
    attachments: string[],
    declarations: string[],
    metadata: Metadata,
    style_object: Record<string, object>,
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
