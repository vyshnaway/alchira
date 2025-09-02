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
    url: {
        Cdn: `https://cdn.${domain}/`,
        Site: `https://www.${domain}/`,
        Worker: `https://worker.${domain}/`,
        Console: `https://console.${domain}/`,
        PrefixCdn: `https://prefix.${domain}/`,
        ArtifactCdn: `https://artifact.${domain}/`,
    },
    commands: {
        init: "Initiate or Update & Verify setup.",
        debug: "Live build for developer environment",
        preview: 'Test build. Pass test for "publish" command.',
        publish: "Optimized build, uses web-api.",
        // archive: "Split and stash project styles to *.xcss files.",
        // install: "Install external artifacts from sources.",
    },
    scripts: {
        "init": "xcss init",
        "debug": "xcss debug watch",
        "watch": "xcss preview watch",
        "preview": "xcss preview",
        "publish": "xcss publish",
        // "archive": "xcss archive",
        // "install": "xcss install",
    },
    defaultTweaks: {
        Shorthands: true,
        CacheUsage: false,
    },
    customElements: {
        style: 1,
        staple: 2,
        summon: 3,
    },
    customOperations: {
        attach: "~",
        assign: "=",
    },
    customAtrules: {
        attach: "@--attach",
        assign: "@--assign",
    }
};

export const STATIC: _Cache.STATIC = {
    WATCH: false,
    DEBUG: false,
    ProjectName: "",
    ProjectVersion: "",
    Command: "",
    Argument: "",
    RootCSS: "",
    RootPath: "",
    WorkPath: "",
    ProxyMap: [],
    HashRule: {},
    Artifact: {
        name: '',
        readme: '',
        version: '',
        shorthands: {},
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
    External_Saved: {},
};

export const DELTA: _Cache.DELTA = {
    DeltaPath: "",
    DeltaContent: "",
    FinalMessage: "",
    PublishError: "",
    ErrorCount: 0,
    Report: {
        libraries: "",
        externals: "",
        artifacts: "",
        constants: "",
        hashrules: "",
        errors: "",
        memChart: "",
        footer: "",
    },
    Lookup: {
        libraries: {},
        externals: {},
        artifacts: {},
    },
    Errors: {
        libraries: [],
        externals: [],
        artifacts: [],
        multiples: [],
    },
    Diagnostics: {
        libraries: [],
        externals: [],
        artifacts: [],
        multiples: [],
    },
    Manifest: {
        prefix: "",
        elements: Object.keys(ROOT.customElements),
        constants: [],
        diagnostics: [],
        hashrules: {},
        lookuptype: _File._Import,
        filelookup: {},
        AXIOM: {},
        CLUSTER: {},
        LOCAL: {},
        GLOBAL: {},
        EXTERNAL: {},
        EXATTACH: {},
    },
};

export const CLASS: _Cache.CLASS = {
    HashRule: {},
    Index_to_Data: {},
    Global___Index: {},
    Public___Index: {},
    Library__Index: {},
    External_Index: {},
    Artifact_Index: {},
    Arattach_Index: {},
    Sync_PublishIndexMap: {},
    Sync_ClassDictionary: {}
};

export const FILES: _Cache.FILES = {
    LIBRARIES: {},
    EXTERNALS: {},
    TARGETS: {}
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
        artifacts: {
            frags: ["blueprint", "artifacts"],
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
    },
    folder: {
        scaffold: {
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
        external: {
            frags: ["xtyles", "external"],
            path: "",
            content: "",
            essential: false,
        },
        artifact: {
            frags: ["xtyles", "artifact"],
            path: "",
            content: "",
            essential: false,
        },
        libraries: {
            frags: ["xtyles", "libraries"],
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
            essential: false,
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
        staple: {
            path: "",
            frags: ["xtyles", "autogen", "watch", "staple.htm"],
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