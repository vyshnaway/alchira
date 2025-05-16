export const DATA = {
    CMD: "",
    ARG: "",
    CSSIndex: "",
    SHORTHAND: {},
    LIBRARY: {},
    TARGETS: {},
    PREFIX: {
        classes: {},
        atrules: {},
        elements: {},
        properties: {},
    },
};

export const APP = {
    name: '',
    version: '',
    website: '',
    command: '',
    cdn: "https://xcdn.xpktr.com/xcss/version/",
    console: "https://console.xpktr.com/",
    commandList: {
        init: 'Initiate or Update & Verify setup.',
        dev: 'Live build for dev environment',
        preview: 'Fast build, preserves class names.',
        build: 'Build minified.'
    },
}

export const NAV = {
    scaffold: {
        setup: "/scaffold/setup",
        refers: "/scaffold/refers"
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
};

export const ROOT = {
    DOCS: {
        readme: {
            title: "README",
            url: "/readme.md",
            path: "/readme.md"
        },
        alerts: {
            title: "ALERTS",
            url: "/alerts.md",
            path: "/alerts.md"
        },
    },
    AGREEMENT: {
        license: {
            title: "LICENSE",
            url: "/agreements-txt/license.txt",
            path: '/AGREEMENTS/license.txt'
        },
        terms: {
            title: "TERMS & CONDITIONS",
            url: "/agreements-txt/terms.txt",
            path: '/AGREEMENTS/terms.txt'
        },
        privacy: {
            title: "PRIVACY POLICY",
            url: "/agreements-txt/privacy.txt",
            path: '/AGREEMENTS/privacy.txt'
        },
    },
    PREFIX: {
        atrules: {
            url: "/prefixes/atrules.json",
            path: "/scaffold/prefix/atrules.json"
        },
        classes: {
            url: "/prefixes/classes.json",
            path: "/scaffold/prefix/classes.json"
        },
        elements: {
            url: "/prefixes/elements.json",
            path: "/scaffold/prefix/elements.json"
        },
        properties: {
            url: "/prefixes/properties.json",
            path: "/scaffold/prefix/properties.json"
        },
    },
};

export default function SetData(rootPath, packageJson) {
    APP.name = packageJson.name
    APP.version = packageJson.version
    APP.website = packageJson.homepage
    APP.command = packageJson.command
    APP.cdn = packageJson.command + packageJson.version.split('.')[1]

    NAV.scaffold.setup = rootPath + NAV.scaffold.setup;
    NAV.scaffold.refers = rootPath + NAV.scaffold.setup;

    Object.values(ROOT).forEach(group => Object.values(group).forEach(entry => {
        entry.url = APP.cdn + entry.url;
        entry.path = rootPath + entry.path;
    }))
}
