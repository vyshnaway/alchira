export const DATA = {
    CMD: "",
    ARG: "",
    WATCH: false,
    CSSIndex: "",
    RootPath: "",
    WorkPath: "",
    SHORTHAND: {},
    PROXYMAP: {},
    LIBRARY: {},
};

export const APP = {
    name: '',
    version: '',
    website: '',
    command: '',
    styleTag: 'xtyle',
    cdn: "https://xcdn.xpktr.com",
    console: "https://console.xpktr.com",
    commandList: {
        init: 'Initiate or Update & Verify setup.',
        watch: 'Live build for developer environment',
        preview: 'Test build. Pass test for "publish" command.',
        publish: 'Optimized build, uses web-api.'
    },
}

export const NAV = {
    scaffold: {
        setup: "/scaffold/setup",
        refers: "/scaffold/library"
    },
    folder: {
        setup: "/xtyles",
        cache: "/xtyles/.cache",
        refers: "/xtyles/library",
    },
    css: {
        atrules: "/xtyles/#at-rules.css",
        constants: "/xtyles/#constants.css",
        elements: "/xtyles/#elements.css",
        extends: "/xtyles/#extends.css",
    },
    json: {
        proxymap: "/xtyles/proxy-map.jsonc",
        shorthand: "/xtyles/shorthands.jsonc",
        styleMap: "/xtyles/.cache/style-map.json"
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
            path: '/agreements/license.txt'
        },
        terms: {
            title: "TERMS & CONDITIONS",
            url: "/agreements-txt/terms.txt",
            path: '/agreements/terms.txt'
        },
        privacy: {
            title: "PRIVACY POLICY",
            url: "/agreements-txt/privacy.txt",
            path: '/agreements/privacy.txt'
        },
    },
    PREFIX: {
        attributes: {
            url: "/xcss/prefixes/active/attributes.json",
            path: "/scaffold/prefix/attributes.json"
        },
        values: {
            url: "/xcss/prefixes/active/values.json",
            path: "/scaffold/prefix/values.json"
        },
        atrules: {
            url: "/xcss/prefixes/active/atrules.json",
            path: "/scaffold/prefix/atrules.json"
        },
        classes: {
            url: "/xcss/prefixes/active/classes.json",
            path: "/scaffold/prefix/classes.json"
        },
        elements: {
            url: "/xcss/prefixes/active/elements.json",
            path: "/scaffold/prefix/elements.json"
        },
        clrprops: {
            url: "/xcss/prefixes/active/clrprops.json",
            path: "/scaffold/prefix/clrprops.json"
        },
    },
};

export default function SetData(rootPath, workPath, packageJson) {
    APP.name = packageJson.name
    APP.version = packageJson.version
    APP.website = packageJson.website
    APP.command = packageJson.command
    APP.cdn = APP.cdn + packageJson.version.split('.')[1]

    DATA.RootPath = rootPath;
    DATA.WorkPath = workPath;

    Object.entries(NAV).forEach(([groupName, groupPaths]) => {
        if (groupName === "scaffold") {
            Object.entries(groupPaths).forEach(([pathId, pathString]) => {
                groupPaths[pathId] = rootPath + pathString;
            });
        } else {
            Object.entries(groupPaths).forEach(([pathId, pathString]) => {
                groupPaths[pathId] = workPath + pathString;
            });
        }
    });

    Object.values(ROOT).forEach(group => Object.values(group).forEach(entry => {
        entry.url = APP.cdn + entry.url;
        entry.path = rootPath + entry.path;
    }))
}
