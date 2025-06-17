import Use from "./Utils/index.js";

export const APP = {
    name: "",
    version: "",
    website: "",
    command: "",
    cdn: "https://xcdn.xpktr.com/xcss/",
    console: "https://console.xpktr.com/",
    commandList: {
        init: "Initiate or Update & Verify setup.",
        watch: "Live build for developer environment",
        preview: 'Test build. Pass test for "publish" command.',
        publish: "Optimized build, uses web-api.",
    },
    xcssTag: "xtyle",
};

export const NAV = {
    blueprint: {
        scaffold: "blueprint/scaffold",
        libraries: "blueprint/libraries",
        portables: "blueprint/portables",
    },
    folder: {
        setup: "xtyles",
        autogen: "xtyles/autogen",
        library: "xtyles/library",
        portables: "xtyles/portables",
        portableNative: "xtyles/autogen/portable-native",
        portableBundle: "xtyles/autogen/portable-bundle",
    },
    css: {
        atrules: "xtyles/#at-rules.css",
        constants: "xtyles/#constants.css",
        elements: "xtyles/#elements.css",
        extends: "xtyles/#extends.css",
    },
    json: {
        proxymap: "xtyles/proxy-map.jsonc",
        hashrule: "xtyles/hash-rules.jsonc",
        manifest: "xtyles/autogen/manifest.json",
    },
    md: {
        guidelines: "xtyles/guidelines.md",
    },
};

export const ROOT = {
    DOCS: {
        readme: {
            title: "README",
            url: "readme.md",
            path: "readme.md",
        },
        alerts: {
            title: "ALERTS",
            url: "alerts.md",
            path: "alerts.md",
        },
        changelog: {
            title: "ALERTS",
            url: "changelog.md",
            path: "changelog.md",
        },
    },
    AGREEMENT: {
        license: {
            title: "LICENSE",
            url: "agreements-txt/license.txt",
            path: "agreements/license.txt",
        },
        terms: {
            title: "TERMS & CONDITIONS",
            url: "agreements-txt/terms.txt",
            path: "agreements/terms.txt",
        },
        privacy: {
            title: "PRIVACY POLICY",
            url: "agreements-txt/privacy.txt",
            path: "agreements/privacy.txt",
        },
    },
    PREFIX: {
        attributes: {
            url: "prefixes/active/attributes.json",
            path: "blueprint/prefixes/attributes.json",
        },
        values: {
            url: "prefixes/active/values.json",
            path: "blueprint/prefixes/values.json",
        },
        atrules: {
            url: "prefixes/active/atrules.json",
            path: "blueprint/prefixes/atrules.json",
        },
        classes: {
            url: "prefixes/active/classes.json",
            path: "blueprint/prefixes/classes.json",
        },
        elements: {
            url: "prefixes/active/elements.json",
            path: "blueprint/prefixes/elements.json",
        },
        clrprops: {
            url: "prefixes/active/clrprops.json",
            path: "blueprint/prefixes/clrprops.json",
        },
    },
};

export const PUBLISH = {
    DeltaPath: "",
    DeltaContent: "",
    FinalMessage: "",
    FinalError: "",
    ErrorCount: 0,
    WarningCount: 0,
    LastLibINDEX: 0,
    Report: {
        library: "",
        variables: "",
        hashrule: "",
        targets: "",
        errors: "",
        memChart: "",
        footer: "",
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
        binding: {},
    },
    LibFilesTemp: {},
};

export const CACHE = {
    HashRule: {},
    SortedIndexes: [],
    PortableEssentials: [],
    Index2StylesObject: {},
    LibraryStyle2Index: {},
    GlobalsStyle2Index: {},
    PortableStyle2Index: {},
    FinalStack: {},
};

export const STACK = {
    PROXYCACHE: {},
    LIBRARIES: {},
    PORTABLES: {},
};

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
    HASHRULE: {},
    PROXYMAP: {},
    LIBRARIES: {},
    PORTABLES: {},
    PROXYFILES: {},
};

export const PREFIX = {
    clrprops: [],
    atRule: {},
    selector: {},
    attributes: {},
    values: {},
};

