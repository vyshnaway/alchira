import { LISTEDPREFIX } from "./Style/compile.js";
import { DATA } from "./data-meta.js";
import STYLE from "./Style/parse.js"
import Library from "./class-refers.js";


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
        library: {}
    },
    RENDERFRAGS: {
        INDEX: "",
        PREBINDS: "",
        RENDERED: "",
        POSTBINDS: "",
        ESSENTIALS: "",
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

export const ProxyTargets = {};

export function Initialize() {
    LISTEDPREFIX.atRule = DATA.PREFIX.atrules;
    LISTEDPREFIX.property = DATA.PREFIX.properties;
    LISTEDPREFIX.selector = { ...DATA.PREFIX.classes, ...DATA.PREFIX.elements }
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
            library: {}
        },
        RENDERFRAGS: {
            INDEX: "",
            PREBINDS: "",
            RENDERED: "",
            POSTBINDS: "",
            ESSENTIALS: "",
            APPENDIX: "",
        }
    });

    STYLE.INDEX.RESET();
    Library.ClearStash();
}
