import $ from "./Shell/index.js";
import Use from "./Utils/index.js";
import shorthandJS from "./Worker/shorthand.js";
import cleaner from "./Worker/cleaner.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/compile.js";
import FORGE from "./data-forge.js";
import ORGANIZER from "./Worker/order-api.js";
import Proxy from "./Script/class.js";
import XTYLES from "./Style/stash.js";
import {
    NAV,
    DATA,
    PROXY,
    CACHE,
    PUBLISH
} from "./data-cache.js";

function ResetCache() {
    Object.assign(CACHE, {
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
        }
    });

    STYLE.INDEX.RESET();
    XTYLES.ClearStash();
}



// On library edit.
export function UpdateLibrary() {
    ResetCache();
    XTYLES.UploadFiles(DATA.LIBRARY, DATA.PORTABLES);
    const {
        libraryTable,
        modulesTable,
        ModuleEssentials,
        AxiomStyleMap,
        ClusterStyleMap,
        PortableStyleMap,
        BindingStyleMap
    } = XTYLES.Renders();

    PUBLISH.MANIFEST.axiom = AxiomStyleMap;
    PUBLISH.MANIFEST.cluster = ClusterStyleMap;
    PUBLISH.MANIFEST.portable = PortableStyleMap;
    PUBLISH.MANIFEST.binding = BindingStyleMap;

    CACHE.PortableEssentials = ModuleEssentials;
    PUBLISH.MANIFEST.file = { ...libraryTable, ...modulesTable };
}

// On shorthands edit.
export function UpdateShorthands() {
    PUBLISH.MANIFEST.shorthands = shorthandJS.UPLOAD(DATA.SHORTHAND);
}

// On target files edit.
export function ProcessProxies(action = "upload", targetFolder, filePath, fileContent, extension) {
    switch (action) {
        case "add": case "change":
            if (PROXY.CLASS[targetFolder].extensions.includes(extension)) {
                PROXY.FILES[targetFolder][filePath] = fileContent;
                PROXY.CLASS[targetFolder].SaveFile(filePath, fileContent);
                PROXY.CLASS[targetFolder].UpdateCache();
                PUBLISH.DeltaPath = `${PROXY.CLASS[targetFolder].source}/${filePath}`;
                PUBLISH.DeltaContent = '';
            } else if (PROXY.CLASS[targetFolder].stylesheet === filePath) {
                PROXY.CLASS[targetFolder].stylesheetContent = fileContent;
            } else {
                PUBLISH.DeltaPath = `${PROXY.CLASS[targetFolder].source}/${filePath}`;
                PUBLISH.DeltaContent = fileContent;
            }
            break;
        default:
            Object.entries(PROXY.CLASS).forEach(([key, cache]) => {
                cache.ClearFiles();
                delete PROXY.CLASS[key];
            });
            Object.entries(PROXY.FILES).forEach(([key, files]) => {
                PROXY.CLASS[key] = new Proxy(files);
            });
    }
}

async function Accumulate() {
    const CUMULATES = {
        report: [],
        errors: [],
        styleMap: [],
        essentials: [],
        classGroups: [],
        classTracks: [],
        styleGlobals: {},
        preBinds: new Set(),
        postBinds: new Set(),
    }

    Object.values(PROXY.CLASS).forEach(cache => {
        const cumulated = cache.Accumulator();

        CUMULATES.report.push(...cumulated.report);
        CUMULATES.errors.push(...cumulated.errors);
        CUMULATES.styleMap.push(...cumulated.styleMap);
        CUMULATES.essentials.push(...cumulated.essentials);
        CUMULATES.classGroups.push(...cumulated.classGroups);
        Object.assign(CUMULATES.styleGlobals, cumulated.styleGlobals);
        cumulated.preBinds.forEach(bind => CUMULATES.preBinds.add(bind));
        cumulated.postBinds.forEach(bind => CUMULATES.postBinds.add(bind));
    });
    CUMULATES.styleMap.forEach(map => {
        PUBLISH.MANIFEST.file[map.file.id] = map.file;
        PUBLISH.MANIFEST.local[map.file.id] = map.local;
        PUBLISH.MANIFEST.global[map.file.id] = map.global;
    })

    CACHE.GlobalsStyle2Index = CUMULATES.styleGlobals;
    Object.values(PROXY.CLASS).forEach(cache => CUMULATES.classTracks.push(...cache.LoadTracks()));

    if (DATA.WATCH) {
        CACHE.FinalStack = {};
        PUBLISH.FinalMessage = CUMULATES.errors.length ? "Errors in " + CUMULATES.errors.length + " Tags." : "Zero errors.";
    } else {
        let output;
        if ("publish" === DATA.CMD) {
            if (CUMULATES.errors.length) {
                output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG);
                PUBLISH.FinalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Falling back to 'preview' command.";
                DATA.CMD = "preview";
            } else {
                output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG)
                PUBLISH.FinalMessage = output.message;
                if (output.status) DATA.CMD = "preview";
                else CUMULATES.errors.push(PUBLISH.FinalMessage);
            }
        } else {
            PUBLISH.FinalMessage = CUMULATES.errors.length === 0 ? "Preview verified. Procceed to 'publish' using your key." :
                CUMULATES.errors.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
            output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG);
        }

        CACHE.FinalStack = output.result.reduce((A, I) => { A["." + CACHE.Index2StylesObject[I].class] = I; return A; }, {});
        CACHE.SortedIndexes = output.result;
    }


    PUBLISH.ErrorCount = CUMULATES.errors.length;
    PUBLISH.Report.targets = $.MOLD.std.Block(CUMULATES.report);

    const XtylesResult = XTYLES.Report();
    PUBLISH.Report.library = XtylesResult.report;
    PUBLISH.WarningCount = XtylesResult.warnings.length;

    PUBLISH.Report.errors = $.MOLD[PUBLISH.ErrorCount ? "failed" : "success"]
        .Section(`${PUBLISH.ErrorCount} Errors & ${PUBLISH.WarningCount} Warnings`, [...XtylesResult.warnings, ...CUMULATES.errors,]);

    return {
        CUMULATES,
        SAVEFILES: DATA.WATCH ? {} : Object.fromEntries(Object.entries(XtylesResult.bundle).map(([fileName, fileContent]) => {
            return [NAV.folder.portableNative + "/" + fileName, fileContent]
        }))
    };
}

function createStylesheet(CUMULATES) {
    const PREBINDS = new Set(CUMULATES.preBinds);
    const POSTBINDS = new Set(CUMULATES.postBinds);
    const RENDERFRAGS = {
        INDEX: "",
        PREBINDS: "",
        RENDERED: "",
        ESSENTIALS: "",
        APPENDIX: "",
        POSTBINDS: "",
    }

    const indexScanned = STYLE.CSSCANNER(cleaner.uncomment.Css(DATA.CSSIndex), "INDEX ||");
    indexScanned.postBinds.forEach(i => POSTBINDS.add(i));
    indexScanned.preBinds.forEach(i => PREBINDS.add(i));
    RENDERFRAGS.INDEX = COMPILE.Stylesheet(indexScanned.styles, !DATA.WATCH);
    PUBLISH.MANIFEST.constants = Use.array.setback(indexScanned.variables);
    PUBLISH.Report.variables = $.MOLD.primary.Section("Root variables", PUBLISH.MANIFEST.constants, $.list.text.Entries);

    RENDERFRAGS.ESSENTIALS = COMPILE.Stylesheet([...CACHE.PortableEssentials, ...CUMULATES.essentials], !DATA.WATCH)

    Object.values(PROXY.CLASS).forEach((cache) => cache.RenderFiles(PREBINDS, POSTBINDS, DATA.CMD))
    RENDERFRAGS.RENDERED = COMPILE.Stylesheet(FORGE.indexMaps(CACHE.FinalStack), !DATA.WATCH)

    RENDERFRAGS.APPENDIX = COMPILE.Stylesheet(Object.values(PROXY.CLASS).reduce((appendix, cache) => {
        const appendixScanned = STYLE.CSSCANNER(
            cleaner.uncomment.Css(cache.stylesheetContent),
            `APPENDIX : ${cache.targetStylesheet} ||`
        );
        appendix.push(...appendixScanned.styles);
        appendixScanned.postBinds.forEach(i => POSTBINDS.add(i));
        appendixScanned.preBinds.forEach(i => PREBINDS.add(i));
        return appendix;
    }, []), !DATA.WATCH);

    const rendered = FORGE.bindIndex(PREBINDS, POSTBINDS);
    RENDERFRAGS.PREBINDS = COMPILE.Stylesheet(rendered.preBindsObject, !DATA.WATCH);
    RENDERFRAGS.POSTBINDS = COMPILE.Stylesheet(rendered.postBindsObject, !DATA.WATCH);

    return { RENDERFRAGS, PREBINDS, POSTBINDS };
}

// On target stylesheet edit.
export async function Generate() {
    const { CUMULATES, SAVEFILES } = await Accumulate();
    PUBLISH.Report.shorthand = shorthandJS.REPORT();

    if (PUBLISH.DeltaContent.length) {
        SAVEFILES[PUBLISH.DeltaPath] = PUBLISH.DeltaContent
    } else {
        const { RENDERFRAGS, PREBINDS, POSTBINDS } = createStylesheet(CUMULATES)

        const FinalStylesheet = Object.entries(RENDERFRAGS)
            .map(([chapter, content]) => DATA.WATCH ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
        Object.values(PROXY.CLASS).forEach((cache) => cache.SummonFiles(SAVEFILES, FinalStylesheet))

        if (PUBLISH.DeltaPath.length) {
            Object.keys(SAVEFILES).forEach(filePath => { if (PUBLISH.DeltaPath !== filePath) { delete SAVEFILES[filePath] } })
            PUBLISH.SaveDepenFiles = [];
        }

        if (DATA.WATCH) {
            SAVEFILES[NAV.json.manifest] = JSON.stringify(PUBLISH.MANIFEST);
        } else {
            const
                portableMd = NAV.folder.portableBundle + "/" + DATA.PACKAGE + ".css",
                portableCss = NAV.folder.portableBundle + "/" + DATA.PACKAGE + ".xcss",
                portableXcss = NAV.folder.portableBundle + "/" + DATA.PACKAGE + ".md";

            const portable = COMPILE.Portable(PREBINDS, POSTBINDS, CUMULATES.essentials, DATA.PACKAGE, DATA.VERSION);
            SAVEFILES[NAV.folder.portableNative + "/" + DATA.PACKAGE + ".css"] = portable.binding;
            SAVEFILES[NAV.folder.portableNative + "/" + DATA.PACKAGE + ".xcss"] = portable.portable;
            SAVEFILES[NAV.folder.portableNative + "/" + DATA.PACKAGE + ".md"] = DATA.ReadMe;

            if (SAVEFILES[portableMd]) SAVEFILES[portableMd] += DATA.ReadMe
            else SAVEFILES[portableMd] = DATA.ReadMe
            if (SAVEFILES[portableCss]) SAVEFILES[portableCss] += portable.binding
            else SAVEFILES[portableCss] = portable.binding
            if (SAVEFILES[portableXcss]) SAVEFILES[portableXcss] += portable.portable
            else SAVEFILES[portableXcss] = portable.portable

            const memChart = {
                Index: Use.string.stringMem(RENDERFRAGS.INDEX),
                Essentials: Use.string.stringMem(RENDERFRAGS.ESSENTIALS),
                Prebinds: Use.string.stringMem(RENDERFRAGS.PREBINDS),
                Rendered: Use.string.stringMem(RENDERFRAGS.RENDERED),
                Postbinds: Use.string.stringMem(RENDERFRAGS.POSTBINDS),
                Appendix: Use.string.stringMem(RENDERFRAGS.APPENDIX),
            }
            PUBLISH.Report.memChart = $.MOLD[PUBLISH.ErrorCount ? "failed" : "success"].Section(
                PUBLISH.FinalMessage, Object.entries(memChart).reduce((ch, [k, v]) => { ch[k] = `${v} Kb`.padStart(9, " "); return ch }, {}), $.list.std.Props)
            PUBLISH.Report.footer = $.MOLD.std.Footer("Output size :  " + `${Use.string.stringMem(FinalStylesheet)} Kb`.padStart(9, " "))
        }
    }

    PUBLISH.DeltaPath = '';
    PUBLISH.DeltaContent = '';

    return {
        SaveFiles: SAVEFILES,
        ConsoleReport: $.MOLD.std.Block(Object.values(PUBLISH.Report).filter(string => string !== ''))
    };
}
