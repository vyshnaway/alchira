import $ from "./Shell/main.js";
import Use from "./Utils/main.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/render.js";
import FORGE from "./Style/forge.js";
import ORDER from "./Worker/order-api.js";
import SCRIPT from "./Script/class.js";
import XTYLES from "./Style/stash.js";
import { CACHE_STATIC, CACHE_STORAGE, CACHE_DYNAMIC, CACHE_REPORT } from "./Data/cache.js";
import { INDEX } from "./Data/init.js";
// import { GeneratePortable } from "./portable.js";
import { t_FILE_Manifest, t_FILE_Reference } from "./types.js";

export function UpdateXtylesFolder() {
	INDEX.RESET();
	CACHE_REPORT.MANIFEST.prefix = CACHE_STATIC.PROJECT_NAME;
	Object.assign(CACHE_DYNAMIC, {
		HashRule: {},
		Index_ClassData: {},
		NativeClass__Index: {},
		GlobalClass__Index: {},
		PublicClass__Index: {},
		LibraryClass_Index: {},
		PackageClass_Index: {},
		Computed_ClassIndex: {}
	});
	Object.assign(CACHE_STORAGE, {
		PROXYCACHE: {},
		LIBRARIES: {},
		PORTABLES: {},
	});

	const {
		libraryTable,
		modulesTable,
		AxiomStyleSkeleton,
		ClusterStyleSkeleton,
		PackageStyleSkeleton,
		PacbindStyleSkeleton,
	} = XTYLES.ReRender();

	CACHE_REPORT.MANIFEST.axiom = AxiomStyleSkeleton;
	CACHE_REPORT.MANIFEST.cluster = ClusterStyleSkeleton;
	CACHE_REPORT.MANIFEST.xtyling = PackageStyleSkeleton;
	CACHE_REPORT.MANIFEST.binding = PacbindStyleSkeleton;

	CACHE_REPORT.LibFilesTemp = { ...libraryTable, ...modulesTable } as Record<string, t_FILE_Reference>;
}

export function ProcessProxies(
	action: "upload" | "add" | "change" | "unlink" = "upload",
	targetFolder = '',
	filePath = '',
	fileContent = '',
	extension = '',
) {
	if (CACHE_STATIC.PROXYFILES[targetFolder].fileContents === undefined) { CACHE_STATIC.PROXYFILES[targetFolder].fileContents = {}; }
	let reCache = true;
	switch (action) {
		case "add": case "change":
			if (CACHE_STORAGE.PROJECT[targetFolder].stylesheetPath === filePath) {
				CACHE_STATIC.PROXYFILES[targetFolder].stylesheetContent = fileContent;
				CACHE_STORAGE.PROJECT[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (CACHE_STORAGE.PROJECT[targetFolder].extensions.includes(extension)) {
				CACHE_STATIC.PROXYFILES[targetFolder].fileContents[filePath] = fileContent;
				CACHE_REPORT.DeltaPath = `${CACHE_STORAGE.PROJECT[targetFolder].source}/${filePath}`;
			} else {
				CACHE_REPORT.DeltaPath = `${CACHE_STORAGE.PROJECT[targetFolder].source}/${filePath}`;
				CACHE_REPORT.DeltaContent = fileContent;
				reCache = false;
			}
			break;
		case "unlink":
			if (CACHE_STATIC.PROXYFILES[targetFolder]) { delete CACHE_STATIC.PROXYFILES[targetFolder].fileContents[filePath]; }
			break;
		default:
			CACHE_REPORT.Content.hashrule = HASHRULE.UPLOAD();
			CACHE_REPORT.MANIFEST.hashrules = CACHE_DYNAMIC.HashRule;
	}
	if (reCache) {
		XTYLES.ReDeclare();
		Object.keys(CACHE_DYNAMIC.GlobalClass__Index).forEach(key => delete CACHE_DYNAMIC.GlobalClass__Index[key]);
		Object.entries(CACHE_STORAGE.PROJECT).forEach(([key, cache]) => { cache.ClearFiles(); delete CACHE_STORAGE.PROJECT[key]; });
		Object.entries(CACHE_STATIC.PROXYFILES).forEach(([key, files]) => { CACHE_STORAGE.PROJECT[key] = new SCRIPT(files); });
		CACHE_DYNAMIC.ArchiveClass_Index = {
			...Object.fromEntries(Object.entries(CACHE_DYNAMIC.LibraryClass_Index).map(([s, i]) => [`/${CACHE_STATIC.PROJECT_NAME}/$/${s}`, i])),
			...Object.fromEntries(Object.entries(CACHE_DYNAMIC.GlobalClass__Index).map(([s, i]) => [`/${CACHE_STATIC.PROJECT_NAME}/${s}`, i]))
		};
	}
}

async function Engine() {
	const CUMULATES: {
		indexes: number[],
		report: string[],
		errors: string[],
		styleMap: t_FILE_Manifest[],
		essentials: [string, string | object][],
		attachments: Set<string>,
	} = {
		report: [],
		errors: [],
		indexes: [],
		styleMap: [],
		essentials: [],
		attachments: new Set(),
	};
	const SAVEFILES: Record<string, string> = {};

	Object.values(CACHE_STORAGE.PROJECT).forEach((cache) => {
		const cumulated = cache.Accumulator();
		CUMULATES.report.push(...cumulated.report);
		CUMULATES.errors.push(...cumulated.errors);
		CUMULATES.indexes.push(...cumulated.indexes);
		CUMULATES.styleMap.push(...cumulated.styleMap);
		CUMULATES.essentials.push(...cumulated.essentials);
		cumulated.attachments.forEach((i) => CUMULATES.attachments.add(i));
	});

	CACHE_REPORT.MANIFEST.global = {};
	CACHE_REPORT.MANIFEST.local = {};
	CACHE_REPORT.MANIFEST.file = CACHE_REPORT.LibFilesTemp;
	CUMULATES.styleMap.forEach((map) => {
		CACHE_REPORT.MANIFEST.global[map.refer.id] = map.global;
		CACHE_REPORT.MANIFEST.local[map.refer.id] = map.local;
		CACHE_REPORT.MANIFEST.file[map.refer.id] = map.refer;
	});


	if (CACHE_STATIC.WATCH) {
		CACHE_DYNAMIC.Computed_ClassIndex = {};
		CACHE_REPORT.FinalMessage = CUMULATES.errors.length ? "Errors in " + CUMULATES.errors.length + " Tags." : "Zero errors.";
	} else {
		const TRACKS: number[][] = [];
		Object.values(CACHE_STORAGE.PROJECT).forEach((cache) => TRACKS.push(...cache.GetTracks()));
		let output;
		if ("publish" === CACHE_STATIC.COMMAND) {
			if (CUMULATES.errors.length) {
				CACHE_STATIC.CMD = "preview";
				output = await ORDER(TRACKS, CACHE_STATIC.COMMAND, CACHE_STATIC.ARGUMENT);
				CACHE_REPORT.FinalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Falling back to 'preview' command.";
			} else {
				// const json = GeneratePortable(CUMULATES.essentials);
				// const json = {};
				// SAVEFILES[json.jsonPath] = json.jsonContent;

				output = await ORDER(TRACKS, CACHE_STATIC.CMD, CACHE_STATIC.ARG,);
				if (output.status) {
					CACHE_REPORT.FinalMessage = "Build Success.";
				} else {
					CACHE_STATIC.CMD = "preview";
					CACHE_REPORT.FinalError = output.message;
					CACHE_REPORT.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
				}
			}
		} else {
			if (CUMULATES.errors.length)
				CACHE_REPORT.FinalMessage = CUMULATES.errors.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
			else
				CACHE_REPORT.FinalMessage = "Preview verified. Procceed to 'publish' using your key."
			output = await ORDER(CACHE_STATIC.CMD, CACHE_STATIC.ARG, TRACKS, FALLBACK);
		}

		CACHE_DYNAMIC.Computed_ClassIndex = output.result.reduce((A, I) => {
			A["." + INDEX.STYLE(I).class] = I;
			return A;
		}, {});
		CACHE_DYNAMIC.SortedIndexes = output.result;
	}

	return { CUMULATES, SAVEFILES };
}

function createStylesheet(CUMULATES, ESSENTIALS = []) {
	const PREBINDS = new Set(CUMULATES.preBinds);
	const POSTBINDS = new Set(CUMULATES.postBinds);
	const RENDERFRAGS = {
		INDEX: "",
		PREBINDS: "",
		RENDERED: "",
		ESSENTIALS: "",
		BOUNDSTYLES: "",
		APPENDIX: "",
		POSTBINDS: "",
	};

	const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(CACHE_STATIC.CSSIndex), "INDEX ||");
	indexScanned.postBinds.forEach((i) => POSTBINDS.add(i));
	indexScanned.preBinds.forEach((i) => PREBINDS.add(i));
	RENDERFRAGS.INDEX = COMPILE.forPublish(indexScanned.object, !CACHE_STATIC.WATCH);
	CACHE_REPORT.MANIFEST.constants = Object.keys(indexScanned.variables);
	CACHE_REPORT.Content.variables = $.MOLD.primary.Section(
		"Root variables",
		CACHE_REPORT.MANIFEST.constants,
		$.list.text.Entries,
	);

	RENDERFRAGS.ESSENTIALS = COMPILE.forPublish([...(CACHE_STATIC.CMD === "publish" ? ESSENTIALS : CACHE_DYNAMIC.PortableEssentials), ...CUMULATES.essentials], !CACHE_STATIC.WATCH);
	Object.values(CACHE_STORAGE.PROJECT).forEach((cache) => cache.RenderFiles(PREBINDS, POSTBINDS, CACHE_STATIC.CMD));
	const renderdScanned = FORGE.indexMaps(CACHE_DYNAMIC.Computed_ClassIndex);
	renderdScanned.postBinds.forEach((i) => POSTBINDS.add(i));
	renderdScanned.preBinds.forEach((i) => PREBINDS.add(i));
	RENDERFRAGS.RENDERED = COMPILE.forPublish(renderdScanned.object, !CACHE_STATIC.WATCH);


	RENDERFRAGS.APPENDIX = COMPILE.forPublish(
		Object.values(CACHE_STORAGE.PROJECT).reduce((appendix, cache) => {
			const appendixScanned = STYLE.CSSCANNER(
				Use.code.uncomment.Css(cache.stylesheetContent),
				`APPENDIX : ${cache.targetStylesheet} ||`
			);
			appendix.push(...appendixScanned.object);
			appendixScanned.postBinds.forEach((i) => POSTBINDS.add(i));
			appendixScanned.preBinds.forEach((i) => PREBINDS.add(i));
			return appendix;
		}, []), !CACHE_STATIC.WATCH
	);

	const bindObjects = FORGE.attachIndex(PREBINDS, POSTBINDS);
	RENDERFRAGS.PREBINDS = COMPILE.forPublish(Object.entries(bindObjects.object), !CACHE_STATIC.WATCH);
	RENDERFRAGS.POSTBINDS = COMPILE.forPublish(Object.entries(bindObjects.postBindsObject), !CACHE_STATIC.WATCH);

	(CACHE_STATIC.WATCH
		? Object.values(CACHE_DYNAMIC.Index_ClassData)
		: CACHE_DYNAMIC.SortedIndexes.map(index => CACHE_DYNAMIC.Index_ClassData[index])
	).reduce((a, obj) => {
		if (obj.boundSnippet.length) a.boundsnippets.push(obj.boundSnippet);
		if (obj.boundStyles.length) a.boundStyles.push(obj.boundStyles);
		return a;
	}, { boundsnippets: [], boundStyles: [] })

	return { RENDERFRAGS, PREBINDS, POSTBINDS, SNIPPETSHEET };
}

// On target stylesheet edit.
export async function Generate() {
	const { SAVEFILES, CUMULATES } = await Engine();
	const XRESPONSE = XTYLES.Appendix(CACHE_DYNAMIC.SortedIndexes);

	CACHE_REPORT.Content.library = XRESPONSE.report;
	CACHE_REPORT.Content.targets = $.MOLD.std.Block(CUMULATES.report);

	if (CACHE_REPORT.FinalError.length) {
		CUMULATES.errors.push($.MOLD.failed.List(CACHE_REPORT.FinalError))
	}

	CACHE_REPORT.ErrorCount = CUMULATES.errors.length;
	CACHE_REPORT.WarningCount = XRESPONSE.warnings.length;
	CACHE_REPORT.Content.errors = $.MOLD[CACHE_REPORT.ErrorCount ? "failed" : "success"].Section(
		`${CACHE_REPORT.ErrorCount} Errors & ${CACHE_REPORT.WarningCount} Warnings`,
		[...XRESPONSE.warnings, ...CUMULATES.errors]
	);


	// if (PUBLISH.DeltaContent.length) {
	// 	SAVEFILES[PUBLISH.DeltaPath] = PUBLISH.DeltaContent;
	// } else {
	// 	const { RENDERFRAGS, SNIPPETSHEET } = createStylesheet(CUMULATES, XRESPONSE.essentials);

	// 	const FinalStylesheet = Object.entries(RENDERFRAGS).map(([chapter, content]) =>
	// 		RAW.WATCH ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");

	// 	const br = RAW.WATCH ? "\n" : "";
	// 	const stylesheetBlock = `${br}<style>${FinalStylesheet}${br}</style>${br}`;
	// 	const styleBlock = stylesheetBlock + SNIPPETSHEET;
	// 	const summons = Object.values(STACK.PROXYCACHE).reduce((sum, cache) => {
	// 		sum.push(...cache.SummonFiles(SAVEFILES, FinalStylesheet, styleBlock, stylesheetBlock, SNIPPETSHEET));
	// 		return sum
	// 	}, [PUBLISH.DeltaPath]);

	// 	if (RAW.WATCH) {
	// 		if (PUBLISH.DeltaPath.length) {
	// 			Object.keys(SAVEFILES).forEach((filePath) => {
	// 				if (!summons.includes(filePath)) delete SAVEFILES[filePath];
	// 			});
	// 		}

	// 		SAVEFILES[NAV.json.manifest.path] = JSON.stringify(PUBLISH.MANIFEST);
	// 	} else {

	// 		const memChart = {
	// 			Index: Use.string.stringMem(RENDERFRAGS.INDEX),
	// 			Essentials: Use.string.stringMem(RENDERFRAGS.ESSENTIALS),
	// 			Prebinds: Use.string.stringMem(RENDERFRAGS.PREBINDS),
	// 			Rendered: Use.string.stringMem(RENDERFRAGS.RENDERED),
	// 			Postbinds: Use.string.stringMem(RENDERFRAGS.POSTBINDS),
	// 			Appendix: Use.string.stringMem(RENDERFRAGS.APPENDIX),
	// 		};
	// 		PUBLISH.Report.memChart = $.MOLD[PUBLISH.ErrorCount ? "failed" : "success"]
	// 			.Section(PUBLISH.FinalMessage,
	// 				Object.entries(memChart).reduce((ch, [k, v]) => {
	// 					ch[k] = `${v} Kb`.padStart(9, " ");
	// 					return ch;
	// 				}, {}), $.list.std.Props);

	// 		PUBLISH.Report.footer = $.MOLD.std.Footer(
	// 			"Output size :  " +
	// 			`${Use.string.stringMem(FinalStylesheet)} Kb`.padStart(9, " "),
	// 		);
	// 	}
	// }

	CACHE_REPORT.DeltaPath = ""; CACHE_REPORT.DeltaContent = "";

	return {
		SaveFiles: SAVEFILES,
		ConsoleReport: $.MOLD.std.Block(
			Object.values(CACHE_REPORT.Content).filter((string) => string !== ""),
		),
	};
}
