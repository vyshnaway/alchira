import { LISTEDPREFIX } from "./Style/compile.js";
import { DATA } from "./data-meta.js";
import Use from "./Utils/index.js";
import Library from "./class-refers.js";

export const ENV = {
    styleTag: "xtyle",
    devMode: true,
    unSpaced: true,
}

export const STASH = {
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
}

export const PUBLISH = {
    SwitchMap: {},
    FinalFiles: {},
    ConsoleErrors: [],
    Report: {
        library: '',
        variables: '',
        shorthand: '',
        errorList: '',
        finalMessage: ''
    },
    StyleMap: {
        variables: {},
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
    ESSENTIALS: "",
    PREBINDS: "",
    RENDERED: "",
    POSTBINDS: "",
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

export const STYLEIN = {
    NOW: 0,
    BIN: [],
    DECLARE: () => {
        const number = STYLEIN.BIN.length ? STYLEIN.BIN.pop() : ++STYLEIN.NOW;
        return { number, class: "_" + Use.string.enCounter(number + 768) };
    }, 
    DISPOSE: (...indexes) => {
        indexes.forEach(index => {
            STYLEIN.BIN.push(index);
            delete STASH.Index2StylesObject[index];
        })
    },
    RESET: () => {
        STYLEIN.NOW = 0;
        Object.keys(STASH.Index2StylesObject).forEach(key => delete STASH.Index2StylesObject(key))
    }
}

export function Initialize() {
    ENV.devMode = DATA.CMD === "dev";
    ENV.unSpaced = DATA.CMD !== "build";

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
        SwitchMap: {},
        FinalFiles: {},
        ConsoleErrors: [],
        Report: {
            library: '',
            variables: '',
            shorthand: '',
            errorList: '',
            finalMessage: ''
        },
        StyleMap: {
            variables: {},
            shorthands: {},
            file: {},
            local: {},
            global: {},
            axiom: {},
            library: {}
        },
    });

    STYLEIN.RESET();
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
}