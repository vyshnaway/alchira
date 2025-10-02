// import * as _Support from "../type/support.js";
import $ from "../shell/main.js";
import FILEMAN from "../fileman.js";
import * as $$ from "../shell.js";
import * as CACHE from "./cache.js";
import * as VERIFY from "./verify.js";
import * as ACTION from "./action.js";
import fileman from "../fileman.js";
export async function FetchDocs() {
    await Promise.all(Object.values(CACHE.SYNC).map(sync => {
        Object.values(sync).map(async (s) => {
            if (s.url && s.path) {
                s.content = await FILEMAN.sync.file(s.url, s.path);
            }
        });
    }));
}
export async function Initialize() {
    try {
        $.TASK("Initializing setup.", 0);
        $.TASK("Cloning scaffold to Project");
        await FILEMAN.clone.safe(CACHE.PATH.blueprint.scaffold.path, CACHE.PATH.folder.scaffold.path);
        await FILEMAN.clone.safe(CACHE.PATH.blueprint.libraries.path, CACHE.PATH.folder.libraries.path);
        $.POST($$.ListSteps("Next Steps", [
            "Adjust " +
                $.FMT(CACHE.PATH.json.configure.path, $.style.AS_Bold, ...$.preset.primary) +
                " according to the requirements of your project.",
            "Execute " +
                $.FMT('"init"', $.style.AS_Bold, ...$.preset.primary) +
                " again to generate the necessary configuration folders.",
            "During execution " +
                $.FMT("{target}", $.style.AS_Bold, ...$.preset.primary) +
                " folder will be cloned from " +
                $.FMT("{source}", $.style.AS_Bold, ...$.preset.primary) +
                " folder.",
            "This folder will act as proxy for " + CACHE.ROOT.name + ".",
            "In the " +
                $.FMT("{target}/{stylesheet}", $.style.AS_Bold, ...$.preset.primary) +
                ", content from " +
                $.FMT("{target}/{stylesheet}", $.style.AS_Bold, ...$.preset.primary) +
                " will be appended.",
        ]));
        $.POST($$.ListRecord("Available Commands", CACHE.ROOT.commands));
        $.POST($$.ListSteps("Publish command instructions.", CACHE.ROOT.version === "0"
            ? ["This command is not activated."]
            : [
                "Create a new project and use its access key. For action visit " +
                    $.FMT(CACHE.ROOT.url.Console, $.style.AS_Bold, ...$.preset.primary),
                "If using in CI/CD workflow, it is suggested to use " +
                    $.FMT("{bin} publish {key}", $.style.AS_Bold, ...$.preset.primary),
            ]));
        await FetchDocs();
        return $.tag.H4("Initialized directory", $.preset.success, $.style.AS_Bold);
    }
    catch (err) {
        return $.MAKE($.tag.H4("Initialization failed.", $.preset.failed, $.style.AS_Bold), err instanceof Error ? [err.message] : [], [$.list.Bullets, 0, $.preset.failed]);
    }
}
export async function VerifySetupStruct() {
    const result = { started: false, proceed: false, report: "" };
    if (FILEMAN.path.ifFolder(CACHE.PATH.folder.scaffold.path)) {
        const errors = {};
        await FILEMAN.write.file(CACHE.PATH.md.reference.path, CACHE.SYNC.MARKDOWN.readme.content);
        await FILEMAN.write.file(CACHE.PATH.md.guildelines.path, CACHE.SYNC.MARKDOWN.guildelines.content);
        await FILEMAN.clone.safe(CACHE.PATH.blueprint.scaffold.path, CACHE.PATH.folder.scaffold.path);
        $.TASK("Verifying directory status", 0);
        Object.entries(CACHE.PATH).forEach(([K, V]) => Object.entries(V).forEach(([_, v]) => {
            if (v.essential && (K === "folder" ? !FILEMAN.path.ifFolder(v.path) : !FILEMAN.path.ifFile(v.path)) && (K !== "blueprint")) {
                $.STEP("Path : " + v.path);
                errors[v.path] = "Path not found.";
            }
        }));
        $.TASK("Verification finished");
        // Shell.js refactored till here >>>
        result.started = true;
        result.proceed = Object.keys(errors).length === 0;
        result.report =
            Object.keys(errors).length === 0
                ? $.MAKE($.tag.H4("Setup Healthy", $.preset.success, $.style.AS_Bold))
                : $.MAKE($.tag.H4("Error Paths", $.preset.failed), $$.ListProps(errors), [$.list.Bullets, 0, $.preset.failed]);
    }
    else {
        result.report = $.MAKE($.tag.H4("Setup not initialized in directory.", $.preset.warning, $.style.AS_Bold), [`Use "init" command to initialize.`], [$.list.Bullets, 0, $.preset.warning]);
    }
    return result;
}
export async function SyncIgnorefiles() {
    const manifestIgnores = (await FILEMAN.read.file(CACHE.PATH.autogen.ignore.path)).data.split("\n");
    const modPts = (CACHE.PATH.autogen.ignore.content.split("\n") || []).reduce((modPts, ign) => {
        if (!manifestIgnores.includes(ign)) {
            manifestIgnores.push(ign);
            modPts++;
        }
        return modPts;
    }, 0);
    if (modPts) {
        await FILEMAN.write.file(CACHE.PATH.autogen.ignore.path, manifestIgnores.join("\n"));
    }
}
export async function FetchStatics(vendorSource) {
    $.TASK("Loading vendor-prefixes");
    const PrefixObtained = await (async function () {
        const result1 = await FILEMAN.read.json(vendorSource, true);
        if (result1.status) {
            return result1.data;
        }
        ;
        const result2 = await FILEMAN.read.json(CACHE.ROOT.url.Prefixes + vendorSource, true);
        if (result2.status) {
            return result2.data;
        }
        ;
        const result3 = await FILEMAN.read.json(CACHE.PATH.blueprint.prefixes.path, false);
        if (result3.status) {
            return result3.data;
        }
        ;
        return {};
    })();
    await FILEMAN.write.json(CACHE.PATH.blueprint.prefixes.path, PrefixObtained);
    const PrefixRead = {
        attributes: {},
        pseudos: {},
        values: {},
        atrules: {},
        classes: {},
        elements: {}
    };
    for (const key in PrefixRead) {
        const typedKey = key;
        const valueFromObtained = PrefixObtained[typedKey];
        if (typedKey === 'values') {
            PrefixRead[typedKey] = valueFromObtained;
        }
        else {
            PrefixRead[typedKey] = valueFromObtained;
        }
    }
    CACHE.STATIC.Prefix.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
    CACHE.STATIC.Prefix.attributes = { ...PrefixRead.attributes };
    CACHE.STATIC.Prefix.atrules = { ...PrefixRead.atrules };
    CACHE.STATIC.Prefix.values = { ...PrefixRead.values };
    ACTION.setVendors();
}
function fixPath(string) {
    return fileman.path.join(...string.replace(/\\/, "/").split("/"));
}
export async function VerifyConfigs(loadStatics) {
    $.TASK("Initializing configs", 0);
    const errors = [];
    $.STEP("PATH : " + CACHE.PATH.json.configure.path);
    const config = await FILEMAN.read.json(CACHE.PATH.json.configure.path);
    if (config.status) {
        const CONFIG = config.data;
        if (loadStatics) {
            await FetchStatics(CONFIG.vendors);
        }
        ACTION.setTWEAKS(CONFIG.tweaks);
        CACHE.STATIC.ProxyMap = Array.isArray(CONFIG.proxymap) ? CONFIG.proxymap.reduce((A, I) => {
            if (typeof I === "object"
                && typeof I.source === "string"
                && typeof I.target === "string"
                && typeof I.stylesheet === "string"
                && typeof I.extensions === "object"
                && I.source !== ""
                && I.target !== ""
                && I.stylesheet !== ""
                && Object.keys(I.extensions).length !== 0) {
                Object.entries(I.extensions).forEach(([K, V]) => {
                    if (Array.isArray(V)) {
                        I.extensions[K] = V.filter(e => typeof e === "string");
                    }
                    else {
                        I.extensions[K] = [];
                    }
                });
                I.source = fixPath(I.source);
                I.target = fixPath(I.target);
                I.stylesheet = fixPath(I.stylesheet);
                A.push(I);
            }
            return A;
        }, []) : [];
        if (CACHE.STATIC.ProxyMap.length === 0) {
            errors.push($.tag.Li(CACHE.PATH.json.configure.path + ": Workable proxies unavailable."));
        }
        Object.assign(CACHE.STATIC.Archive, config.data);
        CACHE.STATIC.Archive.name = CACHE.STATIC.Archive.name = CONFIG.name || CACHE.STATIC.ProjectName;
        CACHE.STATIC.Archive.version = CACHE.STATIC.Archive.version = CONFIG.version || CACHE.STATIC.ProjectVersion;
        CACHE.STATIC.Archive.readme = (await FILEMAN.read.file(CACHE.PATH.md.readme.path)).data;
        CACHE.STATIC.Archive.licence = (await FILEMAN.read.file(CACHE.PATH.md.licence.path)).data;
        CACHE.STATIC.Artifacts_Saved = Object.entries((typeof CONFIG.artifacts === "object") ? CONFIG.artifacts : {})
            .reduce((a, [k, v]) => {
            if (typeof v === "string" && v !== '-') {
                a[k] = v;
            }
            return a;
        }, {});
        const results = await VERIFY.proxyMapDependency(CACHE.STATIC.ProxyMap, CACHE.PATH.folder.scaffold.path);
        errors.push(...results.warnings);
    }
    else {
        errors.push(`${CACHE.PATH.json.configure.path} : Bad json file.`);
    }
    $.TASK("Initialization finished");
    return {
        status: Object.keys(errors).length === 0,
        report: $.MAKE(Object.keys(errors).length === 0
            ? $.tag.H4("Configs Healthy", $.preset.success, $.style.AS_Bold)
            : $.tag.H4("Error Paths: " + CACHE.PATH.json.configure.path, $.preset.failed, $.style.AS_Bold), errors, [$.list.Bullets, 0, $.preset.warning])
    };
}
export async function SaveRootCss() {
    $.TASK("Updating Index");
    CACHE.STATIC.RootCSS = await VERIFY.cssImport(Object.values(CACHE.PATH.css).map(css => css.path));
}
export async function SaveLibraries() {
    $.TASK("Updating Library");
    CACHE.STATIC.Libraries_Saved = await FILEMAN.read.bulk(CACHE.PATH.folder.libraries.path, ["css"]);
}
export async function SaveExternals() {
    $.TASK("Updating External Artifacts");
    CACHE.STATIC.Artifacts_Saved = await FILEMAN.read.bulk(CACHE.PATH.folder.artifacts.path, [CACHE.ROOT.extension, "css", "md"]);
}
export async function SaveTargets() {
    $.TASK("Syncing proxy folders", 0);
    Object.keys(CACHE.STATIC.Targetdir_Saved).forEach((key) => delete CACHE.STATIC.Targetdir_Saved[key]);
    CACHE.STATIC.Targetdir_Saved = await VERIFY.proxyMapSync(CACHE.STATIC.ProxyMap);
}
export async function SaveHashrule() {
    $.TASK("Updating Hashrule", 0);
    const errors = {};
    $.STEP("PATH : " + CACHE.PATH.json.hashrule.path);
    const hashrule = await FILEMAN.read.json(CACHE.PATH.json.hashrule.path);
    Object.keys(CACHE.STATIC.Hashrule).forEach(key => delete CACHE.STATIC.Hashrule[key]);
    if (hashrule.status) {
        Object.entries(hashrule.data).forEach(([key, value]) => {
            if (typeof value === "string") {
                CACHE.STATIC.Hashrule[key] = value;
            }
            else {
                errors[key] = `Value of type "STRING".`;
            }
        });
    }
    else {
        errors["ERROR"] = `Bad json file.`;
    }
    $.TASK("Analysis complete");
    return {
        status: Object.keys(errors).length === 0,
        report: $.MAKE($.tag.H4("Hashrule error: " + CACHE.PATH.json.hashrule.path, $.preset.failed), $$.ListProps(errors, $.preset.primary, $.preset.text), [$.list.Blocks, 0, $.preset.text, $.style.AS_Bold], [$.list.Bullets, 0, $.preset.failed, $.style.AS_Bold]),
    };
}
//# sourceMappingURL=fetch.js.map