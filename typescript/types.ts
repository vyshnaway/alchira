/* eslint-disable @typescript-eslint/naming-convention */
import C_Proxy from "./Script/class.js";


// --- Initial Data ---

export type t_COMMAND = ""
    | "init"
    | "debug"
    | "preview"
    | "publish"
    | "archive"
    | "install";

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
    customOps: Record<string, string>
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

export interface t_Cumulates {
    report: string[],
    errors: string[],
    usedIndexes: number[],
    diagnostics: t_Diagnostic[],
    globalClasses: Record<string, number>,
    publicClasses: Record<string, number>,
    fileManifests: Record<string, t_FILE_Manifest>
}

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


export type t_ClassDictionary = Record<string, Record<number, string>>;
export type t_ClassIndexMap = Record<string, number>;

export interface t_OrganizedResult {
    indexMap: Record<string, number>;
    classcount: number;
    referenceMap: t_ClassDictionary;
    shortlistedArrays: number[][]
};

export interface t_Diagnostic {
    error: string,
    source: string[]
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
    public: Record<string, t_ClassMeta>,
    global: Record<string, t_ClassMeta>,
    local: Record<string, t_ClassMeta>,
    errors: string[],
    diagnostics: t_Diagnostic[],
}

export interface t_FILE_Storage {
    classFront: string,
    filePath: string,
    packageName: string,
    extension: string,
    sourcePath: string,
    targetPath: string,
    debugclassFront: string,
    content: string,
    midway: string,
    manifest: t_FILE_Manifest,
    styleData: {
        attachments: string[],
        classesList: string[][],
        usedIndexes: Set<number>,
        localClasses: Record<string, number>,
        globalClasses: Record<string, number>,
        publicClasses: Record<string, number>,
        styleMap: Record<string, t_ClassMeta>,
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
}

export interface t_ProxyMapStatic extends t_ProxyMap {
    fileContents: Record<string, string>,
    stylesheetContent: string
}

interface t_Config_Archive_Intersection {
    Name: string,
    Version: string,
}

export interface t_Config extends t_Config_Archive_Intersection {
    vendors: string,
    packages: Record<string, string>,
    proxy: t_ProxyMap[],
    tweaks: t_Data_TWEAKS
}

export interface t_Archive extends t_Config_Archive_Intersection {
    Readme: string,
    vendors?: string,
    packages?: Record<string, string>,
    proxy?: t_ProxyMap[],
    tweaks?: t_Data_TWEAKS
}


// --- Cache Varients ---

export interface t_CACHE_LIVEDOCS {
    DeltaPath: string,
    DeltaContent: string,
    FinalError: string,
    FinalMessage: string,
    ErrorCount: number,
    WarningCount: number,
    ShellDoc: {
        library: string,
        package: string,
        project: string,
        constants: string,
        hashrule: string,
        errors: string,
        memChart: string,
        footer: string,
    },
    Lookup: {
        library: Record<string, t_FILE_Reference>,
        package: Record<string, t_FILE_Reference>,
        project: Record<string, t_FILE_Reference>,
    },
    Errors: {
        library: string[],
        package: string[],
        project: string[],
    },
    Diagnostics: {
        library: t_Diagnostic[],
        package: t_Diagnostic[],
        project: t_Diagnostic[],
    },
    Manifest: {
        prefix: string,
        elements: string[],
        constants: string[],
        hashrules: Record<string, string>,
        file: Record<string, t_FILE_Reference>,
        AXIOM: Record<string, Record<string, t_ClassMeta>>,
        CLUSTER: Record<string, Record<string, t_ClassMeta>>,
        LOCAL: Record<string, Record<string, t_ClassMeta>>,
        GLOBAL: Record<string, Record<string, t_ClassMeta>>,
        PACKAGE: Record<string, Record<string, t_ClassMeta>>,
        PACBIND: Record<string, Record<string, t_ClassMeta>>,
        errors: t_Diagnostic[]
    },
}

export interface t_CACHE_STATIC {
    WATCH: boolean,
    DEBUG: boolean,
    Command: string,
    Argument: string,
    Project_Name: string,
    Project_Version: string,
    CSSIndex: string,
    RootPath: string,
    WorkPath: string,
    Package: t_Archive,
    ProxyMap: t_ProxyMap[],
    HashRule: Record<string, string>,
    Package_Saved: Record<string, string>,
    Library_Saved: Record<string, string>,
    Targets_Saved: Record<string, t_ProxyMapStatic>,
}

export interface t_CACHE_DYNAMIC {
    HashRule: Record<string, string>,
    Index_ClassData: Record<string, t_ClassData>,
    GlobalClass__Index: t_ClassIndexMap,
    PublicClass__Index: t_ClassIndexMap,
    ArchiveClass_Index: t_ClassIndexMap,
    LibraryClass_Index: t_ClassIndexMap,
    PackageClass_Index: t_ClassIndexMap,
    Final_ClassIndexMap: t_ClassIndexMap,
    Computed_ClassDictionary: t_ClassDictionary,
};

export interface t_CACHE_STORAGE {
    LIBRARIES: Record<string, t_FILE_Storage>,
    PACKAGES: Record<string, t_FILE_Storage>,
    PROJECT: Record<string, C_Proxy>,
}