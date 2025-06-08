import $ from "./Shell/index.js";
import Use from "./Utils/index.js";
import shorthandJS from "./Worker/shorthand.js";
import cleaner from "./Worker/cleaner.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/compile.js";
import FORGE from "./forgent.js";
import ORGANIZER from "./Worker/order-api.js";
import { DATA, NAV } from "./data-meta.js";
import Proxy from "./class-proxy.js";
import Refers from "./class-refers.js";
import {
    PROXY,
    STASH,
    PUBLISH,
    ResetCache
} from "./data-cache.js";

// On library edit.
export function UpdateLibrary() {
    ResetCache();
    Refers.UploadFiles(DATA.LIBRARY);
    const { referTable, AxiomStyleMap, LibraryStyleMap } = Refers.Renders();

    PUBLISH.StyleMap.axiom = AxiomStyleMap;
    PUBLISH.StyleMap.library = LibraryStyleMap;
    PUBLISH.StyleMap.file = referTable;
}

// On shorthands edit.
export function UpdateShorthands() {
    PUBLISH.StyleMap.shorthands = shorthandJS.UPLOAD(DATA.SHORTHAND);
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
        CUMULATES.classTracks.push(...cumulated.classTracks);
        Object.assign(CUMULATES.styleGlobals, cumulated.styleGlobals);
        cumulated.preBinds.forEach(bind => CUMULATES.preBinds.add(bind));
        cumulated.postBinds.forEach(bind => CUMULATES.postBinds.add(bind));
    });

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
        const scanned = STYLE.CSSCANNER(cleaner.uncomment.Css(DATA.CSSIndex), "xtyles", "AXIOM");
        PUBLISH.RENDERFRAGS.INDEX
        // = COMPILE(scanned.styles, !DATA.WATCH);
        PUBLISH.StyleMap.variables = Use.array.setback(scanned.variables);
        PUBLISH.Report.variables = $.MOLD.primary.Section("Root variables", PUBLISH.StyleMap.variables, $.list.text.Entries);
        return { preBinds: scanned.preBinds, postBinds: scanned.postBinds }
    },
    essentials: (CUMULATES) => {
        PUBLISH.RENDERFRAGS.ESSENTIALS
        // = COMPILE(CUMULATES.essentials, !DATA.WATCH)
        return { preBinds: CUMULATES.preBinds, postBinds: CUMULATES.postBinds }
    },
    rendered: () => {
        const preBinds = new Set(), postBinds = new Set();

        Object.values(PROXY.CACHE).forEach((cache) => cache.RenderFiles(preBinds, postBinds, DATA.CMD))
        PUBLISH.RENDERFRAGS.RENDERED
        // = COMPILE(FORGE.indexMaps(STASH.FinalStack), !DATA.WATCH)
        return { preBinds, postBinds }
    },
    appendix: () => {
        const preBinds = [], postBinds = [];
        PUBLISH.RENDERFRAGS.APPENDIX = COMPILE(Object.values(PROXY.CACHE).reduce((appendix, cache) => {
            const scanned = STYLE.CSSCANNER(cleaner.uncomment.Css(cache.stylesheetContent), cache.targetStylesheet);
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
        // = COMPILE(rendered.preBinds, !DATA.WATCH);
        PUBLISH.RENDERFRAGS.POSTBINDS
        // = COMPILE(rendered.postBinds, !DATA.WATCH);
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
            .map(([chapter, content]) => DATA.WATCH ? `/* CHAPTER: ${chapter} */\n${content}\n\n\n` : content).join("");
        Object.values(PROXY.CACHE).forEach((cache) => cache.SummonFiles(SaveFiles, FinalStylesheet))

        if (PUBLISH.DeltaPath.length) {
            Object.keys(SaveFiles).forEach(filePath => { if (PUBLISH.DeltaPath !== filePath) { delete SaveFiles[filePath] } })
            PUBLISH.SaveDepenFiles = [];
        }

        if (DATA.WATCH) {
            SaveFiles[NAV.json.styleMap] = JSON.stringify(PUBLISH.StyleMap);
        } else {
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
