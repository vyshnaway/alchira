import Use from "./Utils/index.js"

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
        autogen: "/xtyles/autogen",
        library: "/xtyles/library",
        portables: "/xtyles/portables",
        portableNative: "/xtyles/autogen/portable-native",
        portableBundle: "/xtyles/autogen/portable-bundle",
    },
    css: {
        atrules: "/xtyles/#at-rules.css",
        constants: "/xtyles/#constants.css",
        elements: "/xtyles/#elements.css",
        extends: "/xtyles/#extends.css",
    },
    json: {
        proxymap: "/xtyles/proxy-map.jsonc",
        hashrule: "/xtyles/hash-rules.jsonc",
        manifest: "/xtyles/autogen/manifest.json"
    },
    md: {
        guidelines: "xtlyes/guidelines.md"
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


export const PUBLISH = {
    DeltaPath: "",
    DeltaContent: "",
    FinalMessage: "",
    ErrorCount: 0,
    WarningCount: 0,
    Report: {
        library: "",
        variables: "",
        hashrule: "",
        targets: "",
        errors: "",
        memChart: "",
        footer: ""
    },
    MANIFEST: {
        constants: [],
        hashrules: {},
        file: {},
        local: {},
        global: {},
        axiom: {},
        cluster: {},
        portable: {},
        binding: {}
    }
}

export const CACHE = {
    HashRule: {},
    SortedIndexes: [],
    PortableEssentials: [],
    LibraryStyle2Index: {},
    GlobalsStyle2Index: {},
    Index2StylesObject: {},
    PortableStyle2Index: {},
    FinalStack: {},
}

export const STACK = {
    PROXYFILES: {},
    PROXYCACHE: {},
    LIBRARIES: {},
    PORTABLES: {}
}

export const INDEX = {
    NOW: 0,
    BIN: [],
    DECLARE: () => {
        const number = INDEX.BIN.length ? INDEX.BIN.pop() : ++INDEX.NOW;
        return { number, class: "_" + Use.string.enCounter(number + 768) };
    },
    DISPOSE: (...indexes) => {
        indexes.forEach(index => {
            INDEX.BIN.push(index);
            delete CACHE.Index2StylesObject[index];
        })
    },
    RESET: () => {
        INDEX.NOW = 0;
        Object.keys(CACHE.Index2StylesObject).forEach(key => delete CACHE.Index2StylesObject(key))
    }
}

export const RAW = {
    WATCH: false,
    PACKAGE: "",
    VERSION: "",
    CMD: "",
    ARG: "",
    ReadMe: "",
    CSSIndex: "",
    RootPath: "",
    WorkPath: "",
    PROXYMAP: {},
    HASHRULE: {},
    LIBRARIES: {},
    PORTABLES: {},
    PREFIXES: {
        attributes: {},
        values: {},
        atrules: {},
        classes: {},
        elements: {},
        clrprops: [],
    },
};

export const PREFIX = {
    clrprops: [],
    atRule: {},
    selector: {},
    attributes: {},
    values: {},
}

export default function SETENV(rootPath, workPath, packageJson) {

    PREFIX.clrprops = RAW.PREFIXES.clrprops;
    PREFIX.selector = { ...RAW.PREFIXES.classes, ...RAW.PREFIXES.elements };
    PREFIX.attributes = RAW.PREFIXES.attributes;
    PREFIX.atRule = RAW.PREFIXES.atrules;
    PREFIX.values = RAW.PREFIXES.values;

    APP.name = packageJson.name
    APP.version = packageJson.version
    APP.website = packageJson.website
    APP.command = packageJson.command
    APP.cdn = APP.cdn + packageJson.version.split('.')[1]

    RAW.RootPath = rootPath;
    RAW.WorkPath = workPath;

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