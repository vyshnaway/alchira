import shorthandJS from "./shorthand.js"
import grouperJS from "./collector.js"
// import xtyles from "./xtyles/index.js"
import cleaner from "./cleaner.js";

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
    REFERS,
    FILES
}) {
    const response = { files: {}, report: "" };

    // shorthandJS.UPLOAD(SHORTHAND)

    // for (const group in grouperJS.css(Object.keys(REFERS))) {
    //     const result = {}
    //     group.forEach(file => {
    //         result = { ...result, ...xtyles.extract(file.path, file.meta) }
    //     });
    //     xtyles.upload(result)
    // }
    
    const CSSNarrative = ""

    response.files[CSSPath] = minify[CMD]([CSSIndex, CSSNarrative, CSSAppendix].join("\n"))
    response.report += `Output size: ${(response.files[CSSPath].length / 1024).toFixed(2)} kb\n`
    return response;
}