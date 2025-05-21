import $ from './Shell/index.js';
import { NAV, DATA } from "./metadata.js";
import { ProxyTargets } from "./craftsmen.js";
import fileman from "../interface/fileman.js";
import * as watcher from "../interface/watcher.js";

export async function Step0_VerifySetupStructure() {
    const result = { unstart: true, proceed: false, report: "" };

    if (fileman.path.ifFolder(NAV.folder.setup)) {
        const errors = {};
        $.TASK("Verifying directory status", 0)
        for (const item of Object.values(NAV.css)) {
            $.STEP("Path : " + item);
            if (!fileman.path.ifFile(item)) { errors[item] = "File not found."; }
        }
        for (const item of Object.values(NAV.json)) {
            $.STEP("Path : " + item);
            if (!fileman.path.ifFile(item)) { errors[item] = "File not found."; }
        }
        $.TASK("Verification finished")

        result.unstart = false;
        result.proceed = Object.keys(errors).length === 0;
        result.report = (Object.keys(errors).length === 0) ?
            $.MOLD.success.Footer("Setup Healthy") :
            $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Props)
    } else {
        result.report = $.MOLD.warning.Footer("XCSS is not yet initialized in directory.",
            [`Use "init" command to initialize.`], $.list.warning.Bullets)
    }

    return result
}

export async function Step1_VerifySetupConfigs() {
    $.TASK("Initializing configs", 0);
    const errors = [], alerts = [];
    await fileman.clone.safe(NAV.scaffold.setup, NAV.folder.setup);

    $.STEP("PATH : " + NAV.json.proxymap);
    const proxyMap = await fileman.read.json(NAV.json.proxymap);
    if (proxyMap.status) {
        DATA.PROXYMAP = proxyMap.data;
        const results = await watcher.proxyMapDependency(proxyMap.data, NAV.folder.setup);
        errors.push(...results.warnings);
    } else { errors.push(`${NAV.json.proxymap} : Bad json file.`); }

    $.STEP("PATH : " + NAV.json.shorthand);
    const shorthand = await fileman.read.json(NAV.json.shorthand);
    if (shorthand.status) { DATA.SHORTHAND = shorthand.data; }
    else { errors.push(`${NAV.json.shorthand} : Bad json file.`); };

    $.TASK("Initialization finished")
    return {
        status: Object.keys(errors).length === 0,
        report: Object.keys(errors).length === 0 ?
            $.MOLD.success.Footer("Configs Healthy", alerts, $.list.success.Bullets) :
            $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Bullets)
    }
}

export async function Step2_UpdateSetupContent() {
    $.TASK("Reading setup folder", 0);
    DATA.CSSIndex = await watcher.cssImport(Object.values(NAV.css));
    $.TASK("Collecting library files");
    DATA.LIBRARY = await fileman.read.bulk(NAV.folder.refers, ["css"]);
    $.TASK("Reading setup finished");
}

export async function Step3_UpdateTargets() {
    $.TASK("Syncing proxy folders", 0);
    ProxyTargets.push(...(await watcher.proxyMapSync(DATA.PROXYMAP)));
    $.TASK("Reading target folders.");
}
