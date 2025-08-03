export interface T_PackageEssential {
    name: string;
    version: string;
    website: string;
    scripts: Record<string, string>;
    bins: string[];
};

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

export type t_Data_TWEAKS = Record<string, boolean | string>;

export interface t_Data_APP {
    name: string,
    version: string,
    website: string,
    bins: string[],
    vendors: string[],
    url: Record<string, string>,
    commandList: Record<string, string>,
    defaultTweaks: t_Data_TWEAKS,
    customTag: Record<string, string>,
}

export type t_Data_AUTOGEN = Record<string, {
    path: string;
    default: string;
}>;

export type t_Data_ROOT = Record<string,
    Record<string, {
        title: string,
        url: string,
        path: string,
        content: string,
    }>
>;

export interface t_Data_PREFIX {
    atrules: Record<string, Record<string, string>>
    attributes: Record<string, Record<string, string>>
    pseudos: Record<string, Record<string, string>>
    values: Record<string, Record<string, Record<string, string>>>
};

export type t_Data_NAV = Record<string, Record<string, string>>;

export interface t_Data_Filing {
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
    usedIndexes: Set<string>,
    essentials: string[],
    styleGlobals: Record<string, object>,
    styleLocals: Record<string, object>,
    styleMap: Record<string, t_Xtyle>,
    classGroups: string[][],
    postBinds: string[],
    preBinds: number[],
    errors: string[],
    hasStyleTag: boolean,
    hasSnippetTag: boolean,
    hasStylesheetTag: boolean,
}

export interface t_Xtyle {
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