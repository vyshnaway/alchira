import STYLE from "./Style/parse.js"
import Library from "./Style/stack.js";

export const PUBLISH = {
    DeltaPath: "",
    DeltaContent: "",
    FinalMessage: "",
    ErrorCount: false,
    Report: {
        library: "",
        targets: "",
        variables: "",
        shorthand: "",
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
}

export const STASH = {
    Shorthands: {},
    SortedIndexes: [],
    LibraryStyle2Index: {},
    GlobalsStyle2Index: {},
    portableStyle2Index: {},
    Index2StylesObject: {},
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
            targets: "",
            variables: "",
            shorthand: "",
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
