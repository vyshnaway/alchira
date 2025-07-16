export const APP = {
    name: "",
    version: "",
    website: "",
    command: "",
    PortablesCdn: "",
    cdn: "https://xcdn.xpktr.com/xcss/",
    worker: "https://workers.xpktr.com/api/xcss-build-request",
    console: "https://console.xpktr.com/",
    commandList: {
        init: "Initiate or Update & Verify setup.",
        watch: "Live build for developer environment",
        preview: 'Test build. Pass test for "publish" command.',
        publish: "Optimized build, uses web-api.",
    },
    vendors: [],
    xcssTag: "xtyle",
};

export const NAV = {
    blueprint: {
        scaffold: "blueprint/scaffold",
        libraries: "blueprint/libraries",
        vendors: "blueprint/vendors",
    },
    folder: {
        setup: "xtyles",
        autogen: "xtyles/autogen",
        library: "xtyles/library",
        portables: "xtyles/portables",
        mybundles: "xtyles/autogen/portable",
    },
    css: {
        atrules: "xtyles/#at-rules.css",
        constants: "xtyles/#constants.css",
        elements: "xtyles/#elements.css",
        extends: "xtyles/#extends.css",
    },
    json: {
        configure: "xtyles/configure.jsonc",
        hashrules: "xtyles/hashrules.jsonc",
        manifest: "xtyles/autogen/manifest.json",
    },
    md: {
        instructions: "xtyles/instructions.md",
        instructions: "xtyles/readme.md",
    },
    file: {
        manifestIgnore: "xtyles/autogen/.gitignore"
    }
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
    VENDOR: {
        attributes: {
            url: "attributes.json",
            path: "attributes.json",
        },
        values: {
            url: "values.json",
            path: "values.json",
        },
        atrules: {
            url: "atrules.json",
            path: "atrules.json",
        },
        classes: {
            url: "classes.json",
            path: "classes.json",
        },
        elements: {
            url: "elements.json",
            path: "elements.json",
        }
    },
};

export const PUBLISH = {
    DeltaPath: "",
    DeltaContent: "",
    FinalMessage: "",
    FinalError: "",
    ErrorCount: 0,
    WarningCount: 0,
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
        prefix: "",
        constants: [],
        hashrules: {},
        file: {},
        local: {},
        global: {},
        axiom: {},
        cluster: {},
        xtyling: {},
        binding: {},
    },
    LibFilesTemp: {},
};

export const CACHE = {
    HashRule: {},
    SortedIndexes: [],
    PortableEssentials: [],
    Index2StylesObject: {},
    NativeStyle2Index: {},
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
    PORTABLEFRAME: {},
    DEPENDENCIES: {},
};

export const PREFIX = {
    atRule: {},
    pseudos: {},
    attributes: {},
    values: {},
};

