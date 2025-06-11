import $ from "./Shell/index.js";
import Use from "./Utils/index.js";
import shorthandJS from "./Worker/shorthand.js";
import cleaner from "./Worker/cleaner.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/compile.js";
import FORGE from "./forgent.js";
import ORGANIZER from "./Worker/order-api.js";
import { DATA, NAV } from "./data-meta.js";
import Proxy from "./Script/proxy.js";
import Refers from "./Style/stack.js";
import {
    PROXY,
    STASH,
    PUBLISH,
    ResetCache
} from "./data-cache.js";

// On library edit.
export function UpdateLibrary() {
    ResetCache();
    Refers.UploadFiles(DATA.LIBRARY, DATA.PORTABLES);
    const { libraryTable, portableTable, AxiomStyleMap, ClusterStyleMap, DependsStyleMap } = Refers.Renders();

    PUBLISH.MANIFEST.axiom = AxiomStyleMap;
    PUBLISH.MANIFEST.cluster = ClusterStyleMap;
    PUBLISH.MANIFEST.file = { ...libraryTable, ...portableTable };
}

// On shorthands edit.
export function UpdateShorthands() {
    PUBLISH.MANIFEST.shorthands = shorthandJS.UPLOAD(DATA.SHORTHAND);
}

// On target files edit.
export function ProcessProxies(action = "upload", targetFolder, filePath, fileContent, extension) {
    switch (action) {
        case "add": case "change":
            if (PROXY.CACHE[targetFolder].extensions.includes(extension)) {
                PROXY.FILES[targetFolder][filePath] = fileContent;
                PROXY.CACHE[targetFolder].SaveFile(filePath, fileContent);
                PROXY.CACHE[targetFolder].UpdateCache();
                PUBLISH.DeltaPath = `${PROXY.CACHE[targetFolder].source}/${filePath}`;
                PUBLISH.DeltaContent = '';
            } else if (PROXY.CACHE[targetFolder].stylesheet === filePath) {
                PROXY.CACHE[targetFolder].stylesheetContent = fileContent;
            } else {
                PUBLISH.DeltaPath = `${PROXY.CACHE[targetFolder].source}/${filePath}`;
                PUBLISH.DeltaContent = fileContent;
            }
            break;
        default:
            Object.entries(PROXY.CACHE).forEach(([key, cache]) => {
                cache.ClearFiles();
                delete PROXY.CACHE[key];
            });
            Object.entries(PROXY.FILES).forEach(([key, files]) => {
                PROXY.CACHE[key] = new Proxy(files);
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

    Object.values(PROXY.CACHE).forEach(cache => {
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

    STASH.GlobalsStyle2Index = CUMULATES.styleGlobals;
    Object.values(PROXY.CACHE).forEach(cache => CUMULATES.classTracks.push(...cache.LoadTracks()));

    if (DATA.WATCH) {
        STASH.FinalStack = {};
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
                "Errors in " + CUMULATES.errors.length + " Tags. Rectify them to proceed with 'publish' command.";
            output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG);
        }

        STASH.FinalStack = output.result.reduce((A, I) => { A["." + STASH.Index2StylesObject[I].class] = I; return A; }, {});
        STASH.SortedIndexes = output.result;
    }
    PUBLISH.ErrorCount = CUMULATES.errors.length;
    PUBLISH.Report.errors = $.MOLD[PUBLISH.ErrorCount ? "failed" : "success"].Section(CUMULATES.errors.length + " Errors", CUMULATES.errors);
    PUBLISH.Report.targets = $.MOLD.std.Block(CUMULATES.report);

    return CUMULATES;
}

const RENDER = {
    index: () => {
        const scanned = STYLE.CSSCANNER(cleaner.uncomment.Css(DATA.CSSIndex), "INDEX ||");
        PUBLISH.RENDERFRAGS.INDEX
            = COMPILE.Stylesheet(scanned.styles, !DATA.WATCH);
        PUBLISH.MANIFEST.variables = Use.array.setback(scanned.variables);
        PUBLISH.Report.variables = $.MOLD.primary.Section("Root variables", PUBLISH.MANIFEST.variables, $.list.text.Entries);
        return { preBinds: scanned.preBinds, postBinds: scanned.postBinds }
    },
    essentials: (CUMULATES) => {
        PUBLISH.RENDERFRAGS.ESSENTIALS
            = COMPILE.Stylesheet(CUMULATES.essentials, !DATA.WATCH)
        return { preBinds: CUMULATES.preBinds, postBinds: CUMULATES.postBinds }
    },
    rendered: () => {
        const preBinds = new Set(), postBinds = new Set();

        Object.values(PROXY.CACHE).forEach((cache) => cache.RenderFiles(preBinds, postBinds, DATA.CMD))
        PUBLISH.RENDERFRAGS.RENDERED
            = COMPILE.Stylesheet(FORGE.indexMaps(STASH.FinalStack), !DATA.WATCH)
        return { preBinds, postBinds }
    },
    appendix: () => {
        const preBinds = [], postBinds = [];
        PUBLISH.RENDERFRAGS.APPENDIX = COMPILE.Stylesheet(Object.values(PROXY.CACHE).reduce((appendix, cache) => {
            const scanned = STYLE.CSSCANNER(cleaner.uncomment.Css(cache.stylesheetContent), `APPENDIX : ${cache.targetStylesheet} ||`);
            appendix.push(...scanned.styles);
            preBinds.push(...scanned.preBinds);
            postBinds.push(...scanned.postBinds);
            return appendix;
        }, []), !DATA.WATCH);
        return { preBinds, postBinds }
    },
    binds: (preBinds, postBinds) => {
        const rendered = FORGE.bindIndex(
            new Set(preBinds),
            new Set(postBinds),
        );
        PUBLISH.RENDERFRAGS.PREBINDS
            = COMPILE.Stylesheet(rendered.preBindsObject, !DATA.WATCH);
        PUBLISH.RENDERFRAGS.POSTBINDS
            = COMPILE.Stylesheet(rendered.postBindsObject, !DATA.WATCH);
    },
}

// On target stylesheet edit.
export async function GenerateFinal() {
    const Cumulates = await Accumulate(), SaveFiles = {};

    PUBLISH.Report.library = Refers.Report();
    PUBLISH.Report.shorthand = shorthandJS.REPORT();

    if (PUBLISH.DeltaContent.length) {
        SaveFiles[PUBLISH.DeltaPath] = PUBLISH.DeltaContent
    } else {
        const indexBinds = RENDER.index();
        const appendixBinds = RENDER.appendix();
        const renderedBinds = RENDER.rendered();
        const essentialsBinds = RENDER.essentials(Cumulates);

        RENDER.binds([...indexBinds.preBinds, ...essentialsBinds.preBinds, ...appendixBinds.preBinds, ...renderedBinds.preBinds],
            [...indexBinds.postBinds, ...essentialsBinds.postBinds, ...appendixBinds.postBinds, ...renderedBinds.postBinds]);

        const FinalStylesheet = Object.entries(PUBLISH.RENDERFRAGS)
            .map(([chapter, content]) => DATA.WATCH ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
        Object.values(PROXY.CACHE).forEach((cache) => cache.SummonFiles(SaveFiles, FinalStylesheet))

        if (PUBLISH.DeltaPath.length) {
            Object.keys(SaveFiles).forEach(filePath => { if (PUBLISH.DeltaPath !== filePath) { delete SaveFiles[filePath] } })
            PUBLISH.SaveDepenFiles = [];
        }

        if (DATA.WATCH) {
            SaveFiles[NAV.json.manifest] = JSON.stringify(PUBLISH.MANIFEST);
        } else {
            const portable = COMPILE.Portable(DATA.PACKAGE, DATA.VERSION);
            SaveFiles[NAV.folder.submodule + "/" + DATA.PACKAGE + ".css"] = portable.depends;
            SaveFiles[NAV.folder.submodule + "/" + DATA.PACKAGE + ".xcss"] = portable.portable;

            const memChart = {
                Index: Use.string.stringMem(PUBLISH.RENDERFRAGS.INDEX),
                Essentials: Use.string.stringMem(PUBLISH.RENDERFRAGS.ESSENTIALS),
                Prebinds: Use.string.stringMem(PUBLISH.RENDERFRAGS.PREBINDS),
                Rendered: Use.string.stringMem(PUBLISH.RENDERFRAGS.RENDERED),
                Postbinds: Use.string.stringMem(PUBLISH.RENDERFRAGS.POSTBINDS),
                Appendix: Use.string.stringMem(PUBLISH.RENDERFRAGS.APPENDIX),
            }
            PUBLISH.Report.memChart = $.MOLD[PUBLISH.ErrorCount ? "failed" : "success"].Section(
                PUBLISH.FinalMessage, Object.entries(memChart).reduce((ch, [k, v]) => { ch[k] = `${v} Kb`.padStart(9, " "); return ch }, {}), $.list.std.Props)
            PUBLISH.Report.footer = $.MOLD.std.Footer("Output size :  " + `${Use.string.stringMem(FinalStylesheet)} Kb`.padStart(9, " "))
        }
    }

    PUBLISH.DeltaPath = '';
    PUBLISH.DeltaContent = '';
    return {
        SaveFiles: SaveFiles,
        ConsoleReport: $.MOLD.std.Block(Object.values(PUBLISH.Report).filter(string => string !== ''))
    };
}
