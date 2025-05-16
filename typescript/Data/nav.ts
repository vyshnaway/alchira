const data = (rootPath) => {
    return {
        scaffold: {
            setup: rootPath + "/scaffold/setup",
            refers: rootPath + "/scaffold/refers"
        },
        folder: {
            setup: "xtyles/",
            cache: "xtyles/.cache",
            refers: "xtyles/references",
        },
        css: {
            atrules: "xtyles/#at-rules.css",
            constants: "xtyles/#constants.css",
            elements: "xtyles/#elements.css",
            extends: "xtyles/#extends.css",
        },
        json: {
            configure: "xtyles/configure.jsonc",
            shorthand: "xtyles/shorthands.jsonc",
            styleMap: "xtyles/.cache/style-map.json",
        }
    }
};

export default data;