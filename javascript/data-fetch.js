import $ from "./Shell/index.js";
import { NAV, ROOT, APP, RAW, PREFIX } from "./data-cache.js";

import fileman from "../interface/fileman.js";
import * as worker from "../interface/worker.js";

export async function FetchDocs() {
	const readmeMd = fileman.sync.file(
		ROOT.DOCS.readme.url,
		ROOT.DOCS.readme.path,
	);
	const alertsMd = fileman.sync.file(
		ROOT.DOCS.alerts.url,
		ROOT.DOCS.alerts.path,
	);
	const license = fileman.sync.file(
		ROOT.AGREEMENT.license.url,
		ROOT.AGREEMENT.license.path,
	);
	const terms = fileman.sync.file(
		ROOT.AGREEMENT.terms.url,
		ROOT.AGREEMENT.terms.path,
	);
	const privacy = fileman.sync.file(
		ROOT.AGREEMENT.privacy.url,
		ROOT.AGREEMENT.privacy.path,
	);

	ROOT.DOCS.readme.content = await readmeMd;
	ROOT.DOCS.alerts.content = await alertsMd;
	ROOT.AGREEMENT.license.content = await license;
	ROOT.AGREEMENT.terms.content = await terms;
	ROOT.AGREEMENT.privacy.content = await privacy;
}

export async function FetchStatics() {
	$.TASK("Saving guidelines.", 0);
	RAW.ReadMe = (await fileman.read.file(NAV.md.instructions)).data;

	const manifestIgnore = (await fileman.read.file(NAV.file.manifestIgnore)).data.split("\n")
	if (!(manifestIgnore).includes("manifest.json")) manifestIgnore.push("manifest.json")
	await fileman.write.file(NAV.file.manifestIgnore, manifestIgnore.join("\n"))

	$.TASK("Loading vendor-prefixes");
	const PrefixRead = {
		attributes: {},
		values: {},
		atrules: {},
		classes: {},
		elements: {},
		clrprops: [],
	};

	await Promise.all(
		Object.entries(ROOT.PREFIX).map(async ([group, source]) => {
			PrefixRead[group] = await fileman.sync.json(source.url, source.path);
		}),
	);

	PREFIX.clrprops = PrefixRead.clrprops;
	PREFIX.selector = { ...PrefixRead.classes, ...PrefixRead.elements };
	PREFIX.attributes = PrefixRead.attributes;
	PREFIX.atRule = PrefixRead.atrules;
	PREFIX.values = PrefixRead.values;
}

export async function Initialize() {
	try {
		$.TASK("Initializing XCSS setup.", 0);
		$.TASK("Cloning scaffold to Project");

		await fileman.clone.safe(NAV.blueprint.scaffold, NAV.folder.setup);
		await fileman.clone.safe(NAV.blueprint.libraries, NAV.folder.library);

		$.POST(
			$.MOLD.std.Section(
				"Next Steps",
				[
					"Adjust " +
					$.style.bold.Orange(NAV.json.configure) +
					$.canvas.unstyle +
					" according to the requirements of your project.",
					"Execute " +
					$.style.bold.Orange('"init"') +
					$.canvas.unstyle +
					" again to generate the necessary configuration folders.",
					"During execution " +
					$.style.bold.Orange("{target}") +
					$.canvas.unstyle +
					" folder will be cloned from " +
					$.style.bold.Orange("{source}") +
					$.canvas.unstyle +
					" folder.",
					"This folder will act as proxy for " + APP.name + ".",
					"In the " +
					$.style.bold.Orange("{target}/{stylesheet}") +
					$.canvas.unstyle +
					", content from " +
					$.style.bold.Orange("{target}/{stylesheet}") +
					$.canvas.unstyle +
					" will be appended.",
				],
				$.list.std.Bullets,
			),
		);

		$.POST(
			$.MOLD.std.Section(
				"Available Commands",
				APP.commandList,
				$.list.std.Props,
			),
		);
		$.POST(
			$.MOLD.std.Section(
				"Publish command instructions.",
				APP.version === "0"
					? ["This command uses an internet connection."]
					: [
						"Create a new project and use its access key. For action visit " +
						$.style.bold.Orange(ROOT.console),
						"For personal projects, you can use the key in " +
						$.style.bold.Orange(NAV.json.configure),
						"If using in CI/CD workflow, it is suggested to use " +
						$.style.bold.Orange("xcss publish {key}"),
					],
				$.list.std.Bullets,
			),
		);

		return $.MOLD.success.Footer("Initialized directory");
	} catch (err) {
		return $.MOLD.failed.Footer(
			"Initialization failed.",
			[err.message],
			$.list.failed.Bullets,
		);
	}
}

export async function VerifySetupStruct() {
	const result = { unstart: true, proceed: false, report: "" };

	if (fileman.path.ifFolder(NAV.folder.setup)) {
		const errors = {};
		await fileman.clone.safe(NAV.blueprint.scaffold, NAV.folder.setup);

		$.TASK("Verifying directory status", 0);
		for (const item of Object.values(NAV.css)) {
			$.STEP("Path : " + item);
			if (!fileman.path.ifFile(item)) {
				errors[item] = "File not found.";
			}
		}
		for (const item of Object.values(NAV.json)) {
			$.STEP("Path : " + item);
			if (!fileman.path.ifFile(item)) {
				errors[item] = "File not found.";
			}
		}
		$.TASK("Verification finished");

		result.unstart = false;
		result.proceed = Object.keys(errors).length === 0;
		result.report =
			Object.keys(errors).length === 0
				? $.MOLD.success.Footer("Setup Healthy")
				: $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Props);
	} else {
		result.report = $.MOLD.warning.Footer(
			"XCSS is not yet initialized in directory.",
			[`Use "init" command to initialize.`],
			$.list.warning.Bullets,
		);
	}

	return result;
}

export async function VerifyConfigure() {
	$.TASK("Initializing configs", 0);
	const errors = [],
		alerts = [];

	$.STEP("PATH : " + NAV.json.configure);
	const proxyMap = await fileman.read.json(NAV.json.configure);
	if (proxyMap.status) {
		RAW.PROXYMAP = (typeof proxyMap.data.proxy === "object") ? proxyMap.data.proxy : [];
		const dependencies = (typeof proxyMap.data["portables"] === "object") ? proxyMap.data["portables"] : {};

		delete proxyMap.data.proxy;
		delete proxyMap.data["portables"];
		Object.assign(RAW.PORTABLEFRAME, proxyMap.data);
		RAW.PORTABLEFRAME.name = RAW.PACKAGE = RAW.PORTABLEFRAME.name || RAW.PACKAGE || "xtyle";
		RAW.PORTABLEFRAME.versionn = RAW.VERSION = RAW.PORTABLEFRAME.version || RAW.VERSION || '0.0.0';

		RAW.DEPENDENCIES = Object.entries(dependencies).reduce((a, [k, v]) => {
			if (typeof v === "string") a[k] = v;
			return a;
		}, {})
		const results = await worker.proxyMapDependency(RAW.PROXYMAP, NAV.folder.setup);
		errors.push(...results.warnings);
	} else {
		errors.push(`${NAV.json.configure} : Bad json file.`);
	}

	$.TASK("Initialization finished");
	return {
		status: Object.keys(errors).length === 0,
		report: Object.keys(errors).length === 0
			? $.MOLD.success.Footer("Configs Healthy", alerts, $.list.success.Bullets,)
			: $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Bullets),
	};
}

export async function ReloadLibrary() {
	$.TASK("Updating Library");
	RAW.LIBRARIES = await fileman.read.bulk(NAV.folder.library, ["css"]);
	RAW.PORTABLES = await fileman.read.bulk(NAV.folder.portables, ["css", "xcss", "md"]);
}

export async function UpdateProxies() {
	$.TASK("Syncing proxy folders", 0);
	Object.keys(RAW.PROXYFILES).forEach((key) => delete RAW.PROXYFILES[key]);
	const proxies = await worker.proxyMapSync(RAW.PROXYMAP);
	proxies.forEach(
		(proxy) => (RAW.PROXYFILES[RAW.WorkPath + proxy.target] = proxy),
	);
	$.TASK("Reading target folders");
}

export async function AnalyzeHashrules() {
	$.TASK("Updating Hashrules", 0);
	const errors = [];

	$.STEP("PATH : " + NAV.json.hashrules);
	const hashrule = await fileman.read.json(NAV.json.hashrules);
	Object.keys(RAW.HASHRULE).forEach(key => delete RAW.HASHRULE[key])
	if (hashrule.status) {
		Object.entries(hashrule.data).forEach(([key, value]) => {
			if (typeof value === "string") {
				RAW.HASHRULE[key] = value;
			} else {
				errors.push(`Hashrule: ${key} does not have a value of type STRING.`);
			}
		});
	} else {
		errors.push(`${NAV.json.hashrules} : Bad json file.`);
	}
	$.TASK("Analysis comnplete");
	return {
		status: Object.keys(errors).length === 0,
		report: $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Bullets),
	};
}

export async function FetchIndexContent() {
	$.TASK("Updating Index");
	RAW.CSSIndex = await worker.cssImport(Object.values(NAV.css));
}
