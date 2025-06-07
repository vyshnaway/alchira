import $ from './Shell/index.js';
import { NAV, DATA } from "./data-meta.js";
import fileman from "../interface/fileman.js";
import * as worker from "../interface/worker.js";
import { PROXY } from "./data-cache.js";
import ClassRefers from './class-refers.js';

export async function VerifySetupStruct() {
    const result = { unstart: true, proceed: false, report: "" };

    if (fileman.path.ifFolder(NAV.folder.setup)) {
        const errors = {};
        await fileman.clone.safe(NAV.scaffold.setup, NAV.folder.setup);

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

export async function VerifyProxyMap() {
    $.TASK("Initializing configs", 0);
    const errors = [], alerts = [];

    $.STEP("PATH : " + NAV.json.proxymap);
    const proxyMap = await fileman.read.json(NAV.json.proxymap);
    if (proxyMap.status) {
        DATA.PROXYMAP = proxyMap.data;
        const results = await worker.proxyMapDependency(proxyMap.data, NAV.folder.setup);
        errors.push(...results.warnings);
    } else { errors.push(`${NAV.json.proxymap} : Bad json file.`); }

    $.TASK("Initialization finished")
    return {
        status: Object.keys(errors).length === 0,
        report: Object.keys(errors).length === 0 ?
            $.MOLD.success.Footer("Configs Healthy", alerts, $.list.success.Bullets) :
            $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Bullets)
    }
}

export async function UpdateLibrary() {
    ClassRefers.ClearStash();
    $.TASK("Updating Library");
    DATA.LIBRARY = await fileman.read.bulk(NAV.folder.refers, ["css"]);
}

export async function UpdateProxies() {
    $.TASK("Syncing proxy folders", 0);
    Object.keys(PROXY.FILES).forEach(key => delete PROXY.FILES[key])
    const proxies = await worker.proxyMapSync(DATA.PROXYMAP);
    proxies.forEach(proxy => PROXY.FILES[DATA.WorkPath + "/" + proxy.target] = proxy);
    $.TASK("Reading target folders");
}

export async function FetchIndexContent() {
    $.TASK("Loading Axiom");
    DATA.CSSIndex = await worker.cssImport(Object.values(NAV.css));
}

export async function AnalyzeShorthands() {
    $.TASK("Updating shorthands", 0);
    const errors = [];

    $.STEP("PATH : " + NAV.json.shorthand);
    const shorthand = await fileman.read.json(NAV.json.shorthand);
    if (shorthand.status) {
        Object.entries(shorthand.data).forEach(([key, value]) => {
            if (typeof value === "string") { DATA.SHORTHAND = shorthand.data; }
            else { errors.push(`Shorthand: ${key} does not have a value of type STRING.`) }
        })
    }
    else { errors.push(`${NAV.json.shorthand} : Bad json file.`); };
    $.TASK("Analysis comnplete")
    return {
        status: Object.keys(errors).length === 0,
        report: $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Bullets)
    }
}