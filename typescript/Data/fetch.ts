import $ from "../shell/main.js";
import FILEMAN from "../fileman.js";

import * as $$ from "../shell.js";
import * as TYPE from "../types.js";
import * as CACHE from "./cache.js";
import * as WORKER from "./watcher.js";
import * as ACTION from "./action.js";

export async function FetchDocs() {
	await Promise.all(Object.values(CACHE._SYNC).map(sync => {
		Object.values(sync).map(async s => {
			if (s.url && s.path) {
				s.content = await FILEMAN.sync.file(s.url, s.path);
			}
		});
	}));
}

export async function Initialize() {
	try {
		$.TASK("Initializing XCSS setup.", 0);
		$.TASK("Cloning scaffold to Project");

		await FILEMAN.clone.safe(CACHE._PATH.blueprint.scaffold.path, CACHE._PATH.folder.setup.path);
		await FILEMAN.clone.safe(CACHE._PATH.blueprint.libraries.path, CACHE._PATH.folder.libraries.path);

		$.POST(
			$.MAKE(
				$.tag.H2("Next Steps"),
				[
					"Adjust " +
					$.FMT(CACHE._PATH.json.configure.path, $.style.AS_Bold, ...$.preset.primary) +
					" according to the requirements of your project.",
					"Execute " +
					$.FMT('"init"', $.style.AS_Bold, ...$.preset.primary) +
					" again to generate the necessary configuration folders.",
					"During execution " +
					$.FMT("{target}", $.style.AS_Bold, ...$.preset.primary) +
					" folder will be cloned from " +
					$.FMT("{source}", $.style.AS_Bold, ...$.preset.primary) +
					" folder.",
					"This folder will act as proxy for " + CACHE._ROOT.name + ".",
					"In the " +
					$.FMT("{target}/{stylesheet}", $.style.AS_Bold, ...$.preset.primary) +
					", content from " +
					$.FMT("{target}/{stylesheet}", $.style.AS_Bold, ...$.preset.primary) +
					" will be appended.",
				],
				[$.list.Bullets, 0, []],
			),
		);

		$.POST(
			$.MAKE(
				$.tag.H2("Available Commands"),
				$$.PropMap(CACHE._ROOT.commandList),
				[$.list.Bullets, 0, []]
			),
		);

		$.POST(
			$.MAKE(
				$.tag.H2("Publish command instructions."),
				CACHE._ROOT.version === "0"
					? ["This command uses an internet connection."]
					: [
						"Create a new project and use its access key. For action visit " +
						$.FMT(CACHE._ROOT.URL.Console, $.style.AS_Bold, ...$.preset.primary),
						"For personal projects, you can use the key in " +
						$.FMT(CACHE._PATH.json.configure.path, $.style.AS_Bold, ...$.preset.primary),
						"If using in CI/CD workflow, it is suggested to use " +
						$.FMT("xcss publish {key}", $.style.AS_Bold, ...$.preset.primary),
					],
				[$.list.Bullets, 0, []]
			),
		);

		return $.tag.H5("Initialized directory", $.preset.success);
	} catch (err) {
		return $.MAKE(
			$.tag.H5("Initialization failed.", $.preset.failed),
			err instanceof Error ? [err.message] : [],
			[$.list.Bullets, 0, $.preset.failed],
		);
	}
}

export async function VerifySetupStruct() {
	const result = { started: false, proceed: false, report: "" };

	if (FILEMAN.path.ifFolder(CACHE._PATH.folder.setup.path)) {
		const errors: Record<string, string> = {};
		await FILEMAN.clone.safe(CACHE._PATH.blueprint.scaffold.path, CACHE._PATH.folder.setup.path);

		$.TASK("Verifying directory status", 0);
		for (const item of Object.values(CACHE._PATH.css)) {
			const path = item.path;
			$.STEP("Path : " + path);
			if (!FILEMAN.path.ifFile(path)) {
				errors[path] = "File not found.";
			}
		}
		for (const item of Object.values(CACHE._PATH.json)) {
			const path = item.path;
			$.STEP("Path : " + path);
			if (!FILEMAN.path.ifFile(path)) {
				errors[path] = "File not found.";
			}
		}
		$.TASK("Verification finished");

		result.started = true;
		result.proceed = Object.keys(errors).length === 0;
		result.report =
			Object.keys(errors).length === 0
				? $.MAKE($.tag.H6("Setup Healthy", $.preset.success))
				: $.MAKE($.tag.H6("Error Paths", $.preset.failed), $$.PropMap(errors), [$.list.Bullets, 0, $.preset.failed]);
	} else {
		result.report = $.MAKE(
			$.tag.H5("XCSS is not yet initialized in directory.", $.preset.warning),
			[`Use "init" command to initialize.`],
			[$.list.Bullets, 0, $.preset.warning],
		);
	}

	return result;
}

export async function FetchStatics(vendorSource: string) {

	const manifestIgnores = (await FILEMAN.read.file(CACHE._PATH.autogen.ignore.path)).data.split("\n");
	const modPts = (CACHE._PATH.autogen.ignore.content || "").split("\n").reduce((modPts: number, ign) => {
		if (!manifestIgnores.includes(ign)) {
			manifestIgnores.push(ign);
			modPts++;
		}
		return modPts;
	}, 0);
	if (modPts) { await FILEMAN.write.file(CACHE._PATH.autogen.ignore.path, manifestIgnores.join("\n")); }


	$.TASK("Loading vendor-prefixes");

	const PrefixObtained = await (async function () {
		const result1 = await FILEMAN.read.json(vendorSource, true);
		if (result1.status) { return result1.data; };

		const result2 = await FILEMAN.read.json(CACHE._ROOT.URL.PrefixCdn + vendorSource, true);
		if (result2.status) { return result2.data; };

		const result3 = await FILEMAN.read.json(CACHE._PATH.blueprint.prefixes.path, false);
		if (result3.status) { return result3.data; };

		return {};
	})() as TYPE.Data_PREFIX;
	await FILEMAN.write.json(CACHE._PATH.blueprint.prefixes.path, PrefixObtained);


	const PrefixRead: TYPE.Data_PREFIX = {
		attributes: {},
		pseudos: {},
		values: {},
		atrules: {},
		classes: {},
		elements: {}
	};

	for (const key in PrefixRead) {
		const typedKey = key as keyof TYPE.Data_PREFIX;
		const valueFromObtained = PrefixObtained[typedKey];
		if (typedKey === 'values') {
			PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, Record<string, string>>>;
		} else {
			PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, string>>;
		}
	}
	CACHE._PREFIX.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
	CACHE._PREFIX.attributes = { ...PrefixRead.attributes };
	CACHE._PREFIX.atrules = { ...PrefixRead.atrules };
	CACHE._PREFIX.values = { ...PrefixRead.values };
	ACTION.collectVendors();
}

export async function VerifyConfigure(loadStatics: boolean) {
	$.TASK("Initializing configs", 0);
	const errors: string[] = [], alerts: string[] = [];

	$.STEP("PATH : " + CACHE._PATH.json.configure.path);
	const config = await FILEMAN.read.json(CACHE._PATH.json.configure.path);
	if (config.status) {
		const CONFIG = config.data as TYPE.Config;
		if (loadStatics) { await FetchStatics(CONFIG.vendors); }
		ACTION.collectTWEAKS(CONFIG.tweaks);

		CACHE.STATIC.ProxyMap = (Array.isArray(CONFIG.proxy)) ? CONFIG.proxy.reduce((acc, proxy) => {
			if (typeof proxy === "object") {
				acc.push(proxy);
			}
			return acc;
		}, [] as TYPE.ProxyMap[]) : [];

		Object.assign(CACHE.STATIC.Package, config.data);
		CACHE.STATIC.Package.Readme = (await FILEMAN.read.file(CACHE._PATH.md.readme.path)).data;
		CACHE.STATIC.Package.Name = CACHE.STATIC.Package.Name = CONFIG.Name || CACHE.STATIC.Project_Name;
		CACHE.STATIC.Package.Version = CACHE.STATIC.Package.Version = CONFIG.Version || CACHE.STATIC.Project_Version;
		CACHE.STATIC.Package_Saved = Object.entries((typeof CONFIG.packages === "object") ? CONFIG.packages : {})
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

		delete CACHE.STATIC.Package.proxy;
		delete CACHE.STATIC.Package.tweaks;
		delete CACHE.STATIC.Package.vendors;
		delete CACHE.STATIC.Package.packages;

		const results = await WORKER.proxyMapDependency(CACHE.STATIC.ProxyMap, CACHE._PATH.folder.setup.path);
		errors.push(...results.warnings);
	} else {
		errors.push(`${CACHE._PATH.json.configure} : Bad json file.`);
	}

	$.TASK("Initialization finished");
	return {
		status: Object.keys(errors).length === 0,
		report: Object.keys(errors).length === 0
			? $.MAKE($.tag.H6("Configs Healthy", $.preset.success), alerts, [$.list.Bullets, 0, $.preset.success],)
			: $.MAKE($.tag.H6("Error Paths", $.preset.failed), errors, [$.list.Bullets, 0, $.preset.failed]),
	};
}




export async function SaveRootCSS() {
	$.TASK("Updating Index");
	CACHE.STATIC.RootCSS = await WORKER.cssImport(Object.values(CACHE._PATH.css).map(css => css.path));
}

export async function SaveLibrary() {
	$.TASK("Updating Library");
	CACHE.STATIC.Library_Saved = await FILEMAN.read.bulk(CACHE._PATH.folder.libraries.path, ["css"]);
}

export async function SavePackages() {
	$.TASK("Updating Packages");
	CACHE.STATIC.Package_Saved = await FILEMAN.read.bulk(CACHE._PATH.folder.packages.path, ["xcss", "css", "md"]);
}



export async function SaveProxies() {
	$.TASK("Syncing proxy folders", 0);
	Object.keys(CACHE.STATIC.TargeAS_Saved).forEach((key) => delete CACHE.STATIC.TargeAS_Saved[key]);
	CACHE.STATIC.TargeAS_Saved = await WORKER.proxyMapSync(CACHE.STATIC.ProxyMap);
}

export async function SaveHashrules() {
	$.TASK("Updating Hashrules", 0);
	const errors = [];

	$.STEP("PATH : " + CACHE._PATH.json.hashrules);
	const hashrule = await FILEMAN.read.json(CACHE._PATH.json.hashrules.path);
	Object.keys(CACHE.STATIC.HashRule).forEach(key => delete CACHE.STATIC.HashRule[key]);
	if (hashrule.status) {
		Object.entries(hashrule.data).forEach(([key, value]) => {
			if (typeof value === "string") {
				CACHE.STATIC.HashRule[key] = value;
			} else {
				errors.push(`Hashrule: ${key} does not have a value of type STRING.`);
			}
		});
	} else {
		errors.push(`${CACHE._PATH.json.hashrules.path} : Bad json file.`);
	}
	$.TASK("Analysis complete");
	return {
		status: Object.keys(errors).length === 0,
		report: $.MAKE($.tag.H5("Error Paths", $.preset.failed), errors, [$.list.Bullets, 0, $.preset.failed]),
	};
}