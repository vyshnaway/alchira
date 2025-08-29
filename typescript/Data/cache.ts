// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";


const domain = "xcss.io";

export const ROOT: _Cache.ROOT = {
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
    Commands: {
        init: "Initiate or Update & Verify setup.",
        debug: "Live build for developer environment",
        preview: 'Test build. Pass test for "publish" command.',
        publish: "Optimized build, uses web-api.",
        archive: "Split and stash project styles to *.xcss files.",
        install: "Install packages from sources.",
    },
    defaultTweaks: {
        IntelGroup: "browser",
        RapidSense: true,
        Shorthands: true,
        ShowReport: true,
        CacheUsage: true,
    },
    customElements: {
        style: "style",
        staple: "staple",
        stencil: "stencil",
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

export const STATIC: _Cache.STATIC = {
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
    Archive: {
        name: '',
        version: '',
        readme: '',
    },
    Prefix: {
        atrules: {},
        attributes: {},
        pseudos: {},
        classes: {},
        elements: {},
        values: {},
    },
    Tweaks: {
        ...ROOT.defaultTweaks
    },
    Library_Saved: {},
    Targets_Saved: {},
    Package_Saved: {},
};

export const DELTA: _Cache.DELTA = {
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
        elements: Object.values(ROOT.customElements),
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

export const CLASS: _Cache.CLASS = {
    HashRule: {},
    Index_to_Data: {},
    Global__Index: {},
    Public__Index: {},
    Archive_Index: {},
    Arcbind_Index: {},
    Library_Index: {},
    Package_Index: {},
    Sync_PublishIndexMap: {},
    Sync_ClassDictionary: {}
};

export const FILES: _Cache.FILES = {
    LIBRARIES: {},
    PACKAGES: {},
    TARGET: {}
};



// --- Path Declare --- 

export const SYNC: Record<string, Record<string, _File.Sync>> = {
    MARKDOWN: {
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
            path: "",
            frags: ["agreements", "privacy.txt"],
            content: "",
        },
    }
};

export const PATH: Record<string, Record<string, _File.Path>> = {
    blueprint: {
        archive: {
            frags: ["blueprint", "archive"],
            path: "",
            content: "",
            essential: true,
        },
        libraries: {
            frags: ["blueprint", "libraries"],
            path: "",
            content: "",
            essential: true,
        },
        scaffold: {
            frags: ["blueprint", "scaffold"],
            path: "",
            content: "",
            essential: true,
        },
        prefixes: {
            frags: ["blueprint", "prefixes.json"],
            path: "",
            content: "",
            essential: true,
        },
    },
    folder: {
        setup: {
            frags: ["xtyles"],
            path: "",
            content: "",
            essential: true,
        },
        autogen: {
            frags: ["xtyles", "autogen"],
            path: "",
            content: "",
            essential: false,
        },
        libraries: {
            frags: ["xtyles", "libraries"],
            path: "",
            content: "",
            essential: true,
        },
        packages: {
            frags: ["xtyles", "packages"],
            path: "",
            content: "",
            essential: true,
        },
        archive: {
            frags: ["xtyles", "archive"],
            path: "",
            content: "",
            essential: false,
        },
    },
    css: {
        atrules: {
            frags: ["xtyles", "#at-rules.css"],
            path: "",
            content: "",
            essential: true,
        },
        constants: {
            frags: ["xtyles", "#constants.css"],
            path: "",
            content: "",
            essential: true,
        },
        elements: {
            frags: ["xtyles", "#elements.css"],
            path: "",
            content: "",
            essential: true,
        },
        extends: {
            frags: ["xtyles", "#extends.css"],
            path: "",
            content: "",
            essential: true,
        },
    },
    json: {
        configure: {
            frags: ["xtyles", "configure.jsonc"],
            path: "",
            content: "",
            essential: true,
        },
        hashrules: {
            frags: ["xtyles", "hashrules.jsonc"],
            path: "",
            content: "",
            essential: true,
        },
    },
    md: {
        readme: {
            frags: ["xtyles", "readme.md"],
            path: "",
            content: "",
            essential: true,
        },
        reference: {
            frags: ["xtyles", "reference.md"],
            path: "",
            content: "",
            essential: true,
        },
    },
    autogen: {
        index: {
            path: "",
            frags: ["xtyles", "autogen", "watch", "index.css"],
            content: "",
            essential: false,
        },
        styles: {
            path: "",
            frags: ["xtyles", "autogen", "watch", "styles.css"],
            content: "",
            essential: false,
        },
        ignore: {
            path: "",
            frags: ["xtyles", "autogen", ".gitignore"],
            content: "*\n!.gitignore",
            essential: false,
        },
        manifest: {
            path: "",
            frags: ["xtyles", "autogen", "manifest.json"],
            content: JSON.stringify(DELTA.Manifest),
            essential: false,
        },
    }
};