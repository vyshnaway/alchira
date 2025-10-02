package craft

import (
	_artifact_ "main/artifact"
	_cache_ "main/cache"
	_order_ "main/order"
	S "main/shell"
	_stash_ "main/stash"
	_types_ "main/types"
	_utils_ "main/utils"
	X "main/xhell"
	_maps_ "maps"
	_slices_ "slices"
	_strconv_ "strconv"
)

func accumulate() {
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
		_cache_.Delta.Lookup.TargetDir[key] = val.Lookup
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
	_maps_.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.Artifacts)
	_maps_.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.Libraries)
	_maps_.Copy(_cache_.Manifest.Lookup, _cache_.Delta.Lookup.TargetDir)

	_cache_.Delta.Errors.Multiples = []string{}
	_cache_.Delta.Diagnostics.Multiples = []_types_.Refer_Diagnostic{}
	for _, val := range _cache_.Style.Index_to_Data {
		if len(val.Metadata.Declarations) > 1 {
			error_ := X.Error_Write("Duplicate Declarations: "+val.SymClass, val.Metadata.Declarations)
			_cache_.Delta.Errors.Multiples = append(_cache_.Delta.Errors.Multiples, error_.Errorstring)
			_cache_.Delta.Diagnostics.Multiples = append(_cache_.Delta.Diagnostics.Multiples, error_.Diagnostic)
		}
	}

	_cache_.Manifest.Diagnostics = []_types_.Refer_Diagnostic{}
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Artifacts)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Axioms)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Clusters)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.Multiples)
	_slices_.Concat(_cache_.Manifest.Diagnostics, _cache_.Delta.Diagnostics.TargetDir)
	_cache_.Delta.ErrorCount = len(_cache_.Manifest.Diagnostics)

	errorlist := []string{}
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Artifacts)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Axioms)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Clusters)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.Multiples)
	_slices_.Concat(errorlist, _cache_.Delta.Errors.TargetDir)
	_cache_.Delta.Report.Errors = ""

	if _cache_.Delta.ErrorCount > 0 {
		S.MAKE(
			S.Tag.H2(_strconv_.Itoa(_cache_.Delta.ErrorCount)+" Errors", S.Preset.Failed),
			errorlist,
		)
	}
}

func Organize() (AritfactFiles map[string]string, Attachments []int) {

	_cache_.Style.ClassDictionary = _types_.Style_Dictionary{}
	_cache_.Style.PublishIndexMap = []_types_.Style_ClassIndexTrace{}

	SaveClassRefs := func(stash _types_.Refer_SortedOutput) {
		for _, val := range stash.RecompClasslist {
			index := val[0]
			classid := val[1]
			classname := "_" + _utils_.String_EnCounter(classid)
			_cache_.Style.PublishIndexMap = append(_cache_.Style.PublishIndexMap, _types_.Style_ClassIndexTrace{
				ClassName:  classname,
				ClassIndex: index,
			})
		}

		for json_array, imap := range stash.ReferenceMap {
			_cache_.Style.ClassDictionary[json_array] = map[int]string{}
			for ref, id := range imap {
				_cache_.Style.ClassDictionary[json_array][ref] = "_" + _utils_.String_EnCounter(id)
			}
		}
	}

	accumulate()
	artifact_files := map[string]string{}
	tracks_ := _stash_.Target_GetTracks()

	if _cache_.Static.WATCH {
		_cache_.Delta.FinalMessage = _strconv_.Itoa(_cache_.Delta.ErrorCount) + " Errors."
	} else if _cache_.Static.Command == "preview" {
		res, _ := _order_.Order(tracks_.ClassTracks, "preview", _cache_.Static.Argument, _types_.Config_Archive{})
		SaveClassRefs(*res.Result)

		if _cache_.Delta.ErrorCount > 0 {
			_cache_.Delta.FinalMessage = _strconv_.Itoa(_cache_.Delta.ErrorCount) + " Unresolved Errors. Rectify them to proceed with 'publish' command."
		} else {
			_cache_.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key."
		}
	} else if _cache_.Static.Command == "publish" {
		if _cache_.Delta.ErrorCount > 0 {
			res, _ := _order_.Order(tracks_.ClassTracks, "preview", _cache_.Static.Argument, _types_.Config_Archive{})
			SaveClassRefs(*res.Result)

			_cache_.Delta.FinalMessage = "Errors in " + _strconv_.Itoa(_cache_.Delta.ErrorCount) + " Tags. Falling back to 'preview' command."
			_cache_.Static.Command = "preview"
		} else {
			archive := _artifact_.Archive()
			res, _ := _order_.Order(tracks_.ClassTracks, "publish", _cache_.Static.Argument, archive)
			SaveClassRefs(*res.Result)

			if res.Status {
				artifact_files = _artifact_.Deploy()
				_cache_.Delta.FinalMessage = "Build Success."
			} else {
				_cache_.Delta.PublishError = res.Message
				_cache_.Delta.FinalMessage = "Build Atttempt Failed. Fallback with Preview."
			}
		}
	}

	return artifact_files, tracks_.Attachments
}

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
