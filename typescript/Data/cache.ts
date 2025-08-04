import {
    t_Data_APP,
    t_Data_PREFIX,
    t_Data_Source,
    t_Data_TWEAKS,
    t_PUBLISH,
    t_RAW
} from "../types";

const domain = "xcss.io";

export const APP: t_Data_APP = {
    name: "",
    version: "",
    website: "",
    bins: [],
    vendors: [],
    URL: {
        Cdn: `https://cdn.${domain}/`,
        Worker: `https://worker.${domain}/`,
        Console: `https://console.${domain}/`,
        PrefixCdn: `https://prefix.${domain}/`,
        PackageCdn: `https://package.${domain}/`,
    },
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

export const AUTOGEN: Record<string, t_Data_Source> = {
    index: {
        path: "",
        frags: ["xtyles", "autogen", "watch", "index.css"],
        content: ``
    },
    styles: {
        path: "",
        frags: ["xtyles", "autogen", "watch", "styles.css"],
        content: ``
    },
    ignore: {
        path: "",
        frags: ["xtyles", "autogen", ".gitignore"],
        content: `watch/**\nmanifest.json`
    },
    manifest: {
        path: "",
        frags: ["xtyles", "autogen", "manifest.json"],
        content: `{}`
    },
};

export const SYNC: Record<string, Record<string, t_Data_Source>> = {
    DOCS: {
        readme: {
            title: "README",
            url: "readme.md",
            path: "",
            frags: ["readme.md"],
            content: "",
        },
        alerts: {
            title: "ALERTS",
            url: "alerts.md",
            path: "",
            frags: ["alerts.md"],
            content: "",
        },
        changelog: {
            title: "CHANGELOG",
            url: "changelog.md",
            path: "",
            frags: ["changelog.md"],
            content: "",
        },
    },
    AGREEMENT: {
        license: {
            title: "LICENSE",
            url: "agreements-txt/license.txt",
            path: "",
            frags: ["agreements", "license.txt"],
            content: "",
        },
        terms: {
            title: "TERMS & CONDITIONS",
            url: "agreements-txt/terms.txt",
            path: "",
            frags: ["agreements", "terms.txt"],
            content: "",
        },
        privacy: {
            title: "PRIVACY POLICY",
            url: "agreements-txt/privacy.txt",
            path: "agreements/privacy.txt",
            frags: ["agreements", "privacy.txt"],
            content: "",
        },
    }
};

export const NAV: Record<string, Record<string, t_Data_Source>> = {
    blueprint: {
        scaffold: {
            frags: ["blueprint", "scaffold"],
            path: "",
        },
        libraries: {
            frags: ["blueprint", "libraries"],
            path: "",
        },
        prefixes: {
            frags: ["blueprint", "prefixes.json"],
            path: "",
        },
    },
    folder: {
        setup: {
            frags: ["xtyles"],
            path: "",
        },
        autogen: {
            frags: ["xtyles", "autogen"],
            path: "",
        },
        library: {
            frags: ["xtyles", "library"],
            path: "",
        },
        packages: {
            frags: ["xtyles", "packages"],
            path: "",
        },
        archives: {
            frags: ["xtyles", "autogen", "archives"],
            path: "",
        },
    },
    css: {
        atrules: {
            frags: ["xtyles", "#at-rules.css"],
            path: "",
        },
        constants: {
            frags: ["xtyles", "#constants.css"],
            path: "",
        },
        elements: {
            frags: ["xtyles", "#elements.css"],
            path: "",
        },
        extends: {
            frags: ["xtyles", "#extends.css"],
            path: "",
        },
    },
    json: {
        configure: {
            frags: ["xtyles", "configure.jsonc"],
            path: "",
        },
        hashrules: {
            frags: ["xtyles", "/hashrules.jsonc"],
            path: "",
        },
    },
    md: {
        instructions: {
            frags: ["xtyles", "instructions.md"],
            path: "",
        },
        readme: {
            frags: ["xtyles", "readme.md"],
            path: "",
        },
    },
};

export const PREFIX: t_Data_PREFIX = {
    atrules: {},
    pseudos: {},
    attributes: {},
    values: {},
};

export const TWEAKS: t_Data_TWEAKS = {
    ...APP.defaultTweaks
};


export const PUBLISH: t_PUBLISH = {
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

export const RAW: t_RAW = {
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
