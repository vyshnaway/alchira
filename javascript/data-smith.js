import $ from "./Shell/index.js";
import Use from "./Utils/index.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/render.js";
import FORGE from "./Style/forge.js";
import ORDER from "./Worker/order-api.js";
import SCRIPT from "./Script/class.js";
import XTYLES from "./Style/stash.js";
import {
    NAV,
    RAW,
    STACK,
    CACHE,
    PUBLISH,
} from "./data-cache.js";

function ResetCache() {
    Object.assign(CACHE, {
        Hashrules: {},
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
            hashrule: "",
            targets: "",
            errors: "",
            memChart: "",
            footer: ""
        },
        StyleMap: {
            variables: [],
            hashrules: {},
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
export function UpdateXtylesFolder() {
    ResetCache();
    XTYLES.UploadFiles(RAW.LIBRARIES, RAW.PORTABLES);
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
    PUBLISH.MANIFEST.hashrules = HASHRULE.UPLOAD();
}

// On target files edit.
export function ProcessProxies(action = "upload", targetFolder, filePath, fileContent, extension) {
    HASHRULE.UPLOAD()

    switch (action) {
        case "add": case "change":
            if (STACK.PROXYCACHE[targetFolder].extensions.includes(extension)) {
                STACK.PROXYFILES[targetFolder][filePath] = fileContent;
                STACK.PROXYCACHE[targetFolder].SaveFile(filePath, fileContent);
                STACK.PROXYCACHE[targetFolder].UpdateCache();
                PUBLISH.DeltaPath = `${STACK.PROXYCACHE[targetFolder].source}/${filePath}`;
                PUBLISH.DeltaContent = '';
            } else if (STACK.PROXYCACHE[targetFolder].stylesheet === filePath) {
                STACK.PROXYCACHE[targetFolder].stylesheetContent = fileContent;
            } else {
                PUBLISH.DeltaPath = `${STACK.PROXYCACHE[targetFolder].source}/${filePath}`;
                PUBLISH.DeltaContent = fileContent;
            }
            break;
        default:
            Object.entries(STACK.PROXYCACHE).forEach(([key, cache]) => {
                cache.ClearFiles();
                delete STACK.PROXYCACHE[key];
            });
            Object.entries(STACK.PROXYFILES).forEach(([key, files]) => {
                STACK.PROXYCACHE[key] = new SCRIPT(files);
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

    Object.values(STACK.PROXYCACHE).forEach(cache => {
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
    Object.values(STACK.PROXYCACHE).forEach(cache => CUMULATES.classTracks.push(...cache.LoadTracks()));

    if (RAW.WATCH) {
        CACHE.FinalStack = {};
        PUBLISH.FinalMessage = CUMULATES.errors.length ? "Errors in " + CUMULATES.errors.length + " Tags." : "Zero errors.";
    } else {
        let output;
        if ("publish" === RAW.CMD) {
            if (CUMULATES.errors.length) {
                output = await ORDER(CUMULATES.classTracks, RAW.CMD, RAW.ARG);
                PUBLISH.FinalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Falling back to 'preview' command.";
                RAW.CMD = "preview";
            } else {
                output = await ORDER(CUMULATES.classTracks, RAW.CMD, RAW.ARG)
                PUBLISH.FinalMessage = output.message;
                if (output.status) RAW.CMD = "preview";
                else CUMULATES.errors.push(PUBLISH.FinalMessage);
            }
        } else {
            PUBLISH.FinalMessage = CUMULATES.errors.length === 0 ? "Preview verified. Procceed to 'publish' using your key." :
                CUMULATES.errors.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
            output = await ORDER(CUMULATES.classTracks, RAW.CMD, RAW.ARG);
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
        SAVEFILES: RAW.WATCH ? {} : Object.fromEntries(Object.entries(XtylesResult.bundle).map(([fileName, fileContent]) => {
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

    const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(RAW.CSSIndex), "INDEX ||");
    indexScanned.postBinds.forEach(i => POSTBINDS.add(i));
    indexScanned.preBinds.forEach(i => PREBINDS.add(i));
    RENDERFRAGS.INDEX = COMPILE.Stylesheet(indexScanned.styles, !RAW.WATCH);
    PUBLISH.MANIFEST.constants = Use.array.setback(indexScanned.variables);
    PUBLISH.Report.variables = $.MOLD.primary.Section("Root variables", PUBLISH.MANIFEST.constants, $.list.text.Entries);

    RENDERFRAGS.ESSENTIALS = COMPILE.Stylesheet([...CACHE.PortableEssentials, ...CUMULATES.essentials], !RAW.WATCH)

    Object.values(STACK.PROXYCACHE).forEach((cache) => cache.RenderFiles(PREBINDS, POSTBINDS, RAW.CMD))
    RENDERFRAGS.RENDERED = COMPILE.Stylesheet(FORGE.indexMaps(CACHE.FinalStack), !RAW.WATCH)

    RENDERFRAGS.APPENDIX = COMPILE.Stylesheet(Object.values(STACK.PROXYCACHE).reduce((appendix, cache) => {
        const appendixScanned = STYLE.CSSCANNER(
            Use.code.uncomment.Css(cache.stylesheetContent),
            `APPENDIX : ${cache.targetStylesheet} ||`
        );
        appendix.push(...appendixScanned.styles);
        appendixScanned.postBinds.forEach(i => POSTBINDS.add(i));
        appendixScanned.preBinds.forEach(i => PREBINDS.add(i));
        return appendix;
    }, []), !RAW.WATCH);

    const rendered = FORGE.bindIndex(PREBINDS, POSTBINDS);
    RENDERFRAGS.PREBINDS = COMPILE.Stylesheet(rendered.preBindsObject, !RAW.WATCH);
    RENDERFRAGS.POSTBINDS = COMPILE.Stylesheet(rendered.postBindsObject, !RAW.WATCH);

    return { RENDERFRAGS, PREBINDS, POSTBINDS };
}

// On target stylesheet edit.
export async function Generate() {
    const { CUMULATES, SAVEFILES } = await Accumulate();

    if (PUBLISH.DeltaContent.length) {
        SAVEFILES[PUBLISH.DeltaPath] = PUBLISH.DeltaContent
    } else {
        const { RENDERFRAGS, PREBINDS, POSTBINDS } = createStylesheet(CUMULATES)

        const FinalStylesheet = Object.entries(RENDERFRAGS)
            .map(([chapter, content]) => RAW.WATCH ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
        Object.values(STACK.PROXYCACHE).forEach((cache) => cache.SummonFiles(SAVEFILES, FinalStylesheet))

        if (PUBLISH.DeltaPath.length) {
            Object.keys(SAVEFILES).forEach(filePath => { if (PUBLISH.DeltaPath !== filePath) { delete SAVEFILES[filePath] } })
            PUBLISH.SaveDepenFiles = [];
        }

        if (RAW.WATCH) {
            SAVEFILES[NAV.json.manifest] = JSON.stringify(PUBLISH.MANIFEST);
        } else {
            const
                portableMd = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".css",
                portableCss = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".xcss",
                portableXcss = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".md";

            const portable = COMPILE.Portable(PREBINDS, POSTBINDS, CUMULATES.essentials, RAW.PACKAGE, RAW.VERSION);
            SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".css"] = portable.binding;
            SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".xcss"] = portable.portable;
            SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".md"] = RAW.ReadMe;

            if (SAVEFILES[portableMd]) SAVEFILES[portableMd] += RAW.ReadMe
            else SAVEFILES[portableMd] = RAW.ReadMe
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
