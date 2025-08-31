import * as _Config from "../type/config.js";
// import * as _File from "../type/file.js";
// import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
import * as _Cache from "../type/cache.js";
// import * as _Support from "../type/support.js";

import $ from "../shell/main.js";
import FILEMAN from "../fileman.js";

import * as $$ from "../shell.js";
import * as CACHE from "./cache.js";
import * as VERIFY from "./verify.js";
import * as ACTION from "./action.js";

export async function FetchDocs() {
	await Promise.all(Object.values(CACHE.SYNC).map(sync => {
		Object.values(sync).map(async s => {
			if (s.url && s.path) {
				s.content = await FILEMAN.sync.file(s.url, s.path);
			}
		});
	}));
	await FILEMAN.write.file(CACHE.PATH.scaffold.reference.path, CACHE.SYNC.MARKDOWN.readme.content);
}

export async function Initialize() {
	try {
		$.TASK("Initializing XCSS setup.", 0);
		$.TASK("Cloning scaffold to Project");

		await FILEMAN.clone.safe(CACHE.PATH.blueprint.scaffold.path, CACHE.PATH.folder.setup.path);
		await FILEMAN.clone.safe(CACHE.PATH.blueprint.libraries.path, CACHE.PATH.folder.libraries.path);

		$.POST($$.ListSteps(
			"Next Steps",
			[
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
			],
		));

		$.POST($$.ListRecord("Available Commands", CACHE.ROOT.Commands));

		$.POST($$.ListSteps(
			"Publish command instructions.",
			CACHE.ROOT.version === "0"
				? ["This command is not activated."]
				: [
					"Create a new project and use its access key. For action visit " +
					$.FMT(CACHE.ROOT.URL.Console, $.style.AS_Bold, ...$.preset.primary),
					"For personal projects, you can use the key in " +
					$.FMT(CACHE.PATH.json.configure.path, $.style.AS_Bold, ...$.preset.primary),
					"If using in CI/CD workflow, it is suggested to use " +
					$.FMT("xcss publish {key}", $.style.AS_Bold, ...$.preset.primary),
				]
		));

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

	if (FILEMAN.path.ifFolder(CACHE.PATH.folder.setup.path)) {
		const errors: Record<string, string> = {};
		await FILEMAN.clone.safe(CACHE.PATH.blueprint.scaffold.path, CACHE.PATH.folder.setup.path);

		$.TASK("Verifying directory status", 0);
		for (const item of [
			...Object.values(CACHE.PATH.json),
			...Object.values(CACHE.PATH.css),
			...Object.values(CACHE.PATH.md),
		]) {
			const path = item.path;
			$.STEP("Path : " + path);
			if (!FILEMAN.path.ifFile(path)) {
				errors[path] = "File not found.";
			}
		}

		$.TASK("Verification finished");
		// Shell.js refactored till here >>>
		result.started = true;
		result.proceed = Object.keys(errors).length === 0;
		result.report =
			Object.keys(errors).length === 0
				? $.MAKE($.tag.H5("Setup Healthy", $.preset.success))
				: $.MAKE($.tag.H5("Error Paths", $.preset.failed), $$.ListProps(errors), [$.list.Bullets, 0, $.preset.failed]);
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

	const manifestIgnores = (await FILEMAN.read.file(CACHE.PATH.autogen.ignore.path)).data.split("\n");
	const modPts = (CACHE.PATH.autogen.ignore.content || "").split("\n").reduce((modPts: number, ign) => {
		if (!manifestIgnores.includes(ign)) {
			manifestIgnores.push(ign);
			modPts++;
		}
		return modPts;
	}, 0);
	if (modPts) { await FILEMAN.write.file(CACHE.PATH.autogen.ignore.path, manifestIgnores.join("\n")); }


	$.TASK("Loading vendor-prefixes");

	const PrefixObtained = await (async function () {
		const result1 = await FILEMAN.read.json(vendorSource, true);
		if (result1.status) { return result1.data; };

		const result2 = await FILEMAN.read.json(CACHE.ROOT.URL.PrefixCdn + vendorSource, true);
		if (result2.status) { return result2.data; };

		const result3 = await FILEMAN.read.json(CACHE.PATH.blueprint.prefixes.path, false);
		if (result3.status) { return result3.data; };

		return {};
	})() as _Cache.PREFIX;
	await FILEMAN.write.json(CACHE.PATH.blueprint.prefixes.path, PrefixObtained);


	const PrefixRead: _Cache.PREFIX = {
		attributes: {},
		pseudos: {},
		values: {},
		atrules: {},
		classes: {},
		elements: {}
	};

	for (const key in PrefixRead) {
		const typedKey = key as keyof _Cache.PREFIX;
		const valueFromObtained = PrefixObtained[typedKey];
		if (typedKey === 'values') {
			PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, Record<string, string>>>;
		} else {
			PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, string>>;
		}
	}
	CACHE.STATIC.Prefix.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
	CACHE.STATIC.Prefix.attributes = { ...PrefixRead.attributes };
	CACHE.STATIC.Prefix.atrules = { ...PrefixRead.atrules };
	CACHE.STATIC.Prefix.values = { ...PrefixRead.values };
	ACTION.setVendors();
}

export async function VerifyConfigs(loadStatics: boolean) {
	$.TASK("Initializing configs", 0);
	const errors: string[] = [];

	$.STEP("PATH : " + CACHE.PATH.json.configure.path);
	const config = await FILEMAN.read.json(CACHE.PATH.json.configure.path);
	if (config.status) {
		const CONFIG = config.data as _Config.Raw;
		if (loadStatics) { await FetchStatics(CONFIG.vendors); }
		ACTION.setTWEAKS(CONFIG.tweaks);

		CACHE.STATIC.ProxyMap = Array.isArray(CONFIG.proxy) ? CONFIG.proxy.reduce((A, I) => {
			if (
				typeof I === "object"
				&& typeof I.source === "string"
				&& typeof I.target === "string"
				&& typeof I.stylesheet === "string"
				&& typeof I.extensions === "object"
				&& I.source !== ""
				&& I.target !== ""
				&& I.stylesheet !== ""
				&& Object.keys(I.extensions).length !== 0
			) {
				Object.entries(I.extensions).forEach(([K, V]) => {
					if (Array.isArray(V)) {
						I.extensions[K] = V.filter(e => typeof e === "string");
					} else {
						I.extensions[K] = [];
					}
				});
				A.push(I);
			}
			return A;
		}, [] as _Config.ProxyMap[]) : [];
		if (CACHE.STATIC.ProxyMap.length === 0) {
			errors.push($.tag.Li(CACHE.PATH.json.configure.path + ": Workable proxies unavailable."));
		}

		Object.assign(CACHE.STATIC.Artifact, config.data);
		CACHE.STATIC.Artifact.readme = (await FILEMAN.read.file(CACHE.PATH.md.readme.path)).data;
		CACHE.STATIC.Artifact.name = CACHE.STATIC.Artifact.name = CONFIG.name || CACHE.STATIC.Project_Name;
		CACHE.STATIC.Artifact.version = CACHE.STATIC.Artifact.version = CONFIG.version || CACHE.STATIC.Project_Version;
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

		delete CACHE.STATIC.Artifact.proxy;
		delete CACHE.STATIC.Artifact.tweaks;
		delete CACHE.STATIC.Artifact.vendors;
		delete CACHE.STATIC.Artifact.packages;

		const results = await VERIFY.proxyMapDependency(CACHE.STATIC.ProxyMap, CACHE.PATH.folder.setup.path);
		errors.push(...results.warnings);
	} else {
		errors.push(`${CACHE.PATH.json.configure} : Bad json file.`);
	}

	$.TASK("Initialization finished");
	return {
		status: Object.keys(errors).length === 0,
		report: $.MAKE(
			Object.keys(errors).length === 0
				? $.tag.H2("Configs Healthy", $.preset.success)
				: $.tag.H2("Error Paths: " + CACHE.PATH.json.configure.path, $.preset.failed),
			errors, [$.list.Bullets, 0, $.preset.warning]
		)
	};
}




export async function SaveRootCss() {
	$.TASK("Updating Index");
	CACHE.STATIC.RootCSS = await VERIFY.cssImport(Object.values(CACHE.PATH.css).map(css => css.path));
}

export async function SaveLibraries() {
	$.TASK("Updating Library");
	CACHE.STATIC.Library_Saved = await FILEMAN.read.bulk(CACHE.PATH.folder.libraries.path, ["css"]);
}

export async function SavePackages() {
	$.TASK("Updating Packages");
	CACHE.STATIC.Package_Saved = await FILEMAN.read.bulk(CACHE.PATH.folder.packages.path, ["xcss", "css", "md"]);
}



export async function SaveTargets() {
	$.TASK("Syncing proxy folders", 0);
	Object.keys(CACHE.STATIC.Targets_Saved).forEach((key) => delete CACHE.STATIC.Targets_Saved[key]);
	CACHE.STATIC.Targets_Saved = await VERIFY.proxyMapSync(CACHE.STATIC.ProxyMap);
}

export async function SaveHashrules() {
	$.TASK("Updating Hashrules", 0);
	const errors: Record<string, string> = {};

	$.STEP("PATH : " + CACHE.PATH.json.hashrules);
	const hashrule = await FILEMAN.read.json(CACHE.PATH.json.hashrules.path);
	Object.keys(CACHE.STATIC.HashRule).forEach(key => delete CACHE.STATIC.HashRule[key]);
	if (hashrule.status) {
		Object.entries(hashrule.data).forEach(([key, value]) => {
			if (typeof value === "string") {
				CACHE.STATIC.HashRule[key] = value;
			} else {
				errors[key] = `Value of type "STRING".`;
			}
		});
	} else {
		errors["ERROR"] = `Bad json file.`;
	}
	$.TASK("Analysis complete");
	return {
		status: Object.keys(errors).length === 0,
		report: $.MAKE(
			$.tag.H2("Hashrule error: " + CACHE.PATH.json.hashrules.path, $.preset.failed),
			$$.ListProps(errors, $.preset.primary, $.preset.text),
			[$.list.Blocks, 0, $.preset.text, $.style.AS_Bold],
			[$.list.Bullets, 0, $.preset.failed, $.style.AS_Bold]
		),
	};
}