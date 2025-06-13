import STYLE from "./Style/parse.js"
import Library from "./Style/stash.js";

export const PUBLISH = {
    DeltaPath: "",
    DeltaContent: "",
    FinalMessage: "",
    ErrorCount: 0,
    WarningCount: 0,
    Report: {
        library: "",
        variables: "",
        shorthand: "",
        targets: "",
        errors: "",
        memChart: "",
        footer: ""
    },
    MANIFEST: {
        variables: [],
        shorthands: {},
        file: {},
        local: {},
        global: {},
        axiom: {},
        cluster: {},
        portable: {},
        binding: {}
    },
    RENDERFRAGS: {
        INDEX: "",
        PREBINDS: "",
        RENDERED: "",
        ESSENTIALS: "",
        APPENDIX: "",
        POSTBINDS: "",
    }
}

export const STASH = {
    Shorthands: {},
    SortedIndexes: [],
    PortableEssentials: [],
    LibraryStyle2Index: {},
    GlobalsStyle2Index: {},
    Index2StylesObject: {},
    PortableStyle2Index: {},
    FinalStack: {},
}

export const PROXY = {
    FILES: {},
    CACHE: {}
}

export function ResetCache() {
    Object.assign(STASH, {
        Shorthands: {},
        SortedIndexes: [],
        LibraryStyle2Index: {},
        GlobalsStyle2Index: {},
        portableStyle2Index: {},
        Index2StylesObject: {},
        FinalStack: {},
    });
    Object.assign(PUBLISH, {
        DeltaPath: "",
        DeltaContent: "",
        FinalMessage: "",
        ErrorCount: false,
        Report: {
            library: "",
            variables: "",
            shorthand: "",
            targets: "",
            errors: "",
            memChart: "",
            footer: ""
        },
        StyleMap: {
            variables: [],
            shorthands: {},
            file: {},
            local: {},
            global: {},
            axiom: {},
            cluster: {}
        },
        RENDERFRAGS: {
            INDEX: "",
            PREBINDS: "",
            RENDERED: "",
            ESSENTIALS: "",
            APPENDIX: "",
            POSTBINDS: "",
        }
    });

    STYLE.INDEX.RESET();
    Library.ClearStash();
}
