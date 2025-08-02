const domain = "xcss.io";

export const APP = {
    name: "",
    version: "",
    website: "",
    command: "",
    Cdn: `https://cdn.${domain}/`,
    Worker: `https://worker.${domain}/`,
    Console: `https://console.${domain}/`,
    PrefixCdn: `https://prefix.${domain}/`,
    PackageCdn: `https://package.${domain}/`,
    commandList: {
        init: "Initiate or Update & Verify setup.",
        watch: "Live build for developer environment",
        preview: 'Test build. Pass test for "publish" command.',
        publish: "Optimized build, uses web-api.",
    },
    defaultTweaks: {
        OpenXtyles: true,
        RapidSense: true,
        Shorthands: true,
        ForceLocal: false,
        IntelGroup: "browser"
    },
    customTag: {
        main: "xcss",
        style: "xtyle",
        attach: "xtaple",
        stencil: "xtencil",
    }
};

export const TWEAKS = {
    ...APP.defaultTweaks
};

export const NAV = {
    blueprint: {
        scaffold: "blueprint/scaffold",
        libraries: "blueprint/libraries",
    },
    folder: {
        setup: "xtyles",
        autogen: "xtyles/autogen",
        library: "xtyles/library",
        packages: "xtyles/packages",
        archives: "xtyles/autogen/archive",
    },
    css: {
        atrules: "xtyles/#at-rules.css",
        constants: "xtyles/#constants.css",
        elements: "xtyles/#elements.css",
        extends: "xtyles/#extends.css",
    },
    json: {
        vendors: "blueprint/vendors.json",
        configure: "xtyles/configure.jsonc",
        hashrules: "xtyles/hashrules.jsonc",
    },
    md: {
        instructions: "xtyles/instructions.md",
        readme: "xtyles/readme.md",
    },
};

export const AUTOGEN = {
    index: {
        path: "xtyles/autogen/watch/index.css",
        default: ``
    },
    styles: {
        path: "xtyles/autogen/watch/styles.css",
        default: ``
    },
    ignore: {
        path: "xtyles/autogen/.gitignore",
        default: `watch/**\nmanifest.json`
    },
    manifest: {
        path: "xtyles/autogen/manifest.json",
        default: `{}`
    },
}

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
            title: "CHANGELOG",
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
    }
};

export const PREFIX = {
    atRule: {},
    pseudos: {},
    attributes: {},
    values: {},
};


// export const PUBLISH = {
//     DeltaPath: "",
//     DeltaContent: "",
//     FinalMessage: "",
//     FinalError: "",
//     ErrorCount: 0,
//     WarningCount: 0,
//     Report: {
//         library: "",
//         variables: "",
//         hashrule: "",
//         targets: "",
//         errors: "",
//         memChart: "",
//         footer: "",
//     },
//     MANIFEST: {
//         prefix: "",
//         constants: [],
//         hashrules: {},
//         file: {},
//         local: {},
//         global: {},
//         axiom: {},
//         cluster: {},
//         xtyling: {},
//         binding: {},
//     },
//     LibFilesTemp: {},
// };

// export const CACHE = {
//     HashRule: {},
//     SortedIndexes: [],
//     PortableEssentials: [],
//     Index2StylesObject: {},
//     NativeStyle2Index: {},
//     LibraryStyle2Index: {},
//     GlobalsStyle2Index: {},
//     PortableStyle2Index: {},
//     FinalStack: {},
// };

// export const STACK = {
//     PROXYCACHE: {},
//     LIBRARIES: {},
//     PORTABLES: {},
// };

// export const RAW = {
//     WATCH: false,
//     PACKAGE: "",
//     VERSION: "",
//     CMD: "",
//     ARG: "",
//     ReadMe: "",
//     CSSIndex: "",
//     RootPath: "",
//     WorkPath: "",
//     HASHRULE: {},
//     PROXYMAP: {},
//     LIBRARIES: {},
//     PORTABLES: {},
//     PROXYFILES: {},
//     PORTABLEFRAME: {},
//     DEPENDENCIES: {},
// };
