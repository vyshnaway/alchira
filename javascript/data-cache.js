import { LISTEDPREFIX } from "./Style/compile.js";
import { DATA } from "./data-meta.js";
import STYLE from "./Style/parse.js"
import Library from "./class-refers.js";

export const ENV = {
    DevMode: true,
}

export const STASH = {
    Shorthands: {},
    SortedIndexes: [],
    LibraryStyle2Index: {},
    GlobalsStyle2Index: {},
    Index2StylesObject: {},
    FinalStack: {},
}

export const PUBLISH = {
    Report: {
        library: '',
        variables: '',
        shorthand: '',
        errorList: '',
        memChart: '',
        footer: ''
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
}

export const RENDERFRAGS = {
    INDEX: "",
    PREBINDS: "",
    RENDERED: "",
    POSTBINDS: "",
    ESSENTIALS: "",
    APPENDIX: "",
}

export const CUMULATES = {
    report: [],
    errors: [],
    styleMap: [],
    essentials: [],
    classGroups: [],
    classTracks: [],
    preBinds: new Set(),
    postBinds: new Set(),
    styleGlobals: {},
};

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
        finalMessage: '',
        Report: {
            library: '',
            variables: '',
            shorthand: '',
            errorList: '',
            memChart: '',
            footer: ''
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
    });

    STYLE.INDEX.RESET();
    Library.ClearStash();
}

export function GenAccumulates() {
    const
        report = [],
        errors = [],
        essentials = [],
        styleMap = [],
        preBinds = new Set(),
        postBinds = new Set(),
        styleGlobals = {},
        classGroups = [],
        classTracks = [];

    Object.values(ProxyTargets).forEach(proxy => {
        proxy.cache.Accumulator();
        const cumulated = proxy.cache.cumulated;

        report.push(...cumulated.report);
        errors.push(...cumulated.errors);
        styleMap.push(...cumulated.styleMap);
        essentials.push(...cumulated.essentials);
        classGroups.push(...cumulated.classGroups);
        classTracks.push(...cumulated.classTracks);
        Object.assign(styleGlobals, cumulated.styleGlobals);
        cumulated.preBinds.forEach(bind => preBinds.add(bind));
        cumulated.postBinds.forEach(bind => postBinds.add(bind));
    });

    Object.assign(CUMULATES, {
        report,
        errors,
        essentials,
        styleMap,
        preBinds,
        postBinds,
        styleGlobals,
        classGroups,
        classTracks
    });

    return CUMULATES;
}