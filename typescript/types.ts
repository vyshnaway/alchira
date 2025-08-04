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
    [key: string]: unknown,
    atrules?: Record<string, Record<string, string>>,
    attributes?: Record<string, Record<string, string>>,
    pseudos?: Record<string, Record<string, string>>,
    classes?: Record<string, Record<string, string>>,
    elements?: Record<string, Record<string, string>>,
    values?: Record<string, Record<string, Record<string, string>>>,
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
    styleData: {
        usedIndexes: Set<string>,
        essentials: string[],
        styleGlobals: Record<string, object>,
        styleLocals: Record<string, object>,
        styleMap: Record<string, t_XtyleData>,
        classGroups: string[][],
        postBinds: string[],
        preBinds: number[],
        errors: string[],
        hasStyleTag: boolean,
        hasSnippetTag: boolean,
        hasStylesheetTag: boolean,
    }
}

export interface t_XtyleData {
    info: string[],
    variables: Record<string, string>,
    skeleton: Record<string, unknown>,
    declarations: string[],
    element?: string,
    metaclass?: string,
    snippet?: string,
    structure?: string,
    markdown?: string
}


export interface t_FileMap {
    group: "xtyling" | "binding" | "stylesheet" | "axiom" | "cluster" | "local" | "global";
    id: string;
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
        constants: string[],
        hashrules: Record<string, string>,
        file: Record<string, t_FileMap>;
        axiom: Record<string, Record<string, t_XtyleData>>;
        cluster: Record<string, Record<string, t_XtyleData>>;
        local: Record<string, Record<string, t_XtyleData>>;
        global: Record<string, Record<string, t_XtyleData>>;
        xtyling: Record<string, Record<string, t_XtyleData>>;
        binding: Record<string, Record<string, t_XtyleData>>;
    },
    LibFilesTemp: Record<string, string>,
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


export interface t_CACHE {
    HashRule: {},
    SortedIndexes: [],
    PortableEssentials: [],
    Index2StylesObject: {},
    NativeStyle2Index: {},
    LibraryStyle2Index: {},
    GlobalsStyle2Index: {},
    PortableStyle2Index: {},
    FinalStack: {},
    Archive: t_Archive,
};

// export const STACK = {
//     PROXYCACHE: {},
//     LIBRARIES: {},
//     PORTABLES: {},
// };

export interface t_Proxy {

}

export interface t_RAW {
    CMD: string,
    ARG: string,
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
    PROXYFILES: Record<string, Record<string, t_Proxy>>,
}
