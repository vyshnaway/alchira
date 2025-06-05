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
    ENV,
    STASH,
    PUBLISH,
    RENDERFRAGS,
    CUMULATES,
    ProxyTargets,
    GenAccumulates,
    ResetCache
} from "./data-cache.js";
import Utils from "./Utils/index.js";

// On library edit.
export function UpdateLibrary(action = "upload", filePath, fileContent) {
    ResetCache();
    switch (action) {
        case "upload": Refers.UploadFiles(DATA.LIBRARY); break;
        case "delete": Refers.DeleteFile(filePath); break;
        case "save": Refers.SaveFile(filePath, fileContent); break;
    }

    const { consoleReport, referTable, AxiomStyleMap, LibraryStyleMap } = Refers.Renders();
    PUBLISH.StyleMap.axiom = AxiomStyleMap;
    PUBLISH.StyleMap.library = LibraryStyleMap;
    PUBLISH.StyleMap.file = referTable;
    PUBLISH.Report.library = $.MOLD.std.Block(consoleReport);
}

// On shorthands edit.
export function UpdateShorthands() {
    const shorthandResponse = shorthandJS.UPLOAD(DATA.SHORTHAND)
    PUBLISH.StyleMap.shorthands = shorthandResponse.list;
    PUBLISH.Report.shorthand = shorthandResponse.report;
}

// On target files edit.
export function ProcessProxies(action = "upload", targetFolder, filePath, fileContent, extension) {
    const subPath = action !== "upload" ? filePath.slice(targetFolder.length + 1) : "";
    switch (action) {
        case "upload":
            Object.values(ProxyTargets).forEach(proxy => { proxy.cache = new Proxy(proxy); });
            break;
        case "delete":
            if (Object.keys(ProxyTargets[targetFolder].extensions).includes(extension)) {
                delete ProxyTargets[targetFolder].fileContents[subPath];
                ProxyTargets[targetFolder].cache.DeleteFile(filePath);
            } else { }
            break;
        case "save":
            if (Object.keys(ProxyTargets[targetFolder].extensions).includes(extension)) {
                ProxyTargets[targetFolder].fileContents[subPath] = fileContent;
                ProxyTargets[targetFolder].cache.SaveFile(subPath, fileContent);
            } else {
                PUBLISH.SaveFiles(ProxyTargets[targetFolder].source + "/" + filePath) = fileContent;
            }
            break;
    }
}

async function Accumulate() {
    let FinalMessage = '';
    GenAccumulates();

    if ("dev" === DATA.CMD) {
        STASH.FinalStack = {};
        FinalMessage = CUMULATES.errors.length ? "Errors in " + CUMULATES.errors.length + " Tags." : "Zero errors.";
    } else {
        let output;
        if ("build" === DATA.CMD) {
            if (CUMULATES.errors.length) {
                output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG);
                FinalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Falling back to 'preview' command.";
                DATA.CMD = "preview";
            } else {
                output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG)
                FinalMessage = output.message;
                if (output.status) DATA.CMD = "preview";
                else CUMULATES.errors.push(FinalMessage);
            }
        } else if ("preview" === DATA.CMD) {
            FinalMessage = CUMULATES.errors.length === 0 ? "Preview verified. Procceed to 'build' using a key." :
                "Errors in " + CUMULATES.errors.length + " Tags. Rectify them to proceed with 'build' command.";
            output = await ORGANIZER(CUMULATES.classTracks, DATA.CMD, DATA.ARG);
        }

        STASH.FinalStack = output.result.reduce((A, I) => {
            A["." + STASH.Index2StylesObject[I].class] = I;
            return A;
        }, {});
        STASH.SortedIndexes = output.result;
    }
    PUBLISH.Report.errorList = CUMULATES.errors.length ? $.MOLD.failed.Section(CUMULATES.errors.length + " Errors", CUMULATES.errors) : '';

    return FinalMessage;
}

const RENDER = {
    index: () => {
        const scanned = STYLE.CSSCANNER(cleaner.uncomment.Css(DATA.CSSIndex), "xtyles", "AXIOM");
        RENDERFRAGS.INDEX = COMPILE(scanned.styles, !DATA.ISDEV);
        PUBLISH.StyleMap.variables = Use.array.setback(scanned.variables);
        PUBLISH.Report.variables = $.MOLD.primary.Section("Root variables", PUBLISH.StyleMap.variables, $.list.secondary.Entries);
        return { preBinds: scanned.preBinds, postBinds: scanned.postBinds }
    },
    essentials: () => {
        const preBinds = [], postBinds = [];
        RENDERFRAGS.ESSENTIALS = COMPILE(Object.values(ProxyTargets).reduce((essentials, proxy) => {
            essentials.push(...proxy.cache.cumulated.essentials);
            preBinds.push(...proxy.cache.cumulated.preBinds);
            postBinds.push(...proxy.cache.cumulated.postBinds);
            return essentials;
        }, []), !DATA.ISDEV)
        return { preBinds, postBinds }
    },
    rendered: () => {
        const SaveFiles = {}, preBinds = new Set(), postBinds = new Set();

        console.log(STASH.FinalStack)
        Object.values(ProxyTargets).reduce((rendered, proxy) => {
            proxy.cache.RenderFiles(SaveFiles, preBinds, postBinds, DATA.CMD);
            return rendered;
        }, [])

        console.log(STASH.FinalStack)
        RENDERFRAGS.RENDERED = COMPILE(FORGE.indexMaps(STASH.FinalStack), !DATA.ISDEV)
        return { SaveFiles, renderedBinds: { preBinds, postBinds } }
    },
    appendix: () => {
        const preBinds = [], postBinds = [];
        RENDERFRAGS.APPENDIX = COMPILE(Object.values(ProxyTargets).reduce((appendix, proxy) => {
            const scanned = STYLE.CSSCANNER(cleaner.uncomment.Css(proxy.stylesheetContent), proxy.cache.targetStylesheet);
            appendix.push(...scanned.styles);
            preBinds.push(...scanned.preBinds);
            postBinds.push(...scanned.postBinds);
            return appendix;
        }, []), !DATA.ISDEV);
        return { preBinds, postBinds }
    },
    binds: (preBinds, postBinds) => {
        const rendered = FORGE.bindIndex(
            new Set(preBinds),
            new Set(postBinds),
        );
        RENDERFRAGS.PREBINDS = COMPILE(rendered.preBinds, !DATA.ISDEV);
        RENDERFRAGS.POSTBINDS = COMPILE(rendered.postBinds, !DATA.ISDEV);
    },
}

// On target stylesheet edit.
export async function GenerateFinal(DeleteFiles = []) {
    const FinalMessage = await Accumulate();

    const indexBinds = RENDER.index();
    const essentialsBinds = RENDER.essentials();
    const appendixBinds = RENDER.appendix();
    const { SaveFiles, renderedBinds } = RENDER.rendered();
    RENDER.binds([...indexBinds.preBinds, ...essentialsBinds.preBinds, ...appendixBinds.preBinds, ...renderedBinds.preBinds],
        [...indexBinds.postBinds, ...essentialsBinds.postBinds, ...appendixBinds.postBinds, ...renderedBinds.postBinds]);

    const FinalStylesheet = Object.values(RENDERFRAGS).filter(string => string !== '').join(DATA.ISDEV ? "\n" : "");
    Object.values(ProxyTargets).forEach(proxy => { SaveFiles[proxy.cache.sourceStylesheet] = FinalStylesheet; });

    if (DATA.CMD === "dev") {
        SaveFiles[NAV.json.styleMap] = JSON.stringify(PUBLISH.StyleMap);
    } else {
        const memChart = {
            Index: Use.string.stringMem(RENDERFRAGS.INDEX),
            Essentials: Use.string.stringMem(RENDERFRAGS.ESSENTIALS),
            Prebinds: Use.string.stringMem(RENDERFRAGS.PREBINDS),
            Rendered: Use.string.stringMem(RENDERFRAGS.RENDERED),
            Postbinds: Use.string.stringMem(RENDERFRAGS.POSTBINDS),
            Appendix: Use.string.stringMem(RENDERFRAGS.APPENDIX),
        }
        PUBLISH.Report.memChart = $.MOLD[CUMULATES.errors.length ? "failed" : "success"]
            .Section(FinalMessage, Object.entries(memChart).reduce((ch, [k, v]) => { ch[k] = `${v} Kb`; return ch }, {}), $.list.std.Props)
        PUBLISH.Report.footer = $.MOLD.std.Footer(`Output size :  ${(Object.values(memChart).reduce((M, I) => I + M, 0))} Kb`)
    }

    return {
        SaveFiles: SaveFiles,
        DeleteFiles: Utils.array.setback(DeleteFiles),
        ConsoleReport: $.MOLD.std.Block(Object.values(PUBLISH.Report).filter(string => string !== ''))
    };
}
