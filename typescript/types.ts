/* eslint-disable @typescript-eslint/naming-convention */
import C_Proxy from "./Script/class.js";

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

export interface t_FileMap {
    id: string;
    group: "" | "xtyling" | "binding" | "stylesheet" | "axiom" | "cluster" | "local" | "global";
}

export interface t_FileManifest {
    file: t_FileMap,
    global: Record<string, t_SelectorMeta>,
    local: Record<string, t_SelectorMeta>
}

export interface t_Data_FILING {
    id: string,
    group: string,
    stamp: string,
    cluster: string,
    filePath: string,
    fileName: string,
    extension: string,
    sourcePath: string,
    targetPath: string,
    metaFront: string,
    content: string,
    midway: string,
    manifest: t_FileManifest,
    styleData: {
        usedIndexes: Set<number>,
        essentials: [string, string | object][],
        styleGlobals: Record<string, number>,
        styleLocals: Record<string, number>,
        styleMap: Record<string, t_SelectorMeta>,
        classGroups: string[][],
        attachments: string[],
        errors: string[],
        hasMainTag: boolean,
        hasStyleTag: boolean,
        hasAttachTag: boolean,
        hasStencilTag: boolean,
    }
}

export interface t_SelectorMeta {
    info: string[],
    variables: Record<string, string>,
    skeleton: object,
    declarations: string[],
    element?: string,
    metaclass?: string,
    snippet?: string,
    structure?: string
}

export interface t_TagRawStyle {
    element: string,
    elvalue: string,
    tagCount: number,
    rowIndex: number,
    colIndex: number,
    tagOpenMarker: number,
    selector: string,
    scope: 'package' | 'essential' | 'local' | 'global' | 'public',
    comments: string[],
    styles: Record<string, string>
    snippet_Style: string,
    snippet_Attach: string,
    snippet_Stencil: string,
}



export interface t_ProxyMap {
    source: string,
    target: string,
    stylesheet: '',
    extensions: Record<string, string[]>,
    fileContents?: Record<string, string>,
    stylesheetContent?: string
}

export interface t_Event {
    timeStamp: string,
    action: string,
    folder: string,
    filePath: string,
    fileContent: string,
    extension: string,
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


export interface t_SelectorData {
    index?: number,
    miniClass?: string,
    package: string,
    scope: string,
    selector: string,
    metaClass: string,
    object: Record<string, object>,
    metadata: t_SelectorMeta,
    attachments: string[]
    declarations: string[],
    snippets: {
        Main: string,
        Style: string,
        Attach: string,
        Stencil: string,
    }
}

export type t_OrderedClassList = Record<string, Record<number, string>>;


export type t_OrganizedResultDictionary = Record<string, Record<number, string>>;

export interface t_OrganizedResult {
    referenceMap: t_OrganizedResultDictionary;
    indexMap: Record<string, number>;
    classes: number;
    shortlistedArrays: number[][]
};

export interface t_Diagnostic {
    source: string,
    diagnostic: string
}



// --- CACHE TYPES ---

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
        file: Record<string, t_FileMap>,
        axiom: Record<string, Record<string, t_SelectorMeta>>,
        cluster: Record<string, Record<string, t_SelectorMeta>>,
        local: Record<string, Record<string, t_SelectorMeta>>,
        global: Record<string, Record<string, t_SelectorMeta>>,
        xtyling: Record<string, Record<string, t_SelectorMeta>>,
        binding: Record<string, Record<string, t_SelectorMeta>>,
        errors: t_Diagnostic[]
    },
    LibFilesTemp: Record<string, t_FileMap>,
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
    PACKAGES: Record<string, string>,
    DEPENDENTS: Record<string, string>,
    PROXYFILES: Record<string, t_ProxyMap>,
    ARCHIVE: t_Archive,
}

export interface t_CACHE_DYNAMIC {
    HashRule: Record<string, string>,
    Index_ClassData: Record<string, t_SelectorData>,
    NativeClass__Index: Record<string, number>,
    GlobalClass__Index: Record<string, number>,
    PublicClass__Index: Record<string, number>,
    LibraryClass_Index: Record<string, number>,
    PackageClass_Index: Record<string, number>,
    Computed_ClassIndex: t_OrderedClassList,
};

export interface t_CACHE_STORAGE {
    LIBRARIES: Record<string, t_Data_FILING>,
    PACKAGES: Record<string, t_Data_FILING>,
    PROJECT: Record<string, C_Proxy>,
}