/* eslint-disable @typescript-eslint/naming-convention */
import C_Proxy from "./Script/class.js";

export interface T_PackageEssential {
    name: string;
    version: string;
    website: string;
    scripts: Record<string, string>;
    bins: string[];
}

export interface T_PackageJson {
    name?: string;
    version?: string;
    description?: string;
    main?: string;
    scripts?: Record<string, string>;
    keywords?: string[];
    author?: string;
    license?: string;
    homepage?: string;
    repository?: {
        type: string;
        url: string;
    };
    bugs?: {
        url: string;
        email: string;
    };
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    bin?: Record<string, string>;
}

export type t_Data_TWEAKS = Record<string, string | boolean>;

export interface t_Data_APP {
    name: string,
    version: string,
    website: string,
    bins: string[],
    vendors: string[],
    commandList: Record<string, string>,
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

export interface t_Data_PREFIX {
    atrules: Record<string, Record<string, string>>,
    attributes: Record<string, Record<string, string>>,
    pseudos: Record<string, Record<string, string>>,
    classes: Record<string, Record<string, string>>,
    elements: Record<string, Record<string, string>>,
    values: Record<string, Record<string, Record<string, string>>>,
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
    contentStart: number,
    intrimEnding: number,
    selector: string,
    scope: 'package' | 'essential' | 'local' | 'global' | 'public',
    comments: string[],
    styles: Record<string, string>
    snippet_Style: string,
    snippet_Attach: string,
    snippet_Stencil: string,
}


export interface t_PUBLISH {
    DeltaPath: string,
    DeltaContent: string,
    FinalError: string,
    FinalMessage: string,
    ErrorCount: number,
    WarningCount: number,
    Report: {
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
        file: Record<string, t_FileMap>;
        axiom: Record<string, Record<string, t_SelectorMeta>>;
        cluster: Record<string, Record<string, t_SelectorMeta>>;
        local: Record<string, Record<string, t_SelectorMeta>>;
        global: Record<string, Record<string, t_SelectorMeta>>;
        xtyling: Record<string, Record<string, t_SelectorMeta>>;
        binding: Record<string, Record<string, t_SelectorMeta>>;
    },
    LibFilesTemp: Record<string, t_FileMap>,
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
    proxy: t_ProxyMap[],
    portables: Record<string, string>,
    tweaks: t_Data_TWEAKS
}

export interface t_Archive extends t_Config_Archive_Intersection {
    vendors?: string,
    proxy?: t_ProxyMap[],
    portables?: Record<string, string>,
    tweaks?: t_Data_TWEAKS
}


export interface t_SelectorData {
    index?: number,
    miniClass?: string,
    portable: string,
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

export interface t_CACHE {
    HashRule: Record<string, string>,
    SortedIndexes: number[],
    PortableEssentials: [string, string | object][],
    Index2StylesObject: Record<string, t_SelectorData>,
    NativeStyle2Index: Record<string, number>,
    LibraryStyle2Index: Record<string, number>,
    GlobalsStyle2Index: Record<string, number>,
    PortableStyle2Index: Record<string, number>,
    FinalStack: Record<string, number>,
    Archive: t_Archive,
};

export interface t_RAW {
    COMMAND: string,
    ARGUMENT: string,
    ReadMe: string,
    WATCH: boolean,
    PACKAGE: string,
    VERSION: string,
    CSSIndex: string,
    RootPath: string,
    WorkPath: string,
    PROXYMAP: t_ProxyMap[],
    HASHRULE: Record<string, string>,
    LIBRARIES: Record<string, string>,
    PORTABLES: Record<string, string>,
    DEPENDENTS: Record<string, string>,
    PROXYFILES: Record<string, Record<string, string>>,
}


export interface t_Stack {
    PROXYCACHE: Record<string, C_Proxy>,
    LIBRARIES: Record<string, t_Data_FILING>,
    PORTABLES: Record<string, t_Data_FILING>,
}

export type t_OrganizedResultDictionary = Record<string, Record<number, string>>;

export interface t_OrganizedResult {
    referenceMap: t_OrganizedResultDictionary;
    indexMap: Record<string, number>;
    classes: number;
    shortlistedArrays: number[][]
};

export type t_COMMAND = "init" | "watch" | "preview" | "publish" | "archive" | "install";