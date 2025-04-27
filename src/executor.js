import $ from "./Shell/index.js"
import Utils from "./Utils/index.js";
import shorthandJS from "./shorthand.js";
import cleaner from "./cleaner.js";
import collector from "./collector.js"
import STYLE from "./Style/parse.js";
import SCRIPTParse from "./Script/script.js"

export const prefix = {
    class: {},
    atRule: {},
    element: {},
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
    preBinds: [],
    postBinds: []
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
    CSSPath,
    StylesListPath,
}) {
    prefix.class = PREFIX.classes;
    prefix.atRule = PREFIX.atrules;
    prefix.element = PREFIX.elements;
    prefix.property = PREFIX.properties;

    env.devMode = CMD === "dev";
    env.unSpaced = CMD === "dev" || CMD === "preview";

    const files = {}, scope = { local: {} }, report = [];


    const CSSIndexScanned = (STYLE.SCANNER(minify.css(CSSIndex)));
    const CSSAppendixScanned = (STYLE.SCANNER(minify.css(CSSAppendix)));
    scope.variables = Utils.array.setback(CSSIndexScanned.variables)


    const shorthandResponse = await shorthandJS.UPLOAD(SHORTHAND)
    scope.shorthands = shorthandResponse.list;
    report.push(shorthandResponse.report)


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


    const sourceFiles = collector.files(FILES);
    sourceFiles.forEach((file) => {
        const response = SCRIPTParse(file.content, file.extension)

        if (response.classesList.length) lists.classGroups.push(...response.classesList)
        file.content = response.scribed;
        stash.styleLocals[file.filePath] = {};
        response.stylesList.forEach(style => STYLE.TAG(style, file.metaFront, file.filePath))
    })
    stash.global = Object.keys(stash.styleGlobals)



    files[CSSPath] = minify[CMD]([
        // STYLE.RENDER(CSSIndexScanned.styles),
        // STYLE.RENDER(lists.preBinds),
        // STYLE.RENDER(RESULT),
        // STYLE.RENDER(lists.postBinds),
        // STYLE.RENDER(CSSAppendixScanned.styles)
    ].join("\n"))

    const fileSize = (files[CSSPath].length / 1024).toFixed(2)
    report.push($.compose.std.Footer(`Output size: ${fileSize} kb`))
    files[StylesListPath] = JSON.stringify(scope);

    return {
        files: files,
        report: $.compose.std.Block(report)
    };
}