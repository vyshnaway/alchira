export enum _Type {
    NULL = 0,
    LOCAL = 1,
    GLOBAL = 2,
    PUBLIC = 3,
    LIBRARY = 4,
    EXTERNAL = 5,
    ARTIFACT = 6,
    ARTATTACH = 7,
};

export const _Import = [
    '',
    'LOCAL',
    'GLOBAL',
    'PUBLIC',
    'LIBRARY',
    'EXTERNAL',
    'ARTIFACT',
    'ARTATTACH',
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
    summon: string,
    staple: string,
    watch: string,
}

export interface Classdata {
    index?: number,
    metadata: Metadata,
    artifact: string,
    selector: string,
    classname: string,
    debugclass: string,
    attachments: string[],
    declarations: string[],
    style_object: Record<string, object>,
    attached_style: object,
}

export type Dictionary = Record<string, Record<number, string>>;

export type ClassIndexMap = Record<string, number>;

export interface SortedOutput {
    counted: number;
    referenceMap: Record<string, Record<number, number>>;
    shortlistedArrays: number[][]
};
