import $ from "../Shell/main.js";
import fileman from "../fileman.js";
import * as $$ from "../shell.js";
import * as worker from "./watch.js";
import { collectTWEAKS, collectVendors } from "./init.js";
import { t_Config, t_Data_PREFIX, t_ProxyMap } from "../types.js";
import { NAVIGATE, DOCUMENTS, ORIGIN, CACHE_STATIC, PREFIXES } from "./cache.js";

export async function FetchDocs() {
	await Promise.all(Object.values(DOCUMENTS).map(sync => {
		Object.values(sync).map(async s => {
			if (s.url && s.path) {
				s.content = await fileman.sync.file(s.url, s.path);
			}
		});
	}));
}

export async function Initialize() {
	try {
		$.TASK("Initializing XCSS setup.", 0);
		$.TASK("Cloning scaffold to Project");

		await fileman.clone.safe(NAVIGATE.blueprint.scaffold.path, NAVIGATE.folder.setup.path);
		await fileman.clone.safe(NAVIGATE.blueprint.libraries.path, NAVIGATE.folder.libraries.path);

		$.POST(
			$.MOLD.std.Section(
				"Next Steps",
				[
					"Adjust " +
					$.MAKE(NAVIGATE.json.configure.path, $.style.TS_Bold, ...$.canvas.config.primary) +
					" according to the requirements of your project.",
					"Execute " +
					$.MAKE('"init"', $.style.TS_Bold, ...$.canvas.config.primary) +
					" again to generate the necessary configuration folders.",
					"During execution " +
					$.MAKE("{target}", $.style.TS_Bold, ...$.canvas.config.primary) +
					" folder will be cloned from " +
					$.MAKE("{source}", $.style.TS_Bold, ...$.canvas.config.primary) +
					" folder.",
					"This folder will act as proxy for " + ORIGIN.name + ".",
					"In the " +
					$.MAKE("{target}/{stylesheet}", $.style.TS_Bold, ...$.canvas.config.primary) +
					", content from " +
					$.MAKE("{target}/{stylesheet}", $.style.TS_Bold, ...$.canvas.config.primary) +
					" will be appended.",
				],
				$.list.std.Bullets,
			),
		);

		$.POST(
			$.MOLD.std.Section(
				"Available Commands",
				$$.Props.primary(ORIGIN.commandList),
				$.list.std.Bullets,
			),
		);

		$.POST(
			$.MOLD.std.Section(
				"Publish command instructions.",
				ORIGIN.version === "0"
					? ["This command uses an internet connection."]
					: [
						"Create a new project and use its access key. For action visit " +
						$.MAKE(ORIGIN.URL.Console, $.style.TS_Bold, ...$.canvas.config.primary),
						"For personal projects, you can use the key in " +
						$.MAKE(NAVIGATE.json.configure.path, $.style.TS_Bold, ...$.canvas.config.primary),
						"If using in CI/CD workflow, it is suggested to use " +
						$.MAKE("xcss publish {key}", $.style.TS_Bold, ...$.canvas.config.primary),
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
	const result = { started: false, proceed: false, report: "" };

	if (fileman.path.ifFolder(NAVIGATE.folder.setup.path)) {
		const errors: Record<string, string> = {};
		await fileman.clone.safe(NAVIGATE.blueprint.scaffold.path, NAVIGATE.folder.setup.path);

		$.TASK("Verifying directory status", 0);
		for (const item of Object.values(NAVIGATE.css)) {
			const path = item.path;
			$.STEP("Path : " + path);
			if (!fileman.path.ifFile(path)) {
				errors[path] = "File not found.";
			}
		}
		for (const item of Object.values(NAVIGATE.json)) {
			const path = item.path;
			$.STEP("Path : " + path);
			if (!fileman.path.ifFile(path)) {
				errors[path] = "File not found.";
			}
		}
		$.TASK("Verification finished");

		const errSrcs = $.list.failed.Level(Object.keys(errors));
		const errList = Object.values(errors).map((err, ind) => `${errSrcs[ind]}: ${err}`);
		result.started = true;
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

export async function FetchStatics(vendorSource: string) {

	const manifestIgnores = (await fileman.read.file(NAVIGATE.autogen.ignore.path)).data.split("\n");
	const modPts = (NAVIGATE.autogen.ignore.content || "").split("\n").reduce((modPts: number, ign) => {
		if (!manifestIgnores.includes(ign)) {
			manifestIgnores.push(ign);
			modPts++;
		}
		return modPts;
	}, 0);
	if (modPts) { await fileman.write.file(NAVIGATE.autogen.ignore.path, manifestIgnores.join("\n")); }


	$.TASK("Loading vendor-prefixes");

	const PrefixObtained = await (async function () {
		const result1 = await fileman.read.json(vendorSource, true);
		if (result1.status) { return result1.data; };

		const result2 = await fileman.read.json(ORIGIN.URL.PrefixCdn + vendorSource, true);
		if (result2.status) { return result2.data; };

		const result3 = await fileman.read.json(NAVIGATE.blueprint.prefixes.path, false);
		if (result3.status) { return result3.data; };

		return {};
	})() as t_Data_PREFIX;
	await fileman.write.json(NAVIGATE.blueprint.prefixes.path, PrefixObtained);


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
	PREFIXES.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
	PREFIXES.attributes = { ...PrefixRead.attributes };
	PREFIXES.atrules = { ...PrefixRead.atrules };
	PREFIXES.values = { ...PrefixRead.values };
	collectVendors();
}

export async function VerifyConfigure(loadStatics: boolean) {
	$.TASK("Initializing configs", 0);
	const errors: string[] = [], alerts: string[] = [];

	$.STEP("PATH : " + NAVIGATE.json.configure.path);
	const config = await fileman.read.json(NAVIGATE.json.configure.path);
	if (config.status) {
		const CONFIG = config.data as t_Config;
		if (loadStatics) { await FetchStatics(CONFIG.vendors); }
		collectTWEAKS(CONFIG.tweaks);

		CACHE_STATIC.PROXYMAP = (Array.isArray(CONFIG.proxy)) ? CONFIG.proxy.reduce((acc, proxy) => {
			if (typeof proxy === "object") {
				acc.push(proxy);
			}
			return acc;
		}, [] as t_ProxyMap[]) : [];

		
		Object.assign(CACHE_STATIC.ARCHIVE, config.data);
		CACHE_STATIC.ARCHIVE.readme = (await fileman.read.file(NAVIGATE.md.readme.path)).data;
		CACHE_STATIC.ARCHIVE.name = CACHE_STATIC.PROJECT_NAME = CONFIG.name || CACHE_STATIC.FALLBACK_NAME;
		CACHE_STATIC.ARCHIVE.version = CACHE_STATIC.PROJECT_VERSION = CONFIG.version || CACHE_STATIC.FALLBACK_VERSION;
		CACHE_STATIC.DEPENDENTS = Object.entries((typeof CONFIG.packages === "object") ? CONFIG.packages : {})
			.reduce((a: Record<string, string>, [k, v]) => {
				if (
					typeof v === "string"
					&& v !== '-'
					&& typeof k === "string"
				) {
					a[k] = v;
				}
				return a;
			}, {});

		delete CACHE_STATIC.ARCHIVE.proxy;
		delete CACHE_STATIC.ARCHIVE.tweaks;
		delete CACHE_STATIC.ARCHIVE.vendors;
		delete CACHE_STATIC.ARCHIVE.packages;

		const results = await worker.proxyMapDependency(CACHE_STATIC.PROXYMAP, NAVIGATE.folder.setup.path);
		errors.push(...results.warnings);
	} else {
		errors.push(`${NAVIGATE.json.configure} : Bad json file.`);
	}

	$.TASK("Initialization finished");
	return {
		status: Object.keys(errors).length === 0,
		report: Object.keys(errors).length === 0
			? $.MOLD.success.Footer("Configs Healthy", alerts, $.list.success.Bullets,)
			: $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Bullets),
	};
}




export async function UpdateIndexContent() {
	$.TASK("Updating Index");
	CACHE_STATIC.CSSIndex = await worker.cssImport(Object.values(NAVIGATE.css).map(css => css.path));
}

export async function UpdateLibrary() {
	$.TASK("Updating Library");
	CACHE_STATIC.LIBRARIES = await fileman.read.bulk(NAVIGATE.folder.libraries.path, ["css"]);
	CACHE_STATIC.PACKAGES = await fileman.read.bulk(NAVIGATE.folder.packages.path, ["xcss"]);
}

export async function UpdateProxies() {
	$.TASK("Syncing proxy folders", 0);
	Object.keys(CACHE_STATIC.PROXYFILES).forEach((key) => delete CACHE_STATIC.PROXYFILES[key]);
	await worker.proxyMapSync(CACHE_STATIC.PROXYMAP);
}

export async function UpdateHashrules() {
	$.TASK("Updating Hashrules", 0);
	const errors = [];

	$.STEP("PATH : " + NAVIGATE.json.hashrules);
	const hashrule = await fileman.read.json(NAVIGATE.json.hashrules.path);
	Object.keys(CACHE_STATIC.HASHRULE).forEach(key => delete CACHE_STATIC.HASHRULE[key]);
	if (hashrule.status) {
		Object.entries(hashrule.data).forEach(([key, value]) => {
			if (typeof value === "string") {
				CACHE_STATIC.HASHRULE[key] = value;
			} else {
				errors.push(`Hashrule: ${key} does not have a value of type STRING.`);
			}
		});
	} else {
		errors.push(`${NAVIGATE.json.hashrules.path} : Bad json file.`);
	}
	$.TASK("Analysis complete");
	return {
		status: Object.keys(errors).length === 0,
		report: $.MOLD.failed.Footer("Error Paths", errors, $.list.failed.Bullets),
	};
}