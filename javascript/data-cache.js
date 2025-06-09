import STYLE from "./Style/parse.js"
import Library from "./Style/library.js";

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
        POSTBINDS: "",
        APPENDIX: "",
    }
}

export const STASH = {
    Shorthands: {},
    SortedIndexes: [],
    LibraryStyle2Index: {},
    GlobalsStyle2Index: {},
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
        Index2StylesObject: {},
        FinalPreBinds: new Set(),
        FinalPostBinds: new Set(),
        Midway: {
            Essentials: [],
            Finals: {},
            Renders: {},
        }
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
            POSTBINDS: "",
            APPENDIX: "",
        }
    });

    STYLE.INDEX.RESET();
    Library.ClearStash();
}
