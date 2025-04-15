import $ from "./Shell/index.js"
import shorthandJS from "./shorthand.js";
import cleaner from "./cleaner.js";
import grouperJS from "./collector.js"
import CSSParse from "./Parse/1.atomic.js";

const minify = {
    dev: (content) => cleaner.uncomment.Css(content),
    preview: (content) => cleaner.minify.Lite(cleaner.uncomment.Css(content)),
    build: (content) => cleaner.minify.Strict(cleaner.uncomment.Script(content)),
}

export default async function EXECUTOR({
    CMD,
    KEY,
    SOURCE,
    SHORTHAND,
    PREFIX,
    CSSPath,
    CSSIndex,
    CSSAppendix,
    StylesListPath,
    REFERS,
    FILES
}) {
    const files = {}
    const report = [];

    report.push(await shorthandJS.UPLOAD(SHORTHAND))

    const references = grouperJS.css(REFERS);
    const scope = {
        scopeStyles: {
            "micros": CSSParse.savior(references["atomic"].data, CMD),
            "macros": CSSParse.savior(references["micros"].data, CMD),
            "compose": CSSParse.savior(references["macros"].data, CMD),
            "composite": CSSParse.savior(references["compose"].data, CMD),
            "source": CSSParse.savior(references["composite"].data, CMD),
            "global": [],
            "globalLib": []
        },
        referScope: {},
        sourceScope: {}
    }
    references["micros"].list.forEach(element => scope.referScope[element] = "micros");
    references["macros"].list.forEach(element => scope.referScope[element] = "macros");
    references["compose"].list.forEach(element => scope.referScope[element] = "compose");
    references["composite"].list.forEach(element => scope.referScope[element] = "composite");

    files[CSSPath] = minify[CMD]([CSSIndex, "/*rendered*/", CSSAppendix].join("\n"))
    report.push($.compose.std.Footer(`Output size: ${(files[CSSPath].length / 1024).toFixed(2)} kb`))

    files[StylesListPath] = JSON.stringify(scope, null, 4);

    return {
        files: files,
        report: $.compose.std.Block(report)
    };
}