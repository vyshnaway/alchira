import $ from "./Shell/index.js"
import Utils from "./Utils/index.js";
import shorthandJS from "./shorthand.js";
import cleaner from "./cleaner.js";
import collector from "./collector.js";
import STYLE from "./Style/parse.js";
import SCRIPT from "./Script/file.js";
import COMPILE from "./Style/compile.js";
import buildBinds from "./Worker/binds.js";
import ORGANIZER from "./Worker/order.js";

export const prefix = {
    atRule: {},
    selector: {},
    property: {},
}

export const stash = {
    shorthands: {},
    indexStyles: {},
    styleRefers: {},
    styleGlobals: {},
    styleLocals: {},
}

export const lists = {
    classGroups: {},
    classTracks: [],
    ordered: [],
    globalStyles: [],
    preBinds: new Set(),
    postBinds: new Set()
}

export const env = {
    styleTag: "xtyle",
    styleCount: 0,
    devMode: true,
    unSpaced: true,
    apiUrl: "https://workers.xpktr.com/api/xcss-build-request"
}

export const
    report = [],
    errorList = [],
    essentials = [],
    finals = {},
    filesOut = {},
    scope = { files: {} }


export function createXtyle() {
    ++env.styleCount;
    return { number: env.styleCount, class: "_" + Utils.string.enCounter(env.styleCount + 768) }
}

function stringMem(string) {
    return (string.length / 1024).toFixed(2) + " Kb"
}

function MANDATES({
    CMD,
    SHORTHAND,
    REFERS,
    FILES,
    CSSIndex,
    CSSAppendix,
    PREFIX,
    KEY,
    EXTPROPS,
    SOURCE,
    TARGET,
    CSSPath,
    StylesListPath,
}) {    
    Object.assign(prefix, {
        atRule: {},
        selector: {},
        property: {},
    });

    Object.assign(stash, {
        shorthands: {},
        indexStyles: {},
        styleRefers: {},
        styleGlobals: {},
        styleLocals: {},
    });

    Object.assign(lists, {
        classGroups: {},
        classTracks: [],
        ordered: [],
        globalStyles: [],
        preBinds: new Set(),
        postBinds: new Set(),
    });

    Object.assign(env, {
        styleTag: "xtyle",
        styleCount: 0,
        devMode: true,
        unSpaced: true,
        apiUrl: "https://workers.xpktr.com/api/xcss-build-request",
    });

    report.length = 0;
    errorList.length = 0;
    essentials.length = 0;
    Object.keys(finals).forEach(key => delete finals[key]);
    Object.keys(filesOut).forEach(key => delete filesOut[key]);
    Object.assign(scope, { files: {} });

    // Initialize
    prefix.atRule = PREFIX.atrules;
    prefix.property = PREFIX.properties;
    prefix.selector = { ...PREFIX.classes, ...PREFIX.elements }

    env.devMode = CMD === "dev";
    env.unSpaced = CMD === "dev" || CMD === "preview";
}

function SETUPRUN({
    CMD,
    SHORTHAND,
    REFERS,
    FILES,
    CSSIndex,
    CSSAppendix,
    PREFIX,
    KEY,
    EXTPROPS,
    SOURCE,
    TARGET,
    CSSPath,
    StylesListPath,
}) {
    // CSS Files
    const CSSIndexScanned = (STYLE.XCANNER(cleaner.uncomment.Css(CSSIndex), "xtyles", "AXIOM"));
    scope.variables = Utils.array.setback(CSSIndexScanned.variables);

    // References
    const referFiles = collector.css(REFERS);
    scope.refer = referFiles.list;

    const axiomChart = [];
    let axiomCount = 0;
    scope.axiom = referFiles.axiom.reduce((levels, referLevel, index) => {
        const classes = STYLE.CSSBULK(referLevel)
        levels[index] = classes.tillStyles
        axiomChart.push($.compose.secondary.Footer(`Level ${index}:  ${classes.exclusiveStyles.length} Styles`, classes.exclusiveStyles, $.list.secondary.Entries))
        axiomCount += classes.exclusiveStyles.length;
        return levels
    }, {})
    report.push($.compose.success.Section("Axiom Index", [$.compose.std.Item(axiomCount + " Styles")]))
    report.push($.compose.success.Block(axiomChart))

    const libraryChart = [];
    let libraryCount = 0;
    scope.library = referFiles.library.reduce((levels, referLevel, index) => {
        const classes = STYLE.CSSBULK(referLevel)
        levels[index] = classes.tillStyles
        libraryChart.push($.compose.secondary.Footer(`Level ${index}:  ${classes.exclusiveStyles.length} Styles`, classes.exclusiveStyles, $.list.secondary.Entries))
        libraryCount += classes.exclusiveStyles.length;
        return levels
    }, {})
    report.push($.compose.success.Section("Library Index", [$.compose.std.Item(libraryCount + " Styles")]))
    report.push($.compose.success.Block(libraryChart))

    // Shorthands
    const shorthandResponse = shorthandJS.UPLOAD(SHORTHAND)
    scope.shorthands = shorthandResponse.list;
    report.push(shorthandResponse.report)


    report.push($.compose.success.Section("Root variables", scope.variables, $.list.secondary.Entries))
    return CSSIndexScanned.styles;
}

async function SOURCEPROCESS({
    CMD,
    SHORTHAND,
    REFERS,
    FILES,
    CSSIndex,
    CSSAppendix,
    PREFIX,
    KEY,
    EXTPROPS,
    SOURCE,
    TARGET,
    CSSPath,
    StylesListPath,
}) {
    // Read source files
    let finalMessage;
    const sourceFiles = collector.files(FILES);

    sourceFiles.forEach((file, index) => {
        const response = SCRIPT.read(file, EXTPROPS[file.extension])

        file.content = response.scribed;
        stash.styleLocals[file.filePath] = {};
        lists.classGroups[file.filePath] = response.classesList;
        const globals = [], locals = [];
        response.stylesList.forEach(style => {
            if (style.selector !== "")
                (style.isGlobal) ? globals.push(style.selector) : locals.push(style.selector);
            const responseErrors = STYLE.TAGSTYLE(style, file.metaFront, file.filePath);
            if (responseErrors.length) {
                const block = $.compose.failed.Note(`${TARGET}/${file.filePath}:${style.rowMarker}:${style.columnMarker}`, responseErrors, $.list.failed.Bullets);
                errorList.push(block)
            }
        })
        report.push($.compose.secondary.Section(`File ${index + 1}:  ${TARGET}/${file.filePath}`, [
            $.compose.std.Item((globals.length + locals.length) + " style definitions.\n"),
            $.compose.std.Footer("Global styles : " + globals.length, globals, $.list.secondary.Entries),
            $.compose.std.Footer("Local styles : " + locals.length, locals, $.list.secondary.Entries)
        ], $.list.std.Blocks))
    })
    stash.global = Object.keys(stash.styleGlobals)
    report.push($.compose.failed.Section(errorList.length + " Errors", errorList))

    // Organize styles
    if ("dev" === CMD) {
        if (errorList.length) {
            finalMessage = "Errors in " + errorList.length + " Tags.";
            errorList.push(finalMessage);
        }
        else finalMessage = "Zero errors."
    } else {
        sourceFiles.forEach((file) => {
            const group = lists.classGroups[file.filePath].reduce((ACC, G) => {
                const subgroup = G.reduce((A, I) => {
                    const index = (stash.styleRefers[I] ?? 0) +
                        (stash.styleGlobals[I] ?? 0) +
                        (stash.styleLocals[file.filePath][I] ?? 0);
                    if (index) A.push(index);
                    return A
                }, [])
                if (subgroup.length) ACC.push(subgroup)
                return ACC
            }, [])
            if (group.length) lists.classTracks.push(...group)
        })

        let output;
        if ("build" === CMD) {
            if (errorList.length) {
                finalMessage = "Errors in " + errorList.length + " Tags. Fallback build using 'preview' command.";
                CMD = "preview";
                output = ORGANIZER(lists.classTracks, CMD, KEY);
            } else {
                output = await ORGANIZER(lists.classTracks, CMD, KEY)
                finalMessage = output.message;
                if (!output.status) errorList.push(finalMessage)
            }
        } else {
            if (errorList.length) {
                finalMessage = "Errors in " + errorList.length + " Tags. Rectify them to proceed with 'build' command.";
                errorList.push(finalMessage);
            } else {
                finalMessage = "Preview verified. Procceed to 'build' using a key.";
            }
            output = ORGANIZER(lists.classTracks, CMD, KEY);
        }


        if (output.status) {
            lists.ordered = output.result;
            lists.ordered.forEach(I => {
                stash.indexStyles[I].preBinds.forEach(E => lists.postBinds.add(E))
                stash.indexStyles[I].postBinds.forEach(E => lists.preBinds.add(E))
                finals["." + stash.indexStyles[I].class] = I;
            });
        } else CMD = "preview";

    }
     

    scope.compose = Object.keys(stash.styleRefers);
    scope.globals = Object.keys(stash.styleGlobals);
    // Write source files
    sourceFiles.forEach((file) => {
        scope.files[file.filePath] = Object.keys(stash.styleLocals[file.filePath])
        const response = SCRIPT[CMD](file, EXTPROPS[file.extension])
        filesOut[`${SOURCE}/${file.filePath}`] = response.scribed;
    })

    return finalMessage;
}

async function FINALGEN({
    CMD,
    SHORTHAND,
    REFERS,
    FILES,
    CSSIndex,
    CSSAppendix,
    PREFIX,
    KEY,
    EXTPROPS,
    SOURCE,
    TARGET,
    CSSPath,
    StylesListPath,
}, CSSIndexStyles) {
    const finalMessage = await SOURCEPROCESS({
        CMD,
        SHORTHAND,
        REFERS,
        FILES,
        CSSIndex,
        CSSAppendix,
        PREFIX,
        KEY,
        EXTPROPS,
        SOURCE,
        TARGET,
        CSSPath,
        StylesListPath,
    })


    // Render stylesheet
    const CSSAppendixScanned = (STYLE.XCANNER(cleaner.uncomment.Css(CSSAppendix), `${TARGET}/${CSSPath}`, "APPENDIX"));
    CSSAppendixScanned.preBinds.forEach(E => lists.preBinds.add(E));
    CSSAppendixScanned.postBinds.forEach(E => lists.postBinds.add(E));

    const { preBinds, postBinds } =
        buildBinds(lists.preBinds, lists.postBinds, stash.indexStyles, stash.styleRefers)

    const indexSheet = COMPILE.array(CSSIndexStyles);
    const essentialSheet = COMPILE.array(essentials);
    const prebindsSheet = COMPILE.list(preBinds);
    const renderedSheet = COMPILE.map(finals);
    const postbindsSheet = COMPILE.list(postBinds);
    const appendixSheet = COMPILE.array(CSSAppendixScanned.styles);

    const memChart = {
        Index: stringMem(indexSheet),
        Essentials: stringMem(essentialSheet),
        Prebinds: stringMem(prebindsSheet),
        Rendered: stringMem(renderedSheet),
        Postbinds: stringMem(postbindsSheet),
        Appendix: stringMem(appendixSheet),
    }

    const result = ([
        indexSheet,
        essentialSheet,
        prebindsSheet,
        renderedSheet,
        postbindsSheet,
        appendixSheet,
    ].join(env.devMode ? "\n" : ""))


    // Finalize
    filesOut[StylesListPath] = JSON.stringify(scope);
    if(CMD !== "dev"){
        report.push($.compose[errorList.length ? "failed" : "success"].Section(finalMessage, memChart, $.list.std.Props))
        report.push($.compose.std.Footer('Output size : ' + stringMem(result)))
    }

    return result;
}

export default async function EXECUTOR({
    CMD,
    SHORTHAND,
    REFERS,
    FILES,
    CSSIndex,
    CSSAppendix,
    PREFIX,
    KEY,
    EXTPROPS,
    SOURCE,
    TARGET,
    CSSPath,
    StylesListPath,
}) {
    MANDATES({
        CMD,
        SHORTHAND,
        REFERS,
        FILES,
        CSSIndex,
        CSSAppendix,
        PREFIX,
        KEY,
        EXTPROPS,
        SOURCE,
        TARGET,
        CSSPath,
        StylesListPath,
    })

    const CSSIndexStyles = SETUPRUN({
        CMD,
        SHORTHAND,
        REFERS,
        FILES,
        CSSIndex,
        CSSAppendix,
        PREFIX,
        KEY,
        EXTPROPS,
        SOURCE,
        TARGET,
        CSSPath,
        StylesListPath,
    })

    filesOut[`${SOURCE}/${CSSPath}`] = await FINALGEN({
        CMD,
        SHORTHAND,
        REFERS,
        FILES,
        CSSIndex,
        CSSAppendix,
        PREFIX,
        KEY,
        EXTPROPS,
        SOURCE,
        TARGET,
        CSSPath,
        StylesListPath,
    }, CSSIndexStyles)

    return {
        files: filesOut,
        report: $.compose.std.Block(report)
    };
}