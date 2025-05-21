import $ from "./Shell/index.js"
import Utils from "./Utils/index.js";
import shorthandJS from "./Worker/shorthand.js";
import cleaner from "./Worker/cleaner.js";
import STYLE from "./Style/parse.js";
import SCRIPT from "./Script/file.js";
import COMPILE from "./Style/compile.js";
import FORGE from "./forger.js";
import ORGANIZER from "./Worker/order.js";
import { DATA, NAV } from "./metadata.js";
import Proxy from "./class-proxy.js";
import Library from "./class-library.js";

export const ENV = {
    styleTag: "xtyle",
    styleCount: 0,
    devMode: true,
    unSpaced: true,
    apiUrl: "https://workers.xpktr.com/api/xcss-build-request"
}
export const LISTEDPREFIX = {
    atRule: {},
    selector: {},
    property: {},
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

export const ProxyTargets = [];
export const UnresIndexes = [];

export function MakeStyle() {
    const number = UnresIndexes.length ? ENV.unresIndexes.pop() : ++ENV.styleCount;
    return { number, class: "_" + Utils.string.enCounter(number + 768) }
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

    ProxyTargets.forEach(proxy => {
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

    ENV.styleCount = 0;
    ProxyTargets.length = 0;
    UnresIndexes.length = 0;

    Library.ClearStash();
}

// On library edit.
export function UpdateLibrary() {
    ResetCache();

    Library.UploadFiles(DATA.LIBRARY);
    const { consoleReport, referTable, AxiomStyleMap, LibraryStyleMap } = Library.Renders();
    Object.assign(PUBLISH.StyleMap.axiom, AxiomStyleMap);
    Object.assign(PUBLISH.StyleMap.library, LibraryStyleMap);
    Object.assign(PUBLISH.StyleMap.file, referTable);
    PUBLISH.Report.library = $.MOLD.std.Block(consoleReport);
}
// On shorthands edit.
export function UpdateShorthands() {
    const shorthandResponse = shorthandJS.UPLOAD(DATA.SHORTHAND)
    PUBLISH.StyleMap.shorthands = shorthandResponse.list;
    PUBLISH.Report.shorthand = shorthandResponse.report;
}
// On target files edit.
export async function ProcessProxies() {
    ProxyTargets.forEach(proxy => { proxy.cache = new Proxy(proxy); });
    GenAccumulates();

    let finalMessage;
    if ("dev" === DATA.CMD) {
        finalMessage = CUMULATES.errors.length ? "Errors in " + CUMULATES.errors.length + " Tags." : "Zero errors.";
    } else {
        let output;
        if ("build" === DATA.CMD) {
            if (CUMULATES.errors.length) {
                DATA.CMD = "preview";
                output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG);
                finalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Fallback build using 'preview' command.";
            } else {
                output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG)
                if (!output.status) CUMULATES.errors.push(finalMessage)
                finalMessage = output.message;
            }
        } else {
            if (CUMULATES.errors.length) {
                finalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Rectify them to proceed with 'build' command.";
            } else {
                finalMessage = "Preview verified. Procceed to 'build' using a key.";
            }
            output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG);
        }

        if (output.status) {
            output.result.forEach(I => {
                STASH.Index2StylesObject[I].preBinds.forEach(E => lists.FinalPostBinds.add(E))
                STASH.Index2StylesObject[I].postBinds.forEach(E => lists.FinalPreBinds.add(E))
                STASH.Midway.Finals["." + STASH.Index2StylesObject[I].class] = I;
            });
        } else DATA.CMD = "preview";
    }

    PUBLISH.Report.errorList = $.MOLD.failed.Section(CUMULATES.errors.length + " Errors", CUMULATES.errors);
    PUBLISH.ConsoleErrors.push($.MOLD.failed.Section(CUMULATES.errors.length + " Errors", CUMULATES.errors))

    return finalMessage;
}

const RENDER = {
    axiom: () => {
        const CSSIndexScanned = (STYLE.XCANNER(cleaner.uncomment.Css(DATA.CSSIndex), "xtyles", "AXIOM"));
        RENDERFRAGS.INDEX = COMPILE(CSSIndexScanned.styles);
        PUBLISH.StyleMap.variables = Utils.array.setback(CSSIndexScanned.variables);
        REPORT.variables = $.MOLD.primary.Section("Root variables", PUBLISH.StyleMap.variables, $.list.secondary.Entries);
    },
    binds: () => {
        ProxyTargets.forEach(proxy => {

        }, []);
        const { preBinds, postBinds } = FORGE.bindIndex(STASH.FinalPreBinds, STASH.FinalPostBinds);
        RENDERFRAGS.PREBINDS = COMPILE(preBinds);
        RENDERFRAGS.POSTBINDS = COMPILE(postBinds);
    },
    appendix: () => {
        const CSSAppendixScanned = (STYLE.XCANNER(cleaner.uncomment.Css(CSSAppendix), `${TARGET}/${CSSPath}`, "APPENDIX"));
        CSSAppendixScanned.preBinds.forEach(E => lists.FinalPreBinds.add(E));
        CSSAppendixScanned.postBinds.forEach(E => lists.FinalPostBinds.add(E));
        RENDERFRAGS.APPENDIX = COMPILE(ProxyTargets.reduce((accum, proxy) => {
            scanned.preBinds.forEach(bind => STASH.FinalPreBinds.add(bind));
            scanned.postBinds.forEach(bind => STASH.FinalPostBinds.add(bind));
            const scanned = STYLE.XCANNER(cleaner.uncomment.Css(proxy.stylesheetContent), proxy.cache.targetStylesheet, "APPENDIX");
            accum.push(...scanned.styles);
            return accum;
        }, []));
    },
    essentials: () => {
        RENDERFRAGS.ESSENTIALS = COMPILE(CUMULATES.essentials);
    }
}

// On target stylesheet edit.
export async function GenerateFinal() {

    // Render stylesheet
    RENDERFRAGS.RENDERED = COMPILE(MIDWAY.FINALS);


    // Finalize
    const FinalStylesheet = Object.values(RENDERFRAGS).join(ENV.devMode ? "\n" : "");
    ProxyTargets.forEach(proxy => { FILESOUT[proxy.cache.sourceStylesheet] = FinalStylesheet; });

    if (CMD === "dev") {
        FILESOUT[NAV.json.styleMap] = JSON.stringify(PUBLISH.StyleMap);
        FILESOUT[NAV.json.switchMap] = JSON.stringify(PUBLISH.SwitchMap);
    } else {
        const memChart = {
            Index: Utils.string.stringMem(RENDERFRAGS.INDEX),
            Essentials: Utils.string.stringMem(RENDERFRAGS.ESSENTIALS),
            Prebinds: Utils.string.stringMem(RENDERFRAGS.PREBINDS),
            Rendered: Utils.string.stringMem(RENDERFRAGS.RENDERED),
            Postbinds: Utils.string.stringMem(RENDERFRAGS.POSTBINDS),
            Appendix: Utils.string.stringMem(RENDERFRAGS.APPENDIX),
        }
        STASH.ConsoleReport.push($.MOLD[ACUM.errors.length ? "failed" : "success"].Section(finalMessage, memChart, $.list.std.Props))
        STASH.ConsoleReport.push($.MOLD.std.Footer('Output size : ' + Object.values(memChart).reduce((M, I) => I + M, 0)))
    }

    return {
        files: FILESOUT,
        errors: $.MOLD.std.Block(PUBLISH.ConsoleErrors),
        report: $.MOLD.std.Block(STASH.ConsoleReport)
    };
}
