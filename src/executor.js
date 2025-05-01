import $ from "./Shell/index.js"
import Utils from "./Utils/index.js";
import shorthandJS from "./shorthand.js";
import cleaner from "./cleaner.js";
import collector from "./collector.js";
import STYLE from "./Style/parse.js";
import SCRIPT from "./Script/file.js";
import COMPILE from "./Style/compile.js";
import buildBinds from "./Worker/binds.js";
import ORGANIZER from "./Worker/organize.js";

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
    tagCount: 0,
    devMode: true,
    unSpaced: true,
    buildApi: ""
}

export const
    report = [],
    essentials = [],
    finals = {},
    filesOut = {},
    scope = { files: {} }

export function createXtyle() {
    ++env.styleCount;
    return { number: env.styleCount, class: "_" + Utils.string.enCounter(env.styleCount + 768) }
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
    // References
    const referFiles = collector.css(REFERS);
    scope.refer = referFiles.list
    scope.axiom = referFiles.axiom.reduce((levels, referLevel, index) => {
        levels[index] = STYLE.CSSBULK(referLevel)
        return levels
    }, {})
    scope.library = referFiles.library.reduce((levels, referLevel, index) => {
        levels[index] = STYLE.CSSBULK(referLevel)
        return levels
    }, {})


    // CSS Files
    const CSSIndexScanned = (STYLE.XCANNER(cleaner.uncomment.Css(CSSIndex), "xtyles", "AXIOM"));
    scope.variables = Utils.array.setback(CSSIndexScanned.variables);


    const shorthandResponse = shorthandJS.UPLOAD(SHORTHAND)
    scope.shorthands = shorthandResponse.list;
    report.push(shorthandResponse.report)

    return CSSIndexScanned.styles;
}

function SOURCEPROCESS({
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
    const sourceFiles = collector.files(FILES);
    sourceFiles.forEach((file) => {
        const response = SCRIPT.read(file, EXTPROPS[file.extension])

        file.content = response.scribed;
        stash.styleLocals[file.filePath] = {};
        lists.classGroups[file.filePath] = response.classesList
        response.stylesList.forEach(style => STYLE.TAGSTYLE(style, file.metaFront, file.filePath))
    })
    stash.global = Object.keys(stash.styleGlobals)


    // Organize styles
    if ("dev" !== CMD) {
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
        const output = ORGANIZER(lists.classTracks, CMD, KEY);
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
}

function FINALGEN({
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
    SOURCEPROCESS({
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

    const result = ([
        // COMPILE.array(CSSIndexStyles),
        // COMPILE.list(preBinds),
        // COMPILE.array(essentials),
        COMPILE.map(finals),
        // COMPILE.list(postBinds),
        // COMPILE.array(CSSAppendixScanned.styles)
    ].join(env.devMode ? "\n" : ""))

    // Finalize
    filesOut[StylesListPath] = JSON.stringify(scope);
    report.push($.compose.std.Footer(`Output size: ${(result.length / 1024).toFixed(2)} kb`))

    return result;
}

export default function EXECUTOR({
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

    filesOut[`${SOURCE}/${CSSPath}`] = FINALGEN({
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