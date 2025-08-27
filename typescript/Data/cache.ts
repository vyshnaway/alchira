import * as TYPE from "../types.js";

const domain = "xcss.io";

export const _ROOT: TYPE.Data_ROOT = {
    bin: "",
    name: "xcss-engine",
    version: "0.0.0",
    website: domain,
    vendors: [],
    URL: {
        Cdn: `https://cdn.${domain}/`,
        Site: `https://www.${domain}/`,
        Worker: `https://worker.${domain}/`,
        Console: `https://console.${domain}/`,
        PrefixCdn: `https://prefix.${domain}/`,
        PackageCdn: `https://package.${domain}/`,
    },
    commandList: {
        init: "Initiate or Update & Verify setup.",
        debug: "Live build for developer environment",
        preview: 'Test build. Pass test for "publish" command.',
        publish: "Optimized build, uses web-api.",
        archive: "Split and stash project styles to *.xcss files.",
        install: "Install packages from sources.",
    },
    exposedCommands: [
        "init",
        "debug",
        "preview",
        "publish",
        "archive",
        "install",
    ],
    defaultTweaks: {
        RapidSense: true,
        Shorthands: true,
        IntelGroup: "browser"
    },
    customElements: {
        style: "xtyle",
        staple: "xtaple",
        stencil: "xtencil",
    },
    customOperations: {
        attach: "~",
        assemble: "=",
    },
    customAtrules: {
        attach: "@--attach",
        assemble: "@--assemble",
    }
};

export const _PREFIX: TYPE.Data_PREFIX = {
    atrules: {},
    attributes: {},
    pseudos: {},
    classes: {},
    elements: {},
    values: {},
};

export const _TWEAKS: TYPE.Data_TWEAKS = {
    ..._ROOT.defaultTweaks
};



// --- Cache Declare ---

export const LIVEDOCS: TYPE.CACHE_LIVEDOCS = {
    DeltaPath: "",
    DeltaContent: "",
    FinalMessage: "",
    PublishError: "",
    ErrorCount: 0,
    Report: {
        library: "",
        package: "",
        project: "",
        constants: "",
        hashrule: "",
        errors: "",
        memChart: "",
        footer: "",
    },
    Lookup: {
        library: {},
        package: {},
        project: {},
    },
    Errors: {
        library: [],
        package: [],
        project: []
    },
    Diagnostics: {
        library: [],
        project: [],
        package: []
    },
    Manifest: {
        prefix: "",
        elements: Object.values(_ROOT.customElements),
        constants: [],
        hashrules: {},
        file: {},
        AXIOM: {},
        CLUSTER: {},
        LOCAL: {},
        GLOBAL: {},
        PACKAGE: {},
        PACBIND: {},
        errors: []
    },
};


export const STATIC: TYPE.CACHE_STATIC = {
    WATCH: false,
    DEBUG: false,
    Project_Name: "",
    Project_Version: "",
    Command: "",
    Argument: "",
    RootCSS: "",
    RootPath: "",
    WorkPath: "",
    ProxyMap: [],
    HashRule: {},
    Package: {
        Name: '',
        Version: '',
        Readme: '',
    },
    Library_Saved: {},
    TargeAS_Saved: {},
    Package_Saved: {},
};

export const DYNAMIC: TYPE.CACHE_DYNAMIC = {
    HashRule: {},
    Index_ClassData: {},
    GlobalClass__Index: {},
    PublicClass__Index: {},
    ArchiveClass_Index: {},
    ArcbindClass_Index: {},
    LibraryClass_Index: {},
    PackageClass_Index: {},
    Sync_PublishIndexMap: {},
    Sync_ClassDictionary: {}
};

export const STORAGE: TYPE.CACHE_STORAGE = {
    LIBRARIES: {},
    PACKAGES: {},
    TARGET: {}
};



// --- Path Declare --- 

export const _SYNC: Record<string, Record<string, TYPE.Data_Source>> = {
    MARKDOWN: {
        readme: {
            title: "README",
            url: "readme.md",
            path: "",
            content: "",
            frags: ["readme.md"],
        },
        alerts: {
            title: "ALERTS",
            url: "alerts.md",
            path: "",
            content: "",
            frags: ["alerts.md"],
        },
        changelog: {
            title: "CHANGELOG",
            url: "changelog.md",
            path: "",
            content: "",
            frags: ["changelog.md"],
        },
    },
    AGREEMENT: {
        license: {
            title: "LICENSE",
            url: "agreements-txt/license.txt",
            path: "",
            content: "",
            frags: ["agreements", "license.txt"],
        },
        terms: {
            title: "TERMS & CONDITIONS",
            url: "agreements-txt/terms.txt",
            path: "",
            content: "",
            frags: ["agreements", "terms.txt"],
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

export const _PATH: Record<string, Record<string, TYPE.Data_Source>> = {
    blueprint: {
        archive: {
            frags: ["blueprint", "archive"],
            path: "",
            content: "",
        },
        libraries: {
            frags: ["blueprint", "libraries"],
            path: "",
            content: "",
        },
        scaffold: {
            frags: ["blueprint", "scaffold"],
            path: "",
            content: "",
        },
        prefixes: {
            frags: ["blueprint", "prefixes.json"],
            path: "",
            content: "",
        },
    },
    folder: {
        setup: {
            frags: ["xtyles"],
            path: "",
            content: "",
        },
        autogen: {
            frags: ["xtyles", "autogen"],
            path: "",
            content: "",
        },
        libraries: {
            frags: ["xtyles", "libraries"],
            path: "",
            content: "",
        },
        packages: {
            frags: ["xtyles", "packages"],
            path: "",
            content: "",
        },
        archive: {
            frags: ["xtyles", "archive"],
            path: "",
            content: "",
        },
    },
    css: {
        atrules: {
            frags: ["xtyles", "#at-rules.css"],
            path: "",
            content: "",
        },
        constants: {
            frags: ["xtyles", "#constants.css"],
            path: "",
            content: "",
        },
        elements: {
            frags: ["xtyles", "#elements.css"],
            path: "",
            content: "",
        },
        extends: {
            frags: ["xtyles", "#extends.css"],
            path: "",
            content: "",
        },
    },
    json: {
        configure: {
            frags: ["xtyles", "configure.jsonc"],
            path: "",
            content: "",
        },
        hashrules: {
            frags: ["xtyles", "hashrules.jsonc"],
            path: "",
            content: "",
        },
    },
    md: {
        readme: {
            frags: ["xtyles", "readme.md"],
            path: "",
            content: "",
        },
        reference: {
            frags: ["xtyles", "reference.md"],
            path: "",
            content: "",
        },
    },
    autogen: {
        index: {
            path: "",
            frags: ["xtyles", "autogen", "watch", "index.css"],
            content: "",
        },
        styles: {
            path: "",
            frags: ["xtyles", "autogen", "watch", "styles.css"],
            content: "",
        },
        ignore: {
            path: "",
            frags: ["xtyles", "autogen", ".gitignore"],
            content: "*\n!.gitignore"
        },
        manifest: {
            path: "",
            frags: ["xtyles", "autogen", "manifest.json"],
            content: JSON.stringify(LIVEDOCS.Manifest)
        },
    }
};