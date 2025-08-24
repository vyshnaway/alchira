/* eslint-disable @typescript-eslint/naming-convention */
import C_Proxy from "./Script/class.js";


// --- Initial Data ---

export type t_COMMAND = "" | "init" | "debug" | "preview" | "publish" | "archive" | "install";

export interface T_PackageEssential {
    name: string;
    version: string;
    website: string;
    bins: string[];
    scripts: Record<string, string>;
}

export interface t_Data_PREFIX {
    atrules: Record<string, Record<string, string>>,
    attributes: Record<string, Record<string, string>>,
    pseudos: Record<string, Record<string, string>>,
    classes: Record<string, Record<string, string>>,
    elements: Record<string, Record<string, string>>,
    values: Record<string, Record<string, Record<string, string>>>,
}


export interface t_FileCursor {
    char: string | undefined,
    marker: number,
    rowMarker: number,
    colMarker: number,
    tagCount: number,
    colFallback: number,
}

export interface t_FileScanBuffer {
    content: string,
    active: t_FileCursor,
    fallback: t_FileCursor,
}
export type t_Data_TWEAKS = Record<string, string | boolean>;

export interface t_Data_ORIGIN {
    name: string,
    version: string,
    website: string,
    bins: string[],
    vendors: string[],
    commandList: Record<string, string>,
    exposedCommands: string[]
    defaultTweaks: t_Data_TWEAKS,
    customTag: Record<string, string>,
    URL: Record<string, string>,
}

export interface t_Data_Source {
    path: string,
    frags: string[],
    content?: string,
    title?: string,
    url?: string,
}


// ---



export interface t_Event {
    timeStamp: string,
    action: string,
    folder: string,
    filePath: string,
    fileContent: string,
    extension: string,
}
export interface t_TagRawStyle {
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


export interface t_ClassMeta {
    info: string[],
    variables: Record<string, string>,
    skeleton: object,
    declarations: string[],
    element: string,
    stencil: string,
    watchclass: string,
}

export interface t_ClassData {
    index?: number,
    package: string,
    scope: string,
    selector: string,
    debugclass: string,
    watchclass: string,
    object: Record<string, object>,
    metadata: t_ClassMeta,
    attachments: string[]
    declarations: string[],
    attached_style: object,
    attached_staple: string,
    attached_stencil: string
}


export type t_OrganizedResultDictionary = Record<string, Record<number, string>>;

export interface t_OrganizedResult {
    referenceMap: t_OrganizedResultDictionary;
    indexMap: Record<string, number>;
    classes: number;
    shortlistedArrays: number[][]
};

export interface t_Diagnostic {
    source: string,
    cause: string
}



// --- File Storage ---

export type t_FILE_Group = ""
    | "PACKAGE"
    | "PACBIND"
    | "STYLESHEET"
    | "AXIOM"
    | "CLUSTER"
    | "LOCAL"
    | "GLOBAL"
    | "TARGET"
    | "README";


export interface t_FILE_Reference {
    id: string;
    group: t_FILE_Group;
}

export interface t_FILE_Manifest {
    refer: t_FILE_Reference,
    global: Record<string, t_ClassMeta>,
    local: Record<string, t_ClassMeta>
}

export interface t_FILE_Storage {
    xcssclassFront: string,
    filePath: string,
    packageName: string,
    extension: string,
    sourcePath: string,
    targetPath: string,
    metaclassFront: string,
    content: string,
    midway: string,
    manifest: t_FILE_Manifest,
    styleData: {
        usedIndexes: Set<number>,
        styleGlobals: Record<string, number>,
        styleLocals: Record<string, number>,
        styleMap: Record<string, t_ClassMeta>,
        classGroups: string[][],
        attachments: string[],
        errors: string[],
        diagnostics: t_Diagnostic[],
        hasMainTag: boolean,
        hasStyleTag: boolean,
        hasAttachTag: boolean,
        hasStencilTag: boolean,
    }
}


// Cache Support

export interface t_ProxyMap {
    source: string,
    target: string,
    stylesheet: '',
    extensions: Record<string, string[]>,
    fileContents?: Record<string, string>,
    stylesheetContent?: string
}

interface t_Config_Archive_Intersection {
    name: string,
    version: string,
}

export interface t_Config extends t_Config_Archive_Intersection {
    vendors: string,
    packages: Record<string, string>,
    proxy: t_ProxyMap[],
    tweaks: t_Data_TWEAKS
}

export interface t_Archive extends t_Config_Archive_Intersection {
    readme: string,
    vendors?: string,
    packages?: Record<string, string>,
    proxy?: t_ProxyMap[],
    tweaks?: t_Data_TWEAKS
}


// --- Cache Varients ---

export interface t_CACHE_REPORT {
    DeltaPath: string,
    DeltaContent: string,
    FinalError: string,
    FinalMessage: string,
    ErrorCount: number,
    WarningCount: number,
    Content: {
        library: string,
        variables: string,
        hashrule: string,
        targets: string,
        errors: string,
        memChart: string,
        footer: string,
    },
    MANIFEST: {
        prefix: string,
        elements: string[],
        constants: string[],
        hashrules: Record<string, string>,
        file: Record<string, t_FILE_Reference>,
        axiom: Record<string, Record<string, t_ClassMeta>>,
        cluster: Record<string, Record<string, t_ClassMeta>>,
        local: Record<string, Record<string, t_ClassMeta>>,
        global: Record<string, Record<string, t_ClassMeta>>,
        xtyling: Record<string, Record<string, t_ClassMeta>>,
        binding: Record<string, Record<string, t_ClassMeta>>,
        errors: t_Diagnostic[]
    },
    LibFilesTemp: Record<string, t_FILE_Reference>,
}

export interface t_CACHE_STATIC {
    COMMAND: string,
    ARGUMENT: string,
    WATCH: boolean,
    PROJECT_NAME: string,
    PROJECT_VERSION: string,
    FALLBACK_NAME: string,
    FALLBACK_VERSION: string,
    CSSIndex: string,
    RootPath: string,
    WorkPath: string,
    PROXYMAP: t_ProxyMap[],
    HASHRULE: Record<string, string>,
    LIBRARIES: Record<string, string>,
    PROXYFILES: Record<string, t_ProxyMap>,
    PACKAGES: Record<string, string>,
    ARCHIVE: t_Archive,
}

export interface t_CACHE_DYNAMIC {
    HashRule: Record<string, string>,
    Index_ClassData: Record<string, t_ClassData>,
    GlobalClass__Index: Record<string, number>,
    PublicClass__Index: Record<string, number>,
    ArchiveClass_Index: Record<string, number>,
    LibraryClass_Index: Record<string, number>,
    PackageClass_Index: Record<string, number>,
    Computed_ClassIndex: t_OrganizedResultDictionary,
};

export interface t_CACHE_STORAGE {
    LIBRARIES: Record<string, t_FILE_Storage>,
    PACKAGES: Record<string, t_FILE_Storage>,
    PROJECT: Record<string, C_Proxy>,
}