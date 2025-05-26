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
    DECLARESTYLE,
    GenAccumulates,
    Initialize,
    ResetCache
} from "./data-cache.js";

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
export async function ProcessProxies(action = "upload", targetFolder, filePath, fileContent) {
    const subPath = action !== "upload" ? filePath.slice(targetFolder.length + 1) : "";
    switch (action) {
        case "upload":
            Object.values(ProxyTargets).forEach(proxy => { proxy.cache = new Proxy(proxy); });
            break;
        case "delete":
            delete ProxyTargets.fileContents[subPath];
            ProxyTargets[targetFolder].cache.DeleteFile(filePath);
            break;
        case "save":
            ProxyTargets.fileContents[subPath] = fileContent;
            ProxyTargets[targetFolder].cache.SaveFile(subPath, fileContent);
            break;
    }
    // console.log(Object.values(ProxyTargets.xrc.cache.fileCache)[0])
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
                // STASH.Index2StylesObject[I].preBinds.forEach(E => lists.FinalPostBinds.add(E))
                // STASH.Index2StylesObject[I].postBinds.forEach(E => lists.FinalPreBinds.add(E))
                STASH.Midway.Finals["." + STASH.Index2StylesObject[I].class] = I;
            });
        } else DATA.CMD = "preview";
    }

    PUBLISH.Report.errorList = $.MOLD.failed.Section(CUMULATES.errors.length + " Errors", CUMULATES.errors);
    PUBLISH.ConsoleErrors.push($.MOLD.failed.Section(CUMULATES.errors.length + " Errors", CUMULATES.errors))

    return finalMessage;
}

const RENDER = {
    index: () => {
        const CSSIndexScanned = (STYLE.CSSCANNER(cleaner.uncomment.Css(DATA.CSSIndex), "xtyles", "AXIOM"));
        RENDERFRAGS.INDEX = COMPILE(CSSIndexScanned.styles);
        PUBLISH.StyleMap.variables = Use.array.setback(CSSIndexScanned.variables);
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
        const CSSAppendixScanned = (STYLE.CSSCANNER(cleaner.uncomment.Css(CSSAppendix), `${TARGET}/${CSSPath}`, "APPENDIX"));
        CSSAppendixScanned.preBinds.forEach(E => lists.FinalPreBinds.add(E));
        CSSAppendixScanned.postBinds.forEach(E => lists.FinalPostBinds.add(E));
        RENDERFRAGS.APPENDIX = COMPILE(ProxyTargets.reduce((accum, proxy) => {
            scanned.preBinds.forEach(bind => STASH.FinalPreBinds.add(bind));
            scanned.postBinds.forEach(bind => STASH.FinalPostBinds.add(bind));
            const scanned = STYLE.CSSCANNER(cleaner.uncomment.Css(proxy.stylesheetContent), proxy.cache.targetStylesheet, "APPENDIX");
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

    // Finalize
    const FinalStylesheet = Object.values(RENDERFRAGS).join(ENV.devMode ? "\n" : "");
    ProxyTargets.forEach(proxy => { PUBLISH.FinalFiles[proxy.cache.sourceStylesheet] = FinalStylesheet; });

    if (DATA.CMD === "dev") {
        PUBLISH.FinalFiles[NAV.json.styleMap] = JSON.stringify(PUBLISH.StyleMap);
        PUBLISH.FinalFiles[NAV.json.switchMap] = JSON.stringify(PUBLISH.SwitchMap);
    } else {
        const memChart = {
            Index: Use.string.stringMem(RENDERFRAGS.INDEX),
            Essentials: Use.string.stringMem(RENDERFRAGS.ESSENTIALS),
            Prebinds: Use.string.stringMem(RENDERFRAGS.PREBINDS),
            Rendered: Use.string.stringMem(RENDERFRAGS.RENDERED),
            Postbinds: Use.string.stringMem(RENDERFRAGS.POSTBINDS),
            Appendix: Use.string.stringMem(RENDERFRAGS.APPENDIX),
        }
        // STASH.ConsoleReport.push($.MOLD[ACUM.errors.length ? "failed" : "success"].Section(finalMessage, Object.entries(memChart), $.list.std.Props))
        // STASH.ConsoleReport.push($.MOLD.std.Footer('Output size : ' + Object.values(memChart).reduce((M, I) => I + M, 0)))
    }

    return {
        files: PUBLISH.FinalFiles,
        errors: $.MOLD.std.Block(PUBLISH.ConsoleErrors),
        report: $.MOLD.std.Block(STASH.ConsoleReport)
    };
}
