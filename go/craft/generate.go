package craft

func generate_FinalSheets(OUTFILES: Record<string, string> = {}) {
	 ATTACHMENTS = new Set(await Synthasize(OUTFILES));

	 RENDERFRAGS = {
		Root: "",
		Class: "",
		Attach: "",
		Appendix: "",
	};

	 indexScanned = STYLE.CSSFileScanner(Use.code.uncomment.Css(_cache_.Static.RootCSS), "INDEX ||");
	_cache_.Delta.Manifest.ants = Object.keys(indexScanned.variables);
	_cache_.Delta.Report.ants = $$.ListCatalog("Root ants", _cache_.Delta.Manifest.ants);
	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment).index));
	 WATCHINDEX = RENDERFRAGS.Root = COMPILE.Prefixed(indexScanned.styles);

	RENDERFRAGS.Appendix = COMPILE.Prefixed(
		Object.values(_cache_.Static.TargetDir_Saved).reduce((appendix, cache) => {
			 appendixScanned = STYLE.CSSFileScanner(cache.StylesheetContent, `APPENDIX : ${cache.targetStylesheet} ||`);
			appendix.push(...appendixScanned.styles);
			appendixScanned.attachments.forEach((i) => {
				 found = INDEX.FIND(i).index;
				if (found) { ATTACHMENTS.add(INDEX.FIND(i).index); }
			});
			return appendix;
		}, [] as [string, string | object][])
	);

	 targetRenderAction: _Script._Actions = (_cache_.Static.Command == "debug") ? _Script._Actions.monitor
		: (_cache_.Static.Command == "preview" && _cache_.Static.Argument == "watch") ? _Script._Actions.watch : _Script._Actions.sync;
	Object.values(_cache_.Static.TargetDir_Saved).forEach((cache) => cache.SyncClassnames(targetRenderAction));
	RENDERFRAGS.Class = COMPILE.Switched(CACHE.CLASS.Sync_PublishIndexMap);

	 ATTACH_STAPLES: string[] = [];
	 ATTACH_STYLES: [string, object | string][] = [];
	(_cache_.Static.WATCH
		? Object.keys(CACHE.CLASS.Index_to_Data).map(i => Number(i))
		: Array.from(ATTACHMENTS)
	).forEach(attachment => {
		 ClassData = INDEX.FETCH(attachment);
		 AttachedStyle = Object.entries(ClassData.snippet_style);
		if (AttachedStyle.length) { ATTACH_STYLES.push(...AttachedStyle); }
		if (ClassData.snippet_staple.length) { ATTACH_STAPLES.push(ClassData.snippet_staple); }
		return ClassData.snippet_style;
	});
	RENDERFRAGS.Attach = COMPILE.Prefixed(ATTACH_STYLES);

	 STAPLESHEET = Use.string.minify(Use.code.uncomment.Script(ATTACH_STAPLES.join(""), false, false, true));
	 STYLESHEET = Object.entries(RENDERFRAGS)
		.map(([chapter, content]) => _cache_.Static.DEBUG ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
	 WATCHCLASS = _cache_.Static.WATCH
		? Use.string.minify(Use.code.uncomment.Script(
			COMPILE.Switched(
				Object.entries(CACHE.CLASS.Index_to_Data).reduce((A, [I, D]) => {
					A.push(['.' + D.metadata.watchclass, Number(I)]);
					return A;
				}, [] as [string, number][])
			) + RENDERFRAGS.Attach
		)) : '';

	return { RENDERFRAGS, STYLESHEET, STAPLESHEET, WATCHINDEX, WATCHCLASS };
}

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
