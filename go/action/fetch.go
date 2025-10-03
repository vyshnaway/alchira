package action

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_types_ "main/types"
	_maps_ "maps"
	_os_ "os"
	_regexp_ "regexp"
	_slices_ "slices"
	_strings_ "strings"
	_sync_ "sync"
)

// verify_InlineImports recursively processes CSS imports
func verify_InlineImports(filePath string, resolvedFiles *map[string]bool) (string, error) {

	content, err := _fileman_.Read_File(filePath, false)
	if err != nil {
		return "", err
	}
	basedir := _fileman_.Path_Basedir(filePath)

	content_string := string(content)
	import_regex := _regexp_.MustCompile(`@import\s+(?:url\()?["']?(.*?)["']?\)?\s*;`)
	for _, match := range import_regex.FindAllStringSubmatch(content_string, -1) {
		fullmatch := match[0]
		importpath := match[1]

		absolute_importpath, err := _fileman_.Path_Resolves(_fileman_.Path_Join(basedir, importpath))
		if err == nil && _fileman_.Path_IfFile(absolute_importpath) && !(*resolvedFiles)[absolute_importpath] {

			replacement, err := verify_InlineImports(absolute_importpath, resolvedFiles)
			if err != nil {
				replacement = fullmatch
			}
			content_string = _strings_.Replace(content_string, fullmatch, replacement, 1)
		}
		(*resolvedFiles)[absolute_importpath] = true
	}

	return content_string, nil
}

// CssImport processes CSS files and inlines @import statements
func Verify_CssImport(filepath_array []string) (string, error) {
	resolved_files := make(map[string]bool)
	for _, filepath := range filepath_array {
		if abspath, err := _fileman_.Path_Resolves(filepath); err == nil && _fileman_.Path_IfFile(abspath) {
			resolved_files[abspath] = true
		}
	}

	inlined := make([]string, 0, len(resolved_files))
	for filePath := range resolved_files {
		content, err := verify_InlineImports(filePath, &resolved_files)
		if err == nil {
			inlined = append(inlined, content)
		}
	}

	return _strings_.Join(inlined, ""), nil
}

// ProxyMapSync synchronizes proxy map data
func ProxyMapSync(proxyMaps []_types_.Config_ProxyMap) (map[string]_types_.Config_ProxyStorage, error) {
	static_proxystorage := make(map[string]_types_.Config_ProxyStorage)
	for _, p := range proxyMaps {
		static_proxystorage[p.Target] = _types_.Config_ProxyStorage{
			Source:              p.Source,
			Target:              p.Target,
			Stylesheet:          p.Stylesheet,
			Extensions:          p.Extensions,
			Filepath_to_Content: make(map[string]string),
			StylesheetContent:   "",
		}
	}

	var wg _sync_.WaitGroup
	for _, p := range static_proxystorage {
		wg.Add(1)
		go func(proxystorage _types_.Config_ProxyStorage) {
			proxystorage.Extensions[_cache_.Root.Extension] = []string{}
			fileContents, err := _fileman_.Sync_Bulk(
				proxystorage.Target,
				proxystorage.Source,
				_slices_.Collect(_maps_.Keys(proxystorage.Extensions)),
				[]string{_cache_.Root.Extension},
				[]string{proxystorage.Stylesheet},
			)
			if err == nil && len(fileContents) > 0 {
				proxystorage.Filepath_to_Content = fileContents
				if content, err := _os_.ReadFile(_fileman_.Path_Join(proxystorage.Target, proxystorage.Stylesheet)); err == nil {
					proxystorage.StylesheetContent = string(content)
				}
			}
			defer wg.Done()
		}(p)
	}

	wg.Wait()
	return static_proxystorage, nil
}

// export async function FetchDocs() {
// 	await Promise.all(Object.values(CACHE.SYNC).map(sync => {
// 		Object.values(sync).map(async s => {
// 			if (s.url && s.path) {
// 				s.content = await FILEMAN.sync.file(s.url, s.path);
// 			}
// 		});
// 	}));
// }

// export async function Initialize() {
// 	try {
// 		$.TASK("Initializing setup.", 0);
// 		$.TASK("Cloning scaffold to Project");

// 		await FILEMAN.clone.safe(CACHE.PATH.blueprint.scaffold.path, CACHE.PATH.folder.scaffold.path);
// 		await FILEMAN.clone.safe(CACHE.PATH.blueprint.libraries.path, CACHE.PATH.folder.libraries.path);

// 		$.POST($$.ListSteps(
// 			"Next Steps",
// 			[
// 				"Adjust " +
// 				$.FMT(CACHE.PATH.json.configure.path, $.style.AS_Bold, ...$.preset.primary) +
// 				" according to the requirements of your project.",
// 				"Execute " +
// 				$.FMT('"init"', $.style.AS_Bold, ...$.preset.primary) +
// 				" again to generate the necessary configuration folders.",
// 				"During execution " +
// 				$.FMT("{target}", $.style.AS_Bold, ...$.preset.primary) +
// 				" folder will be cloned from " +
// 				$.FMT("{source}", $.style.AS_Bold, ...$.preset.primary) +
// 				" folder.",
// 				"This folder will act as proxy for " + CACHE.ROOT.name + ".",
// 				"In the " +
// 				$.FMT("{target}/{stylesheet}", $.style.AS_Bold, ...$.preset.primary) +
// 				", content from " +
// 				$.FMT("{target}/{stylesheet}", $.style.AS_Bold, ...$.preset.primary) +
// 				" will be appended.",
// 			],
// 		));

// 		$.POST($$.ListRecord("Available Commands", CACHE.ROOT.commands));

// 		$.POST($$.ListSteps(
// 			"Publish command instructions.",
// 			CACHE.ROOT.version === "0"
// 				? ["This command is not activated."]
// 				: [
// 					"Create a new project and use its access key. For action visit " +
// 					$.FMT(CACHE.ROOT.url.Console, $.style.AS_Bold, ...$.preset.primary),
// 					"If using in CI/CD workflow, it is suggested to use " +
// 					$.FMT("{bin} publish {key}", $.style.AS_Bold, ...$.preset.primary),
// 				]
// 		));

// 		await FetchDocs();
// 		return $.tag.H4("Initialized directory", $.preset.success, $.style.AS_Bold);
// 	} catch (err) {
// 		return $.MAKE(
// 			$.tag.H4("Initialization failed.", $.preset.failed, $.style.AS_Bold),
// 			err instanceof Error ? [err.message] : [],
// 			[$.list.Bullets, 0, $.preset.failed],
// 		);
// 	}
// }

// export async function SyncIgnorefiles() {
// 	const manifestIgnores = (await FILEMAN.read.file(CACHE.PATH.autogen.ignore.path)).data.split("\n");
// 	const modPts = (CACHE.PATH.autogen.ignore.content.split("\n") || []).reduce((modPts: number, ign) => {
// 		if (!manifestIgnores.includes(ign)) {
// 			manifestIgnores.push(ign);
// 			modPts++;
// 		}
// 		return modPts;
// 	}, 0);
// 	if (modPts) { await FILEMAN.write.file(CACHE.PATH.autogen.ignore.path, manifestIgnores.join("\n")); }
// }

func Fetch_Statics(vendor_source string) {
	// $.TASK("Loading vendor-prefixes");

	// const PrefixObtained = await (async function () {
	// 	const result1 = await FILEMAN.read.json(vendorSource, true);
	// 	if (result1.status) { return result1.data; };

	// 	const result2 = await FILEMAN.read.json(CACHE.ROOT.url.Prefixes + vendorSource, true);
	// 	if (result2.status) { return result2.data; };

	// 	const result3 = await FILEMAN.read.json(CACHE.PATH.blueprint.prefixes.path, false);
	// 	if (result3.status) { return result3.data; };

	// 	return {};
	// })() as _Cache.PREFIX;
	// await FILEMAN.write.json(CACHE.PATH.blueprint.prefixes.path, PrefixObtained);

	// const PrefixRead: _Cache.PREFIX = {
	// 	attributes: {},
	// 	pseudos: {},
	// 	values: {},
	// 	atrules: {},
	// 	classes: {},
	// 	elements: {}
	// };

	// for (const key in PrefixRead) {
	// 	const typedKey = key as keyof _Cache.PREFIX;
	// 	const valueFromObtained = PrefixObtained[typedKey];
	// 	if (typedKey === 'values') {
	// 		PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, Record<string, string>>>;
	// 	} else {
	// 		PrefixRead[typedKey] = valueFromObtained as Record<string, Record<string, string>>;
	// 	}
	// }
	// CACHE.STATIC.Prefix.pseudos = { ...PrefixRead.classes, ...PrefixRead.elements, ...PrefixRead.pseudos };
	// CACHE.STATIC.Prefix.attributes = { ...PrefixRead.attributes };
	// CACHE.STATIC.Prefix.atrules = { ...PrefixRead.atrules };
	// CACHE.STATIC.Prefix.values = { ...PrefixRead.values };
	// ACTION.setVendors();
}

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
