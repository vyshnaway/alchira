package action


// export async function SaveRootCss() {
// 	$.TASK("Updating Index");
// 	CACHE.STATIC.RootCSS = await VERIFY.cssImport(Object.values(CACHE.PATH.css).map(css => css.path));
// }

// export async function SaveLibraries() {
// 	$.TASK("Updating Library");
// 	CACHE.STATIC.Libraries_Saved = await FILEMAN.read.bulk(CACHE.PATH.folder.libraries.path, ["css"]);
// }

// export async function SaveExternals() {
// 	$.TASK("Updating External Artifacts");
// 	CACHE.STATIC.Artifacts_Saved = await FILEMAN.read.bulk(CACHE.PATH.folder.artifacts.path, [CACHE.ROOT.extension, "css", "md"]);
// }

// export async function SaveTargets() {
// 	$.TASK("Syncing proxy folders", 0);
// 	Object.keys(CACHE.STATIC.Targetdir_Saved).forEach((key) => delete CACHE.STATIC.Targetdir_Saved[key]);
// 	CACHE.STATIC.Targetdir_Saved = await VERIFY.proxyMapSync(CACHE.STATIC.ProxyMap);
// }

// export async function SaveHashrule() {
// 	$.TASK("Updating Hashrule", 0);
// 	const errors: Record<string, string> = {};

// 	$.STEP("PATH : " + CACHE.PATH.json.hashrule.path);
// 	const hashrule = await FILEMAN.read.json(CACHE.PATH.json.hashrule.path);
// 	Object.keys(CACHE.STATIC.Hashrule).forEach(key => delete CACHE.STATIC.Hashrule[key]);
// 	if (hashrule.status) {
// 		Object.entries(hashrule.data).forEach(([key, value]) => {
// 			if (typeof value === "string") {
// 				CACHE.STATIC.Hashrule[key] = value;
// 			} else {
// 				errors[key] = `Value of type "STRING".`;
// 			}
// 		});
// 	} else {
// 		errors["ERROR"] = `Bad json file.`;
// 	}
// 	$.TASK("Analysis complete");

// 	return {
// 		status: Object.keys(errors).length === 0,
// 		report: $.MAKE(
// 			$.tag.H4("Hashrule error: " + CACHE.PATH.json.hashrule.path, $.preset.failed),
// 			$$.ListProps(errors, $.preset.primary, $.preset.text),
// 			[$.list.Blocks, 0, $.preset.text, $.style.AS_Bold],
// 			[$.list.Bullets, 0, $.preset.failed, $.style.AS_Bold]
// 		),
// 	};
// }
