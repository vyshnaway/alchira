export enum _Type {
    NULL,
    LOCAL,
    GLOBAL,
    PUBLIC,
    LIBRARY,
    ARCHIVE,
    ARCTACH,
    ARTIFACT
};

export const _Import = [
    '',
    'LOCAL',
    'GLOBAL',
    'PUBLIC',
    'LIBRARY',
    'ARCHIVE',
    'ARCTACH',
    'ARTIFACT'
];

export interface ExportStyle {
    element: string,
    symclass: string,
    innertext: string,
    stylesheet: object,
    attachments: string[]
}

export interface ParsedResult {
    assign: string[],
    attachment: string[],
    variables: Record<string, string>,
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
    skeleton: object,
    declarations: string[],
    watchclass: string,
    variables: Record<string, string>,
    summon: string,
    attributes: Record<string, string>
}

export interface Classdata {
    index?: number,
    metadata: Metadata,
    artifact: string,
    selector: string,
    symclass: string,
    debugclass: string,
    attachments: string[],
    declarations: string[],
    style_object: Record<string, object>,
    snippet_staple: string,
    snippet_style: object,
}

export type Dictionary = Record<string, Record<number, string>>;

export type ClassIndexMap = Record<string, number>;

export interface SortedOutput {
    counted: number;
    referenceMap: Record<string, Record<number, number>>;
    shortlistedArrays: number[][]
};
