/* eslint-disable @typescript-eslint/naming-convention */
import c_Target from "./Script/class.js";


// --- Initial Data ---

export type COMMAND = ""
    | "init"
    | "debug"
    | "preview"
    | "publish"
    | "archive"
    | "install";

export interface PackageEssential {
    bin: string;
    name: string;
    version: string;
    website: string;
}

export interface Data_PREFIX {
    atrules: Record<string, Record<string, string>>,
    attributes: Record<string, Record<string, string>>,
    pseudos: Record<string, Record<string, string>>,
    classes: Record<string, Record<string, string>>,
    elements: Record<string, Record<string, string>>,
    values: Record<string, Record<string, Record<string, string>>>,
}


export interface FileCursor {
    char: string | undefined,
    marker: number,
    rowMarker: number,
    colMarker: number,
    cycle: number,
    colFallback: number,
}

export interface FileScanBuffer {
    content: string,
    active: FileCursor,
    fallback: FileCursor,
}
export type Data_TWEAKS = Record<string, string | boolean>;

export interface Data_ROOT {
    bin: string,
    name: string,
    version: string,
    website: string,
    vendors: string[],
    commandList: Record<string, string>,
    exposedCommands: string[]
    defaultTweaks: Data_TWEAKS,
    customElements: Record<string, string>,
    customOperations: Record<string, string>
    customAtrules: Record<string, string>
    URL: Record<string, string>,
}

export interface Data_Source {
    path: string,
    frags: string[],
    essential?: boolean,
    content?: string,
    title?: string,
    url?: string,
}


// ---

export interface Cumulates {
    report: string[],
    errors: string[],
    usedIndexes: number[],
    diagnostics: Diagnostic[],
    globalClasses: Record<string, number>,
    publicClasses: Record<string, number>,
    fileManifests: Record<string, FILE_Manifest>
}

export interface Event {
    timeStamp: string,
    action: string,
    folder: string,
    filePath: string,
    fileContent: string,
    extension: string,
}

export interface TagRawStyle {
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


export interface ClassMeta {
    info: string[],
    variables: Record<string, string>,
    skeleton: object,
    declarations: string[],
    stencil: string,
    watchclass: string,
}

export interface ClassData {
    index?: number,
    package: string,
    scope: string,
    selector: string,
    debugclass: string,
    watchclass: string,
    attachments: string[],
    object: Record<string, object>,
    metadata: ClassMeta,
    declarations: string[],
    attached_style: object,
    attached_staple: string,
    attached_stencil: string
}


export type ClassDictionary = Record<string, Record<number, string>>;
export type ClassIndexMap = Record<string, number>;

export interface OrganizedResult {
    indexMap: Record<string, number>;
    classcount: number;
    referenceMap: ClassDictionary;
    shortlistedArrays: number[][]
};

export interface Diagnostic {
    error: string,
    source: string[]
}



// --- File Storage ---

export type FILE_Group = ""
    | "PACKAGE"
    | "PACBIND"
    | "STYLESHEET"
    | "AXIOM"
    | "CLUSTER"
    | "LOCAL"
    | "GLOBAL"
    | "TARGET"
    | "README";


export interface FILE_Reference {
    id: string;
    group: FILE_Group;
}

export interface FILE_Manifest {
    refer: FILE_Reference,
    public: Record<string, ClassMeta>,
    global: Record<string, ClassMeta>,
    local: Record<string, ClassMeta>,
    errors: string[],
    diagnostics: Diagnostic[],
}

export interface FILE_Storage {
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
    manifest: FILE_Manifest,
    styleData: {
        attachments: string[],
        classesList: string[][],
        usedIndexes: Set<number>,
        localClasses: Record<string, number>,
        globalClasses: Record<string, number>,
        publicClasses: Record<string, number>,
        styleMap: Record<string, ClassMeta>,
        styleTagReplaces: [number, number][],
        stapleTagReplaces: [number, number][],
    }
}


// Cache Support

export interface ProxyMap {
    source: string,
    target: string,
    stylesheet: '',
    extensions: Record<string, string[]>,
}

export interface ProxyMapStatic extends ProxyMap {
    fileContents: Record<string, string>,
    stylesheetContent: string
}

interface Config_Archive_Intersection {
    Name: string,
    Version: string,
}

export interface Config extends Config_Archive_Intersection {
    vendors: string,
    packages: Record<string, string>,
    proxy: ProxyMap[],
    tweaks: Data_TWEAKS
}

export interface Archive extends Config_Archive_Intersection {
    Readme: string,
    vendors?: string,
    packages?: Record<string, string>,
    proxy?: ProxyMap[],
    tweaks?: Data_TWEAKS
}


// --- Cache Varients ---

export interface CACHE_LIVEDOCS {
    DeltaPath: string,
    DeltaContent: string,
    PublishError: string,
    FinalMessage: string,
    ErrorCount: number,
    Report: {
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
        library: Record<string, FILE_Reference>,
        package: Record<string, FILE_Reference>,
        project: Record<string, FILE_Reference>,
    },
    Errors: {
        library: string[],
        package: string[],
        project: string[],
    },
    Diagnostics: {
        library: Diagnostic[],
        package: Diagnostic[],
        project: Diagnostic[],
    },
    Manifest: {
        prefix: string,
        elements: string[],
        constants: string[],
        hashrules: Record<string, string>,
        file: Record<string, FILE_Reference>,
        AXIOM: Record<string, Record<string, ClassMeta>>,
        CLUSTER: Record<string, Record<string, ClassMeta>>,
        LOCAL: Record<string, Record<string, ClassMeta>>,
        GLOBAL: Record<string, Record<string, ClassMeta>>,
        PACKAGE: Record<string, Record<string, ClassMeta>>,
        PACBIND: Record<string, Record<string, ClassMeta>>,
        errors: Diagnostic[]
    },
}

export interface CACHE_STATIC {
    WATCH: boolean,
    DEBUG: boolean,
    Command: string,
    Argument: string,
    Project_Name: string,
    Project_Version: string,
    RootCSS: string,
    RootPath: string,
    WorkPath: string,
    Package: Archive,
    ProxyMap: ProxyMap[],
    HashRule: Record<string, string>,
    Package_Saved: Record<string, string>,
    Library_Saved: Record<string, string>,
    TargeAS_Saved: Record<string, ProxyMapStatic>,
}

export interface CACHE_DYNAMIC {
    HashRule: Record<string, string>,
    Index_ClassData: Record<string, ClassData>,
    GlobalClass__Index: ClassIndexMap,
    PublicClass__Index: ClassIndexMap,
    ArchiveClass_Index: ClassIndexMap,
    ArcbindClass_Index: ClassIndexMap,
    LibraryClass_Index: ClassIndexMap,
    PackageClass_Index: ClassIndexMap,
    Sync_PublishIndexMap: ClassIndexMap,
    Sync_ClassDictionary: ClassDictionary,
};

export interface CACHE_STORAGE {
    LIBRARIES: Record<string, FILE_Storage>,
    PACKAGES: Record<string, FILE_Storage>,
    TARGET: Record<string, c_Target>,
}

// ---

export type ScriptParseActions = 'read' | 'archive' | 'monitor' | 'watch' | 'sync';