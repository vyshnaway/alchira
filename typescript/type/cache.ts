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
    vendors: string[],
    extension: string,
    scripts: Record<string, string>,
    commands: Record<string, string>,
    Tweaks: _config.Tweaks,
    customAtrules: Record<string, string>
    customElements: Record<string, number>,
    customOperations: Record<string, string>
    url: {
        Cdn: string,
        Site: string,
        Worker: string,
        Console: string,
        Prefixes: string,
        Artifacts: string,
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
        artifacts: string,
        libraries: string,
        archives: string,
        constants: string,
        hashrule: string,
        errors: string,
        memChart: string,
        footer: string,
    },
    Lookup: {
        artifacts: Record<string, _file.Lookup>,
        libraries: Record<string, _file.Lookup>,
        archives: Record<string, _file.Lookup>,
    },
    Errors: {
        artifacts: string[],
        libraries: string[],
        archives: string[],
        multiples: string[],
    },
    Diagnostics: {
        multiples: _support.Diagnostic[],
        artifacts: _support.Diagnostic[],
        libraries: _support.Diagnostic[],
        archives: _support.Diagnostic[],
    },
    Manifest: {
        constants: string[],
        hashrules: Record<string, string>,
        filelookup: Record<string, _file.Lookup>,
        AXIOM: Record<string, _file.ClassMetaMap>,
        CLUSTER: Record<string, _file.ClassMetaMap>,
        LOCAL: Record<string, _file.ClassMetaMap>,
        GLOBAL: Record<string, _file.ClassMetaMap>,
        ARTIFACT: Record<string, _file.ClassMetaMap>,
        errors: _support.Diagnostic[]
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
    Archive: _config.Archive,
    ProxyMap: _config.ProxyMap[],
    Tweaks: _config.Tweaks,
    Prefix: PREFIX,
    Hashrule: Record<string, string>,
    Artifacts_Saved: Record<string, string>,
    Libraries_Saved: Record<string, string>,
    Targetdir_Saved: Record<string, _config.ProxyStorage>,
}

export interface CLASS {
    Hashrule: Record<string, string>,
    Index_to_Data: Record<string, _style.Classdata>,
    Global___Index: _style.ClassIndexMap,
    Public___Index: _style.ClassIndexMap,
    Library__Index: _style.ClassIndexMap,
    Artifact_Index: _style.ClassIndexMap,
    Sync_ClassDictionary: _style.Dictionary,
    Sync_PublishIndexMap: _style.ClassIndexTrace,
};

export interface FILES {
    LIBRARIES: Record<string, _file.Storage>,
    ARTIFACTS: Record<string, _file.Storage>,
    TARGETDIR: Record<string, C_Target>,
}
