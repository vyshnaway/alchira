/* eslint-disable @typescript-eslint/naming-convention */
import C_Target from "../script/class.js";
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
    scripts: Record<string, string>,
    commands: Record<string, string>,
    defaultTweaks: _config.Tweaks,
    customAtrules: Record<string, string>
    customElements: Record<string, number>,
    customOperations: Record<string, string>
    url: {
        Cdn: string,
        Site: string,
        Worker: string,
        Console: string,
        PrefixCdn: string,
        ArtifactCdn: string,
    }
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
        libraries: string,
        externals: string,
        artifacts: string,
        constants: string,
        hashrules: string,
        errors: string,
        memChart: string,
        footer: string,
    },
    Lookup: {
        libraries: Record<string, _file.Lookup>,
        externals: Record<string, _file.Lookup>,
        artifacts: Record<string, _file.Lookup>,
    },
    Errors: {
        libraries: string[],
        externals: string[],
        artifacts: string[],
        multiples: string[],
    },
    Diagnostics: {
        libraries: _support.Diagnostic[],
        externals: _support.Diagnostic[],
        artifacts: _support.Diagnostic[],
        multiples: _support.Diagnostic[],
    },
    Manifest: {
        prefix: string,
        elements: string[],
        constants: string[],
        hashrules: Record<string, string>,
        filelookup: Record<string, _file.Lookup>,
        AXIOM: Record<string, _file.ClassMetaMap>,
        CLUSTER: Record<string, _file.ClassMetaMap>,
        LOCAL: Record<string, _file.ClassMetaMap>,
        GLOBAL: Record<string, _file.ClassMetaMap>,
        EXTERNAL: Record<string, _file.ClassMetaMap>,
        EXATTACH: Record<string, _file.ClassMetaMap>,
        diagnostics: _support.Diagnostic[]
    },
}

export interface STATIC {
    WATCH: boolean,
    DEBUG: boolean,
    Command: string,
    Argument: string,
    RootCSS: string,
    RootPath: string,
    WorkPath: string,
    ProjectName: string,
    ProjectVersion: string,
    Artifact: _config.Artifact,
    ProxyMap: _config.ProxyMap[],
    Tweaks: _config.Tweaks,
    Prefix: PREFIX,
    HashRule: Record<string, string>,
    External_Saved: Record<string, string>,
    Library_Saved: Record<string, string>,
    Targets_Saved: Record<string, _config.ProxyStorage>,
}

export interface CLASS {
    HashRule: Record<string, string>,
    Index_to_Data: Record<string, _style.Classdata>,
    Global___Index: _style.ClassIndexMap,
    Public___Index: _style.ClassIndexMap,
    Library__Index: _style.ClassIndexMap,
    External_Index: _style.ClassIndexMap,
    Arattach_Index: _style.ClassIndexMap,
    Artifact_Index: _style.ClassIndexMap,
    Sync_ClassDictionary: _style.Dictionary,
    Sync_PublishIndexMap: _style.ClassIndexMap,
};

export interface FILES {
    LIBRARIES: Record<string, _file.Storage>,
    EXTERNALS: Record<string, _file.Storage>,
    TARGETS: Record<string, C_Target>,
}
