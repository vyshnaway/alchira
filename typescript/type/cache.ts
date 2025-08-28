/* eslint-disable @typescript-eslint/naming-convention */
import TARGET from "../script/class.js";
import * as _support from "./support.js";
import * as _style from "./style.js";
import * as _config from "./config.js";
import * as _file from "./file.js";

export interface ROOT {
    bin: string,
    name: string,
    version: string,
    website: string,
    vendors: string[],
    commandList: Record<string, string>,
    exposedCommands: string[]
    defaultTweaks: _config.Tweaks,
    customElements: Record<string, string>,
    customOperations: Record<string, string>
    customAtrules: Record<string, string>
    URL: Record<string, string>,
}

export interface PREFIX {
    atrules: Record<string, Record<string, string>>,
    attributes: Record<string, Record<string, string>>,
    pseudos: Record<string, Record<string, string>>,
    classes: Record<string, Record<string, string>>,
    elements: Record<string, Record<string, string>>,
    values: Record<string, Record<string, Record<string, string>>>,
}

export interface DELTA {
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
        library: Record<string, _file.Lookup>,
        package: Record<string, _file.Lookup>,
        project: Record<string, _file.Lookup>,
    },
    Errors: {
        library: string[],
        package: string[],
        project: string[],
    },
    Diagnostics: {
        library: _support.Diagnostic[],
        package: _support.Diagnostic[],
        project: _support.Diagnostic[],
    },
    Manifest: {
        prefix: string,
        elements: string[],
        constants: string[],
        hashrules: Record<string, string>,
        file: Record<string, _file.Lookup>,
        AXIOM: Record<string, _file.ClassMetaMap>,
        CLUSTER: Record<string, _file.ClassMetaMap>,
        LOCAL: Record<string, _file.ClassMetaMap>,
        GLOBAL: Record<string, _file.ClassMetaMap>,
        PACKAGE: Record<string, _file.ClassMetaMap>,
        PACBIND: Record<string, _file.ClassMetaMap>,
        errors: _support.Diagnostic[]
    },
}

export interface STATIC {
    WATCH: boolean,
    DEBUG: boolean,
    Command: string,
    Argument: string,
    Project_Name: string,
    Project_Version: string,
    RootCSS: string,
    RootPath: string,
    WorkPath: string,
    Archive: _config.Archive,
    ProxyMap: _config.ProxyMap[],
    Tweaks: _config.Tweaks,
    Prefix: PREFIX,
    HashRule: Record<string, string>,
    Package_Saved: Record<string, string>,
    Library_Saved: Record<string, string>,
    Targets_Saved: Record<string, _config.ProxyStorage>,
}

export interface CLASS {
    HashRule: Record<string, string>,
    Index_ClassData: Record<string, _style.Classdata>,
    GlobalClass__Index: _style.ClassIndexMap,
    PublicClass__Index: _style.ClassIndexMap,
    ArchiveClass_Index: _style.ClassIndexMap,
    ArcbindClass_Index: _style.ClassIndexMap,
    LibraryClass_Index: _style.ClassIndexMap,
    PackageClass_Index: _style.ClassIndexMap,
    Sync_PublishIndexMap: _style.ClassIndexMap,
    Sync_ClassDictionary: _style.Dictionary,
};

export interface FILES {
    LIBRARIES: Record<string, _file.Storage>,
    PACKAGES: Record<string, _file.Storage>,
    TARGET: Record<string, TARGET>,
}
