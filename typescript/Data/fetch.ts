import $ from "../Shell/main.js";
import fileman from "../fileman.js";
import * as worker from "./watch.js";
import { collectTWEAKS, collectVendors } from "./init.js";
import { t_Config, t_Data_PREFIX } from "../types.js";
import { NAV, SYNC, APP, RAW, PREFIX, CACHE } from "./cache.js";

export async function FetchDocs() {
	await Promise.all(Object.values(SYNC).map(sync => {
		Object.values(sync).map(async s => {
			if (s.url && s.path) {
				s.content = await fileman.sync.file(s.url, s.path,);
			}
		});
	}));
}

export async function FetchStatics(vendorSource: string) {

	$.TASK("Saving guidelines.", 0);
	RAW.ReadMe = (await fileman.read.file(NAV.md.instructions.path)).data;


	const manifestIgnores = (await fileman.read.file(NAV.autogen.ignore.path)).data.split("\n");
	const modPts = (NAV.autogen.ignore.content || "").split("\n").reduce((modPts: number, ign) => {
		if (!manifestIgnores.includes(ign)) {
			manifestIgnores.push(ign);
			modPts++;
		}
		return modPts;
	}, 0);
	if (modPts) { await fileman.write.file(NAV.autogen.ignore.path, manifestIgnores.join("\n")); }


	$.TASK("Loading vendor-prefixes");

	const PrefixObtained = await (async function () {
		const result1 = await fileman.read.json(vendorSource, true);
		if (result1.status) { return result1.data; };

		const result2 = await fileman.read.json(APP.URL.PrefixCdn + vendorSource, true);
		if (result2.status) { return result2.data; };

		const result3 = await fileman.read.json(NAV.blueprint.prefixes.path, false);
		if (result3.status) { return result3.data; };

		return {};
	})() as t_Data_PREFIX;
	await fileman.write.json(NAV.blueprint.vendors.path, PrefixObtained);


	const PrefixRead: t_Data_PREFIX = {
		attributes: {},
		pseudos: {},
		values: {},
		atrules: {},
		classes: {},
		elements: {}
	};

	for (const key in PrefixRead) {
		const typedKey = key as keyof t_Data_PREFIX;
		const valueFromObtained = PrefixObtained[typedKey];
		if (typedKey === 'values') {
			PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, Record<string, string>>>;
		} else {
			PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, string>>;
		}
	}
	PREFIX.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
	PREFIX.attributes = { ...PrefixRead.attributes };
	PREFIX.atrules = { ...PrefixRead.atrules };
	PREFIX.values = { ...PrefixRead.values };
	collectVendors();
}

export async function Initialize() {
	try {
		$.TASK("Initializing XCSS setup.", 0);
		$.TASK("Cloning scaffold to Project");

		await fileman.clone.safe(NAV.blueprint.scaffold.path, NAV.folder.setup.path);
		await fileman.clone.safe(NAV.blueprint.libraries.path, NAV.folder.library.path);

		$.POST(
			$.MOLD.std.Section(
				"Next Steps",
				[
					"Adjust " +
					$.style.bold.Orange(NAV.json.configure.path) +
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

		const commandList = Object.entries(APP.commandList).map(([k, v]) => $.list.std.Level([k]) + `: ${v}`);
		$.POST(
			$.MOLD.std.Section(
				"Available Commands",
				commandList,
				$.list.std.Bullets,
			),
		);
		$.POST(
			$.MOLD.std.Section(
				"Publish command instructions.",
				APP.version === "0"
					? ["This command uses an internet connection."]
					: [
						"Create a new project and use its access key. For action visit " +
						$.style.bold.Orange(APP.URL.Console),
						"For personal projects, you can use the key in " +
						$.style.bold.Orange(NAV.json.configure.path),
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
			err instanceof Error ? [err.message] : [],
			$.list.failed.Bullets,
		);
	}
}

export async function VerifySetupStruct() {
	const result = { unstart: true, proceed: false, report: "" };

	if (fileman.path.ifFolder(NAV.folder.setup.path)) {
		const errors: Record<string, string> = {};
		await fileman.clone.safe(NAV.blueprint.scaffold.path, NAV.folder.setup.path);

		$.TASK("Verifying directory status", 0);
		for (const item of Object.values(NAV.css)) {
			const path = item.path;
			$.STEP("Path : " + path);
			if (!fileman.path.ifFile(path)) {
				errors[path] = "File not found.";
			}
		}
		for (const item of Object.values(NAV.json)) {
			const path = item.path;
			$.STEP("Path : " + path);
			if (!fileman.path.ifFile(path)) {
				errors[path] = "File not found.";
			}
		}
		$.TASK("Verification finished");

		const errSrcs = $.list.failed.Level(Object.keys(errors));
		const errList = Object.values(errors).map((err, ind) => `${errSrcs[ind]}: ${err}`);
		result.unstart = false;
		result.proceed = errSrcs.length === 0;
		result.report =
			Object.keys(errors).length === 0
				? $.MOLD.success.Footer("Setup Healthy")
				: $.MOLD.failed.Footer("Error Paths", errList, $.list.failed.Bullets);
	} else {
		result.report = $.MOLD.warning.Footer(
			"XCSS is not yet initialized in directory.",
			[`Use "init" command to initialize.`],
			$.list.warning.Bullets,
		);
	}

	return result;
}

export async function VerifyConfigure(loadStatics: boolean) {
	$.TASK("Initializing configs", 0);
	const errors: string[] = [], alerts: string[] = [];

	$.STEP("PATH : " + NAV.json.configure);
	const config = await fileman.read.json(NAV.json.configure.path);
	if (config.status) {
		const data = config.data as t_Config;
		if (loadStatics) { FetchStatics(data["vendors"]); }

		collectTWEAKS(data.tweaks);
		RAW.PROXYMAP = (Array.isArray(data.proxy)) ? data.proxy : [];

		Object.assign(CACHE.Archive, config.data);
		delete CACHE.Archive.proxy;
		delete CACHE.Archive.portables;
		delete CACHE.Archive.vendors;
		delete CACHE.Archive.tweaks;
		CACHE.Archive.name = RAW.PACKAGE = CACHE.Archive.name || RAW.PACKAGE || "xcss-archive";
		CACHE.Archive.version = RAW.VERSION = CACHE.Archive.version || RAW.VERSION || '0.0.0';

		RAW.DEPENDENTS = Object.entries((typeof data.portables === "object") ? data.portables : {})
			.reduce((a: Record<string, string>, [k, v]) => {
				if ((typeof v === "string") && (typeof k === "string")) { a[k] = v; }
				return a;
			}, {});
		const results = await worker.proxyMapDependency(RAW.PROXYMAP, NAV.folder.setup.path);
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
	RAW.LIBRARIES = await fileman.read.bulk(NAV.folder.library.path, ["css"]);
	RAW.PORTABLES = await fileman.read.bulk(NAV.folder.portables.path, ["css", "xcss", "md"]);
}

export async function UpdateProxies() {
	$.TASK("Syncing proxy folders", 0);
	Object.keys(RAW.PROXYFILES).forEach((key) => delete RAW.PROXYFILES[key]);
	await worker.proxyMapSync(RAW.PROXYMAP);
	$.TASK("Reading target folders");
}

export async function AnalyzeHashrules() {
	$.TASK("Updating Hashrules", 0);
	const errors = [];

	$.STEP("PATH : " + NAV.json.hashrules);
	const hashrule = await fileman.read.json(NAV.json.hashrules.path);
	Object.keys(RAW.HASHRULE).forEach(key => delete RAW.HASHRULE[key]);
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
	RAW.CSSIndex = await worker.cssImport(Object.values(NAV.css).map(N => N.path));
}
