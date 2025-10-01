package craft

import (
	// S "main/shell"
	// S "main/shell"
	// S "main/shell"
	_cache_ "main/cache"
	S "main/shell"
	_stash_ "main/stash"
	_types_ "main/types"
	"maps"
)

func Accumulate() {
	accumulated := _stash_.Target_Accumulate()
	_cache_.Style.Global___Index = accumulated.GlobalClasses
	_cache_.Style.Public___Index = accumulated.PublicClasses
	_cache_.Delta.Report.TargetDir = S.MAKE("", accumulated.Report)

	_cache_.Manifest.Local = map[string]_types_.File_MetadataMap{}
	_cache_.Manifest.Global = map[string]_types_.File_MetadataMap{}

	_cache_.Delta.Errors.TargetDir = []string{}
	_cache_.Delta.Lookup.TargetDir = map[string]_types_.File_Lookup{}
	_cache_.Delta.Diagnostics.TargetDir = []_types_.Refer_Diagnostic{}

	for key, val := range accumulated.FileManifests {
		_cache_.Manifest.Local[key] = val.Local
		_cache_.Delta.Lookup.TargetDir[K] = val.Lookup
		_cache_.Delta.Errors.TargetDir = append(_cache_.Delta.Errors.TargetDir, val.Errors...)
		_cache_.Delta.Diagnostics.TargetDir = append(_cache_.Delta.Diagnostics.TargetDir, val.Diagnostics...)

		mergedMap := make(_types_.File_MetadataMap)
		for k, v := range val.Public {
			mergedMap[k] = v
		}
		for k, v := range val.Global {
			mergedMap[k] = v
		}
		_cache_.Manifest.Global[key] = mergedMap
	}

	_cache_.Manifest.Lookup = map[string]_types_.File_Lookup{}
	maps.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.Artifacts)
	maps.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.Libraries)
	maps.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.TargetDir)

	_cache_.Delta.Errors.Multiples = []string{}
	_cache_.Delta.Diagnostics.Multiples = []_types_.Refer_Diagnostic{}
	// Object.values(CACHE.CLASS.Index_to_Data).forEach((data) => {
	// 	if (data.metadata.declarations.length > 1) {
	// 		 E = $$.GenerateError(`Duplicate Declarations: ${data.symclass}`, data.metadata.declarations);
	// 		_cache_.Delta.Errors.multiples.push(E.error);
	// 		_cache_.Delta.Diagnostics.multiples.push(E.diagnostic);
	// 	}
	// });

	// _cache_.Delta.Manifest.errors = [];
	// Object.values(_cache_.Delta.Diagnostics).forEach((V) => _cache_.Delta.Manifest.errors.push(...V));
	// _cache_.Delta.ErrorCount = _cache_.Delta.Manifest.errors.length;

	// _cache_.Delta.Report.errors = $.MAKE(
	// 	$.tag.H2(`${_cache_.Delta.ErrorCount} Errors`, _cache_.Delta.ErrorCount ? $.preset.failed : $.preset.success),
	// 	Object.values(_cache_.Delta.Errors).reduce((A, I) => { A.push(...I); return A; }, [] as string[])
	// );
}

// function SaveClassRefs(stash: _Style.SortedOutput) {
// 	CACHE.CLASS.Sync_PublishIndexMap = stash.recompClasslist.reduce((acc, [index, classId]) => {
// 		 className = "_" + Use.string.enCounter(classId);
// 		acc.push([`.${className}`, index]);
// 		return acc;
// 	}, [] as _Style.ClassIndexTrace);

// 	Object.entries(stash.referenceMap).forEach(([jsonArray, iMap]) => {
// 		CACHE.CLASS.Sync_ClassDictionary[jsonArray] = Object.entries(iMap).reduce((a, [ref, id]) => {
// 			a[ref] = "_" + Use.string.enCounter(id); return a;
// 		}, {} as Record<string, string>);
// 	});
// }

// async function Synthasize(OUTFILES: Record<string, string> = {}) {
// 	Accumulate();
// 	CACHE.CLASS.Sync_ClassDictionary = {};
// 	CACHE.CLASS.Sync_PublishIndexMap = [];

// 	 ATTACHMENTS: number[] = [];
// 	 CLASSESLIST: number[][] = [];
// 	Object.values(_cache_.Static.TargetDir_Saved).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

// 	if (_cache_.Static.WATCH) {
// 		_cache_.Delta.FinalMessage = _cache_.Delta.ErrorCount + " Errors.";
// 	} else {
// 		if (_cache_.Static.Command == "preview") {
// 			 response = await ORDER(CLASSESLIST, _cache_.Static.Command, _cache_.Static.Argument);
// 			SaveClassRefs(response.result);

// 			if (_cache_.Delta.Manifest.errors.length) {
// 				_cache_.Delta.FinalMessage = _cache_.Delta.ErrorCount + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
// 			} else {
// 				_cache_.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
// 			}
// 		}

// 		if (_cache_.Static.Command == "publish") {
// 			if (_cache_.Delta.Manifest.errors.length) {
// 				 response = await ORDER(CLASSESLIST, "preview", _cache_.Static.Argument);
// 				_cache_.Static.Command = "preview";
// 				SaveClassRefs(response.result);

// 				_cache_.Delta.FinalMessage = "Errors in " + _cache_.Delta.ErrorCount + " Tags. Falling back to 'preview' command.";
// 			} else {
// 				 archive = ARTIFACTS.ARCHIVE();
// 				 response = await ORDER(CLASSESLIST, "publish", _cache_.Static.Argument, archive);
// 				SaveClassRefs(response.result);

// 				if (response.status) {
// 					await ARTIFACTS.DEPLOY(OUTFILES);
// 					_cache_.Delta.FinalMessage = "Build Success.";
// 				} else {
// 					_cache_.Delta.PublishError = response.message;
// 					_cache_.Delta.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
// 				}
// 			}
// 		}
// 	}

// 	return ATTACHMENTS;
// }

// async function GenFinalSheets(OUTFILES: Record<string, string> = {}) {
// 	 ATTACHMENTS = new Set(await Synthasize(OUTFILES));

// 	 RENDERFRAGS = {
// 		Root: "",
// 		Class: "",
// 		Attach: "",
// 		Appendix: "",
// 	};

// 	 indexScanned = STYLE.CSSFileScanner(Use.code.uncomment.Css(_cache_.Static.RootCSS), "INDEX ||");
// 	_cache_.Delta.Manifest.ants = Object.keys(indexScanned.variables);
// 	_cache_.Delta.Report.ants = $$.ListCatalog("Root ants", _cache_.Delta.Manifest.ants);
// 	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment).index));
// 	 WATCHINDEX = RENDERFRAGS.Root = COMPILE.Prefixed(indexScanned.styles);

// 	RENDERFRAGS.Appendix = COMPILE.Prefixed(
// 		Object.values(_cache_.Static.TargetDir_Saved).reduce((appendix, cache) => {
// 			 appendixScanned = STYLE.CSSFileScanner(cache.StylesheetContent, `APPENDIX : ${cache.targetStylesheet} ||`);
// 			appendix.push(...appendixScanned.styles);
// 			appendixScanned.attachments.forEach((i) => {
// 				 found = INDEX.FIND(i).index;
// 				if (found) { ATTACHMENTS.add(INDEX.FIND(i).index); }
// 			});
// 			return appendix;
// 		}, [] as [string, string | object][])
// 	);

// 	 targetRenderAction: _Script._Actions = (_cache_.Static.Command == "debug") ? _Script._Actions.monitor
// 		: (_cache_.Static.Command == "preview" && _cache_.Static.Argument == "watch") ? _Script._Actions.watch : _Script._Actions.sync;
// 	Object.values(_cache_.Static.TargetDir_Saved).forEach((cache) => cache.SyncClassnames(targetRenderAction));
// 	RENDERFRAGS.Class = COMPILE.Switched(CACHE.CLASS.Sync_PublishIndexMap);

// 	 ATTACH_STAPLES: string[] = [];
// 	 ATTACH_STYLES: [string, object | string][] = [];
// 	(_cache_.Static.WATCH
// 		? Object.keys(CACHE.CLASS.Index_to_Data).map(i => Number(i))
// 		: Array.from(ATTACHMENTS)
// 	).forEach(attachment => {
// 		 ClassData = INDEX.FETCH(attachment);
// 		 AttachedStyle = Object.entries(ClassData.snippet_style);
// 		if (AttachedStyle.length) { ATTACH_STYLES.push(...AttachedStyle); }
// 		if (ClassData.snippet_staple.length) { ATTACH_STAPLES.push(ClassData.snippet_staple); }
// 		return ClassData.snippet_style;
// 	});
// 	RENDERFRAGS.Attach = COMPILE.Prefixed(ATTACH_STYLES);

// 	 STAPLESHEET = Use.string.minify(Use.code.uncomment.Script(ATTACH_STAPLES.join(""), false, false, true));
// 	 STYLESHEET = Object.entries(RENDERFRAGS)
// 		.map(([chapter, content]) => _cache_.Static.DEBUG ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
// 	 WATCHCLASS = _cache_.Static.WATCH
// 		? Use.string.minify(Use.code.uncomment.Script(
// 			COMPILE.Switched(
// 				Object.entries(CACHE.CLASS.Index_to_Data).reduce((A, [I, D]) => {
// 					A.push(['.' + D.metadata.watchclass, Number(I)]);
// 					return A;
// 				}, [] as [string, number][])
// 			) + RENDERFRAGS.Attach
// 		)) : '';

// 	return { RENDERFRAGS, STYLESHEET, STAPLESHEET, WATCHINDEX, WATCHCLASS };
// }

// export async function Generate() {
// 	 OUTFILES: Record<string, string> = {};

// 	if (_cache_.Delta.DeltaContent.length) {
// 		OUTFILES[_cache_.Delta.DeltaPath] = _cache_.Delta.DeltaContent;
// 	} else {
// 		 {
// 			RENDERFRAGS,
// 			STYLESHEET,
// 			STAPLESHEET,
// 			WATCHINDEX,
// 			WATCHCLASS
// 		} = await GenFinalSheets(OUTFILES);

// 		 STYLEBLOCK = `\n<style>${STYLESHEET}</style>`;
// 		 SUMMONBLOCK = `\n${STYLEBLOCK}\n<div>${STYLESHEET}</div>`;
// 		Object.values(_cache_.Static.TargetDir_Saved).forEach((cache) => {
// 			cache.SummonFiles(OUTFILES, STYLESHEET, STYLEBLOCK, SUMMONBLOCK, STAPLESHEET);
// 		});

// 		if (_cache_.Static.WATCH) {
// 			OUTFILES[CACHE.PATH.autogen.manifest.path] = JSON.stringify(_cache_.Delta.Manifest);
// 			OUTFILES[CACHE.PATH.autogen.index.path] = WATCHINDEX;
// 			OUTFILES[CACHE.PATH.autogen.watch.path] = WATCHCLASS;
// 			OUTFILES[CACHE.PATH.autogen.staple.path] = STAPLESHEET;
// 		} else {
// 			 memChart = Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
// 				A[K] = `${Use.string.stringMem(V)} Kb`.padStart(9, " ");
// 				return A;
// 			}, {} as Record<string, string>);

// 			memChart[`[***.css]`] = `${Use.string.stringMem(STYLESHEET)} Kb`.padStart(9, " ");

// 			_cache_.Delta.Report.memChart = $.MAKE(
// 				$.tag.H2(_cache_.Delta.FinalMessage, _cache_.Delta.ErrorCount ? $.preset.failed : $.preset.success),
// 				$$.ListProps(memChart, [...$.preset.primary, $.style.AS_Bold], [...$.preset.tertiary, $.style.AS_Bold])
// 			);

// 		}
// 	}

// 	_cache_.Delta.DeltaPath = "";
// 	_cache_.Delta.DeltaContent = "";

// 	return {
// 		SaveFiles: OUTFILES,
// 		ConsoleReport: $.MAKE("", Object.values(_cache_.Delta.Report).filter((string) => string !== "")),
// 	};
// }
