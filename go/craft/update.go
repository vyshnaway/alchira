package craft

import (
	// S "main/shell"
	// S "main/shell"
	// S "main/shell"
	// S "main/shell"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_stash_ "main/stash"
	_style_ "main/style"
)

func Update_Barebones() {
	_cache_.Index_Reset(0)

	_cache_.Style_Reset()
	_cache_.Delta_Reset()
	_cache_.Manifest_Reset()

	_stash_.Reset()
	_stash_.Library_Update()
	_stash_.Artifact_Update()
}

type Update_Target_action_enum int

const (
	Update_Target_action_Refresh Update_Target_action_enum = 1 << iota
	Update_Target_action_Updated
	Update_Target_action_Removed
)

func Update_Target(
	action Update_Target_action_enum,
	targetfolder string,
	filepath string,
	filecontent string,
	extension string,
) {
	reCache := true
	switch action {
	case Update_Target_action_Updated:
		if targetStruct, ok := _cache_.Static.TargetDir_Saved[targetfolder]; ok {
			if targetStruct.Stylesheet == filepath {
				targetStruct.StylesheetContent = filecontent
				_cache_.Static.TargetDir_Saved[targetfolder] = targetStruct
				reCache = false
			}
		} else if _, ok := _cache_.Static.TargetDir_Saved[targetfolder].Extensions[extension]; ok {
			_cache_.Static.TargetDir_Saved[targetfolder].Filepath_to_Content[filepath] = filecontent
			_cache_.Delta.DeltaPath = _fileman_.Path_Join(_cache_.Static.TargetDir_Saved[targetfolder].Source, filepath)
		} else {
			_cache_.Delta.DeltaPath = _fileman_.Path_Join(_cache_.Static.TargetDir_Saved[targetfolder].Source, filepath)
			_cache_.Delta.DeltaContent = filecontent
			reCache = false
		}
	case Update_Target_action_Removed:
		if targetStruct, ok := _cache_.Static.TargetDir_Saved[targetfolder]; ok {
			delete(targetStruct.Filepath_to_Content, filepath)
		}
	default:
		_style_.Hashrule_Upload()
	}

	if reCache {
		_stash_.Target_UpdateDirs()
	}
}

function SaveClassRefs(stash: _Style.SortedOutput) {
	CACHE.CLASS.Sync_PublishIndexMap = stash.recompClasslist.reduce((acc, [index, classId]) => {
		const className = "_" + Use.string.enCounter(classId);
		acc.push([`.${className}`, index]);
		return acc;
	}, [] as _Style.ClassIndexTrace);

	Object.entries(stash.referenceMap).forEach(([jsonArray, iMap]) => {
		CACHE.CLASS.Sync_ClassDictionary[jsonArray] = Object.entries(iMap).reduce((a, [ref, id]) => {
			a[ref] = "_" + Use.string.enCounter(id); return a;
		}, {} as Record<string, string>);
	});
}

// async function Synthasize(OUTFILES: Record<string, string> = {}) {
// 	Accumulate();
// 	CACHE.CLASS.Sync_ClassDictionary = {};
// 	CACHE.CLASS.Sync_PublishIndexMap = [];

// 	const ATTACHMENTS: number[] = [];
// 	const CLASSESLIST: number[][] = [];
// 	Object.values(_cache_.Static.TargetDir_Saved).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

// 	if (_cache_.Static.WATCH) {
// 		_cache_.Delta.FinalMessage = _cache_.Delta.ErrorCount + " Errors.";
// 	} else {
// 		if (_cache_.Static.Command == "preview") {
// 			const response = await ORDER(CLASSESLIST, _cache_.Static.Command, _cache_.Static.Argument);
// 			SaveClassRefs(response.result);

// 			if (_cache_.Delta.Manifest.errors.length) {
// 				_cache_.Delta.FinalMessage = _cache_.Delta.ErrorCount + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
// 			} else {
// 				_cache_.Delta.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
// 			}
// 		}

// 		if (_cache_.Static.Command == "publish") {
// 			if (_cache_.Delta.Manifest.errors.length) {
// 				const response = await ORDER(CLASSESLIST, "preview", _cache_.Static.Argument);
// 				_cache_.Static.Command = "preview";
// 				SaveClassRefs(response.result);

// 				_cache_.Delta.FinalMessage = "Errors in " + _cache_.Delta.ErrorCount + " Tags. Falling back to 'preview' command.";
// 			} else {
// 				const archive = ARTIFACTS.ARCHIVE();
// 				const response = await ORDER(CLASSESLIST, "publish", _cache_.Static.Argument, archive);
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
// 	const ATTACHMENTS = new Set(await Synthasize(OUTFILES));

// 	const RENDERFRAGS = {
// 		Root: "",
// 		Class: "",
// 		Attach: "",
// 		Appendix: "",
// 	};

// 	const indexScanned = STYLE.CSSFileScanner(Use.code.uncomment.Css(_cache_.Static.RootCSS), "INDEX ||");
// 	_cache_.Delta.Manifest.constants = Object.keys(indexScanned.variables);
// 	_cache_.Delta.Report.constants = $$.ListCatalog("Root Constants", _cache_.Delta.Manifest.constants);
// 	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment).index));
// 	const WATCHINDEX = RENDERFRAGS.Root = COMPILE.Prefixed(indexScanned.styles);

// 	RENDERFRAGS.Appendix = COMPILE.Prefixed(
// 		Object.values(_cache_.Static.TargetDir_Saved).reduce((appendix, cache) => {
// 			const appendixScanned = STYLE.CSSFileScanner(cache.StylesheetContent, `APPENDIX : ${cache.targetStylesheet} ||`);
// 			appendix.push(...appendixScanned.styles);
// 			appendixScanned.attachments.forEach((i) => {
// 				const found = INDEX.FIND(i).index;
// 				if (found) { ATTACHMENTS.add(INDEX.FIND(i).index); }
// 			});
// 			return appendix;
// 		}, [] as [string, string | object][])
// 	);

// 	const targetRenderAction: _Script._Actions = (_cache_.Static.Command == "debug") ? _Script._Actions.monitor
// 		: (_cache_.Static.Command == "preview" && _cache_.Static.Argument == "watch") ? _Script._Actions.watch : _Script._Actions.sync;
// 	Object.values(_cache_.Static.TargetDir_Saved).forEach((cache) => cache.SyncClassnames(targetRenderAction));
// 	RENDERFRAGS.Class = COMPILE.Switched(CACHE.CLASS.Sync_PublishIndexMap);

// 	const ATTACH_STAPLES: string[] = [];
// 	const ATTACH_STYLES: [string, object | string][] = [];
// 	(_cache_.Static.WATCH
// 		? Object.keys(CACHE.CLASS.Index_to_Data).map(i => Number(i))
// 		: Array.from(ATTACHMENTS)
// 	).forEach(attachment => {
// 		const ClassData = INDEX.FETCH(attachment);
// 		const AttachedStyle = Object.entries(ClassData.snippet_style);
// 		if (AttachedStyle.length) { ATTACH_STYLES.push(...AttachedStyle); }
// 		if (ClassData.snippet_staple.length) { ATTACH_STAPLES.push(ClassData.snippet_staple); }
// 		return ClassData.snippet_style;
// 	});
// 	RENDERFRAGS.Attach = COMPILE.Prefixed(ATTACH_STYLES);

// 	const STAPLESHEET = Use.string.minify(Use.code.uncomment.Script(ATTACH_STAPLES.join(""), false, false, true));
// 	const STYLESHEET = Object.entries(RENDERFRAGS)
// 		.map(([chapter, content]) => _cache_.Static.DEBUG ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
// 	const WATCHCLASS = _cache_.Static.WATCH
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
// 	const OUTFILES: Record<string, string> = {};

// 	if (_cache_.Delta.DeltaContent.length) {
// 		OUTFILES[_cache_.Delta.DeltaPath] = _cache_.Delta.DeltaContent;
// 	} else {
// 		const {
// 			RENDERFRAGS,
// 			STYLESHEET,
// 			STAPLESHEET,
// 			WATCHINDEX,
// 			WATCHCLASS
// 		} = await GenFinalSheets(OUTFILES);

// 		const STYLEBLOCK = `\n<style>${STYLESHEET}</style>`;
// 		const SUMMONBLOCK = `\n${STYLEBLOCK}\n<div>${STYLESHEET}</div>`;
// 		Object.values(_cache_.Static.TargetDir_Saved).forEach((cache) => {
// 			cache.SummonFiles(OUTFILES, STYLESHEET, STYLEBLOCK, SUMMONBLOCK, STAPLESHEET);
// 		});

// 		if (_cache_.Static.WATCH) {
// 			OUTFILES[CACHE.PATH.autogen.manifest.path] = JSON.stringify(_cache_.Delta.Manifest);
// 			OUTFILES[CACHE.PATH.autogen.index.path] = WATCHINDEX;
// 			OUTFILES[CACHE.PATH.autogen.watch.path] = WATCHCLASS;
// 			OUTFILES[CACHE.PATH.autogen.staple.path] = STAPLESHEET;
// 		} else {
// 			const memChart = Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
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
