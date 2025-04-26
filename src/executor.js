import $ from "./Shell/index.js"
import shorthandJS from "./Parse/shorthand.js";
import cleaner from "./cleaner.js";
import collector from "./collector.js"
import CSSParse from "./Parse/css.js";

export const stash = {
    shorthands: {},
    classPrefix: {},
    atRulePrefix: {},
    elementPrefix: {},
    propertyPrefix: {},
    styleList: {},
    styleIndex: {},
}

const minify = {
    dev: (content) => content,
    preview: (content) => cleaner.minify.Lite(cleaner.uncomment.Css(content)),
    build: (content) => cleaner.minify.Strict(cleaner.uncomment.Script(content)),
}

export default async function EXECUTOR({
    SHORTHAND,
    REFERS,
    PREFIX,
    FILES,
    CMD,
    KEY,
    SOURCE,
    CSSPath,
    CSSIndex,
    CSSAppendix,
    StylesListPath,
}) {
    const files = {}, scope = {}, report = [];

    const shorthandResponse = await shorthandJS.UPLOAD(SHORTHAND)
    scope.shorthands = shorthandResponse.list;
    report.push(shorthandResponse.report)

    const referFiles = collector.css(REFERS); // console.log(referFiles);
    scope.levels = referFiles.index.reduce((levels, referLevel, index) => {
        levels[index] = CSSParse.READER(referLevel)
    }, {})

    // const sourceFiles = collector.files(FILES); console.log(sourceFiles);

    // const atomicStyles = CSSParse.READER(referFiles["atomic"].data, false);
    // const microsStyles = CSSParse.READER(referFiles["micros"].data, false);
    // const macrosStyles = CSSParse.READER(referFiles["macros"].data, false);
    // const composeStyles = CSSParse.READER(referFiles["compose"].data, true);
    // const compositeStyles = CSSParse.READER(referFiles["composite"].data, true);

    // const scope = {
    //     shorthands: shorthands.list,
    //     cumulates: {
    //         "micros": atomicStyles,
    //         "macros": microsStyles,
    //         "compose": macrosStyles,
    //         "composite": composeStyles,
    //         "source": compositeStyles,
    //         "global": [],
    //         "globalLib": []
    //     },
    //     referScope: {},
    //     sourceScope: {}
    // }

    // stash.classPrefix = PREFIX.classes;
    // stash.atRulePrefix = PREFIX.atrules;
    // stash.elementPrefix = PREFIX.elements;
    // stash.propertyPrefix = PREFIX.properties;

    // referFiles["micros"].list.forEach(element => scope.referScope[element] = "micros");
    // referFiles["macros"].list.forEach(element => scope.referScope[element] = "macros");
    // referFiles["compose"].list.forEach(element => scope.referScope[element] = "compose");
    // referFiles["composite"].list.forEach(element => scope.referScope[element] = "composite");

    // files[CSSPath] = minify[CMD]([CSSIndex, "/*rendered*/", CSSParse.RENDER(CSSAppendix)].join("\n"))
    // report.push($.compose.std.Footer(`Output size: ${(files[CSSPath].length / 1024).toFixed(2)} kb`))
    // files[StylesListPath] = JSON.stringify(scope);

    return {
        files: files,
        report: $.compose.std.Block(report)
    };
}