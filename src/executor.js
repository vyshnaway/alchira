import $ from "./Shell/index.js"
import Utils from "./Utils/index.js";
import shorthandJS from "./shorthand.js";
import cleaner from "./cleaner.js";
import collector from "./collector.js";
import STYLE from "./Style/parse.js";
import SCRIPTParse from "./Script/script.js";
import COMPILE from "./Style/compile.js";
import buildBinds from "./Worker/binds.js";

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
    classArr: [],
    classGroups: [],
    preBinds: new Set(),
    postBinds: new Set()
}

export const env = {
    counter: 0,
    devMode: true,
    unSpaced: true
}

export const finals = {}

const minify = {
    dev: (content) => content,
    preview: (content) => cleaner.minify.Lite(cleaner.uncomment.Css(content)),
    build: (content) => cleaner.minify.Strict(cleaner.uncomment.Script(content)),
    css: (content) => cleaner.uncomment.Css(content),
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
    SOURCE,
    TARGET,
    CSSPath,
    StylesListPath,
}) {
    prefix.atRule = PREFIX.atrules;
    prefix.property = PREFIX.properties;
    prefix.selector = { ...PREFIX.classes, ...PREFIX.elements }

    // env.devMode = CMD === "dev";
    env.unSpaced = CMD === "dev" || CMD === "preview";

    const files = {}, scope = { local: {} }, report = [];


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

    
    const CSSIndexScanned = (STYLE.XCANNER(minify.css(CSSIndex), "xtyles", "AXIOM"));
    const CSSAppendixScanned = (STYLE.XCANNER(minify.css(CSSAppendix), `${TARGET}/${CSSPath}`, "APPENDIX"));
    scope.variables = Utils.array.setback(CSSIndexScanned.variables);
    CSSAppendixScanned.preBinds.forEach(E => lists.preBinds.add(E));
    CSSAppendixScanned.postBinds.forEach(E => lists.postBinds.add(E));

    const shorthandResponse = await shorthandJS.UPLOAD(SHORTHAND)
    scope.shorthands = shorthandResponse.list;
    report.push(shorthandResponse.report)


    // const sourceFiles = collector.files(FILES);
    // sourceFiles.forEach((file) => {
    //     const response = SCRIPTParse(file.content, file.extension)

    //     if (response.classesList.length) lists.classGroups.push(...response.classesList)
    //     file.content = response.scribed;
    //     stash.styleLocals[file.filePath] = {};
    //     response.stylesList.forEach(style => STYLE.TAGSTYLE(style, file.metaFront, file.filePath))
    // })
    // stash.global = Object.keys(stash.styleGlobals)


    const { preBinds, postBinds } = buildBinds(lists.preBinds, lists.postBinds, stash.indexStyles, stash.styleRefers)

    files[`${SOURCE}/${CSSPath}`] = ([
        COMPILE.array(CSSIndexScanned.styles),
        COMPILE.list(preBinds),
        // STYLE.RENDER(RESULT),
        COMPILE.list(postBinds),
        COMPILE.array(CSSAppendixScanned.styles)
    ].join(env.devMode ? "\n" : ""))


    const fileSize = (files[`${SOURCE}/${CSSPath}`].length / 1024).toFixed(2)
    report.push($.compose.std.Footer(`Output size: ${fileSize} kb`))
    files[StylesListPath] = JSON.stringify(scope);

    return {
        files: files,
        report: $.compose.std.Block(report)
    };
}