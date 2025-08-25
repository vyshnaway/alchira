import $ from "./Shell/main.js";
import Use from "./Utils/main.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/render.js";
import FORGE from "./Style/forge.js";
import ORDER from "./Worker/order-api.js";
import SCRIPT from "./Script/class.js";
import XTYLES from "./Style/stash.js";
import { CACHE_STATIC, CACHE_STORAGE, CACHE_DYNAMIC, CACHE_LIVEDOCS } from "./Data/cache.js";
import { INDEX } from "./Data/action.js";
// import { GeneratePortable } from "./portable.js";
import { t_ClassIndexMap, t_Cumulates, t_Diagnostic, t_FILE_Reference, t_OrganizedResult } from "./types.js";

export function UpdateXtylesFolder() {
	INDEX.RESET();
	CACHE_LIVEDOCS.Manifest.prefix = CACHE_STATIC.Package.Name;
	Object.assign(CACHE_DYNAMIC, {
		HashRule: {},
		Index_ClassData: {},
		NativeClass__Index: {},
		GlobalClass__Index: {},
		PublicClass__Index: {},
		LibraryClass_Index: {},
		PackageClass_Index: {},
		Computed_ClassMaps: {}
	});
	Object.assign(CACHE_STORAGE, {
		PROXYCACHE: {},
		LIBRARIES: {},
		PORTABLES: {},
	});
	XTYLES.ReRender();
}

export function SaveTargets(
	action: "upload" | "add" | "change" | "unlink" = "upload",
	targetFolder = '',
	filePath = '',
	fileContent = '',
	extension = '',
) {
	let reCache = true;

	switch (action) {
		case "add": case "change":
			if (CACHE_STORAGE.PROJECT[targetFolder].stylesheetPath === filePath) {
				CACHE_STATIC.Targets_Saved[targetFolder].stylesheetContent = fileContent;
				CACHE_STORAGE.PROJECT[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (CACHE_STORAGE.PROJECT[targetFolder].extensions.includes(extension)) {
				CACHE_STATIC.Targets_Saved[targetFolder].fileContents[filePath] = fileContent;
				CACHE_LIVEDOCS.DeltaPath = `${CACHE_STORAGE.PROJECT[targetFolder].source}/${filePath}`;
			} else {
				CACHE_LIVEDOCS.DeltaPath = `${CACHE_STORAGE.PROJECT[targetFolder].source}/${filePath}`;
				CACHE_LIVEDOCS.DeltaContent = fileContent;
				reCache = false;
			}
			break;
		case "unlink":
			if (CACHE_STATIC.Targets_Saved[targetFolder]) {
				delete CACHE_STATIC.Targets_Saved[targetFolder].fileContents[filePath];
			}
			break;
		default:
			CACHE_LIVEDOCS.ShellDoc.hashrule = HASHRULE.UPLOAD();
			CACHE_LIVEDOCS.Manifest.hashrules = CACHE_DYNAMIC.HashRule;
	}

	if (reCache) {
		XTYLES.ReDeclare();

		CACHE_DYNAMIC.PublicClass__Index = {};
		CACHE_DYNAMIC.GlobalClass__Index = {};

		Object.entries(CACHE_STORAGE.PROJECT).forEach(([key, cache]) => {
			cache.ClearFiles();
			delete CACHE_STORAGE.PROJECT[key];
		});

		Object.entries(CACHE_STATIC.Targets_Saved).forEach(([key, files]) => {
			CACHE_STORAGE.PROJECT[key] = new SCRIPT(files);
		});
	}

}

function SaveClassRefs(stash: t_OrganizedResult) {
	CACHE_DYNAMIC.Computed_ClassDictionary = stash.referenceMap;
	CACHE_DYNAMIC.Final_ClassIndexMap = Object.entries(stash.indexMap).reduce((A, [classname, index]) => {
		A["." + classname] = index;
		return A;
	}, {} as t_ClassIndexMap);
}


async function Accumulate() {

	const CUMULATES: t_Cumulates = {
		report: [],
		errors: [],
		diagnostics: [],
		usedIndexes: [],
		globalClasses: {},
		publicClasses: {},
		fileManifests: {},
	};


	Object.values(CACHE_STORAGE.PROJECT).forEach((cache) => {
		const C = cache.Accumulator();
		CUMULATES.report.push(...C.report);
		CUMULATES.errors.push(...C.errors);
		CUMULATES.diagnostics.push(...C.diagnostics);
		CUMULATES.usedIndexes.push(...C.usedIndexes);
		Object.assign(CUMULATES.globalClasses, C.globalClasses);
		Object.assign(CUMULATES.publicClasses, C.publicClasses);
		Object.assign(CUMULATES.fileManifests, C.fileManifests);
	});

	CACHE_DYNAMIC.GlobalClass__Index = CUMULATES.globalClasses;
	CACHE_DYNAMIC.PublicClass__Index = CUMULATES.publicClasses;
	CACHE_DYNAMIC.ArchiveClass_Index = {
		...Object.fromEntries(Object.entries(CACHE_DYNAMIC.LibraryClass_Index).map(([s, i]) => [`/${CACHE_STATIC.Package.Name}/$/${s}`, i])),
		...Object.fromEntries(Object.entries(CACHE_DYNAMIC.GlobalClass__Index).map(([s, i]) => [`/${CACHE_STATIC.Package.Name}/${s}`, i])),
		...Object.fromEntries(Object.entries(CACHE_DYNAMIC.PublicClass__Index).map(([s, i]) => [`/${CACHE_STATIC.Package.Name}/${s}`, i])),
	};


	CACHE_LIVEDOCS.Lookup.project = {};
	CACHE_LIVEDOCS.Manifest.LOCAL = {};
	CACHE_LIVEDOCS.Manifest.GLOBAL = {};

	Object.entries(CUMULATES.fileManifests).forEach(([K, V]) => {
		CACHE_LIVEDOCS.Manifest.GLOBAL[K] = { ...V.public, ...V.global };
		CACHE_LIVEDOCS.Manifest.LOCAL[K] = V.local;
		CACHE_LIVEDOCS.Lookup.project[K] = V.refer;
	});

	CACHE_LIVEDOCS.Manifest.file = Object.values(CACHE_LIVEDOCS.Lookup).reduce((A, V) => {
		Object.assign(A, V);
		return A;
	}, {} as Record<string, t_FILE_Reference>);



	CACHE_LIVEDOCS.Errors.project = CUMULATES.errors;
	CACHE_LIVEDOCS.Diagnostics.project = CUMULATES.diagnostics;
	CACHE_LIVEDOCS.ShellDoc.project = $.MOLD.std.Block(CUMULATES.report);

	CACHE_LIVEDOCS.Manifest.errors = Object.values(CACHE_LIVEDOCS.Diagnostics).reduce((A, V) => {
		A.push(...V);
		return A;
	}, [] as t_Diagnostic[]);



	return CUMULATES;
}


async function Synthasize() {
	const ERRORS = CACHE_LIVEDOCS.Errors.project;

	const CLASSESLIST: number[][] = [];
	const ATTACHMENTS = new Set<number>();
	const SAVEFILES: Record<string, string> = {};

	if (CACHE_STATIC.WATCH) {
		CACHE_DYNAMIC.Final_ClassIndexMap = {};
		CACHE_DYNAMIC.Computed_ClassDictionary = {};
		CACHE_LIVEDOCS.FinalMessage = ERRORS.length + " Errors.";
	} else {

		Object.values(CACHE_STORAGE.PROJECT).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

		if (CACHE_STATIC.Command === "preview") {
			const response = await ORDER(CLASSESLIST, CACHE_STATIC.Command, CACHE_STATIC.Argument);
			SaveClassRefs(response.result);

			if (CACHE_LIVEDOCS.Manifest.errors.length) {
				CACHE_LIVEDOCS.FinalMessage = ERRORS.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
			} else {
				CACHE_LIVEDOCS.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
			}
		}

		if (CACHE_STATIC.Command === "publish") {
			if (CACHE_LIVEDOCS.Manifest.errors.length) {
				const response = await ORDER(CLASSESLIST, "preview", CACHE_STATIC.Argument);
				CACHE_STATIC.Command = "preview";
				SaveClassRefs(response.result);

				CACHE_LIVEDOCS.FinalMessage = "Errors in " + ERRORS.length + " Tags. Falling back to 'preview' command.";
			} else {
				// const json = GeneratePortable(CUMULATES.essentials);
				// SAVEFILES[json.jsonPath] = json.jsonContent;
				const response = await ORDER(CLASSESLIST, CACHE_STATIC.Command, CACHE_STATIC.Argument);
				SaveClassRefs(response.result);

				if (response.status) {
					CACHE_LIVEDOCS.FinalMessage = "Build Success.";
				} else {
					CACHE_LIVEDOCS.FinalError = response.message;
					CACHE_LIVEDOCS.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
				}
			}
		}
	}

	return { ATTACHMENTS, SAVEFILES };
}


function createStylesheet(ATTACHMENTS: Set<number>) {
	const RENDERFRAGS = {
		INDEX: "",
		PREBINDS: "",
		RENDERED: "",
		BOUNDSTYLES: "",
		APPENDIX: "",
		ATTACHES: "",
	};

	const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(CACHE_STATIC.CSSIndex), "INDEX ||");
	indexScanned.attachments.forEach((i) => ATTACHMENTS.add(i));
	RENDERFRAGS.INDEX = COMPILE.forPublish(indexScanned.object, !CACHE_STATIC.WATCH);

	CACHE_LIVEDOCS.Manifest.constants = Object.keys(indexScanned.variables);
	CACHE_LIVEDOCS.ShellDoc.constants = $.MOLD.primary.Section(
		"Root variables",
		CACHE_LIVEDOCS.Manifest.constants,
		$.list.text.Entries,
	);

	Object.values(CACHE_STORAGE.PROJECT).forEach((cache) => cache.RenderFiles(ATTACHMENTS, POSTBINDS, CACHE_STATIC.CMD));
	const renderdScanned = FORGE.indexMaps(CACHE_DYNAMIC.Computed_ClassDictionary);
	renderdScanned.postBinds.forEach((i) => POSTBINDS.add(i));
	renderdScanned.preBinds.forEach((i) => ATTACHMENTS.add(i));
	RENDERFRAGS.RENDERED = COMPILE.forPublish(renderdScanned.object, !CACHE_STATIC.WATCH);


	RENDERFRAGS.APPENDIX = COMPILE.forPublish(
		Object.values(CACHE_STORAGE.PROJECT).reduce((appendix, cache) => {
			const appendixScanned = STYLE.CSSCANNER(
				Use.code.uncomment.Css(cache.stylesheetContent),
				`APPENDIX : ${cache.targetStylesheet} ||`
			);
			appendix.push(...appendixScanned.object);
			appendixScanned.postBinds.forEach((i) => POSTBINDS.add(i));
			appendixScanned.preBinds.forEach((i) => ATTACHMENTS.add(i));
			return appendix;
		}, []), !CACHE_STATIC.WATCH
	);

	const bindObjects = FORGE.attachIndex(ATTACHMENTS, POSTBINDS);
	RENDERFRAGS.PREBINDS = COMPILE.forPublish(Object.entries(bindObjects.object), !CACHE_STATIC.WATCH);
	RENDERFRAGS.ATTACHES = COMPILE.forPublish(Object.entries(bindObjects.postBindsObject), !CACHE_STATIC.WATCH);

	(CACHE_STATIC.WATCH
		? Object.values(CACHE_DYNAMIC.Index_ClassData)
		: CACHE_DYNAMIC.SortedIndexes.map(index => CACHE_DYNAMIC.Index_ClassData[index])
	).reduce((a, obj) => {
		if (obj.boundSnippet.length) a.boundsnippets.push(obj.boundSnippet);
		if (obj.boundStyles.length) a.boundStyles.push(obj.boundStyles);
		return a;
	}, { boundsnippets: [], boundStyles: [] })

	return { RENDERFRAGS, PREBINDS: ATTACHMENTS, POSTBINDS, SNIPPETSHEET };
}

// On target stylesheet edit.
export async function Generate() {
	const CUMULATES = Accumulate();
	const { SAVEFILES } = await Synthasize();
	console.log(SAVEFILES);
	// console.log(CUMULATES);
	// const XRESPONSE = XTYLES.Appendix(CACHE_DYNAMIC.SortedIndexes);

	// CACHE_LIVEDOCS.TerminalDoc.library = XRESPONSE.report;
	// CACHE_LIVEDOCS.TerminalDoc.targets = $.MOLD.std.Block(CUMULATES.report);

	// if (CACHE_LIVEDOCS.FinalError.length) {
	// 	CUMULATES.errors.push($.MOLD.failed.List(CACHE_LIVEDOCS.FinalError))
	// }

	// CACHE_LIVEDOCS.ErrorCount = CUMULATES.errors.length;
	// CACHE_LIVEDOCS.WarningCount = XRESPONSE.warnings.length;
	// CACHE_LIVEDOCS.TerminalDoc.errors = $.MOLD[CACHE_LIVEDOCS.ErrorCount ? "failed" : "success"].Section(
	// 	`${CACHE_LIVEDOCS.ErrorCount} Errors & ${CACHE_LIVEDOCS.WarningCount} Warnings`,
	// 	[...XRESPONSE.warnings, ...CUMULATES.errors]
	// );


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

	CACHE_LIVEDOCS.DeltaPath = ""; CACHE_LIVEDOCS.DeltaContent = "";

	return {
		SaveFiles: SAVEFILES,
		ConsoleReport: $.MOLD.std.Block(
			Object.values(CACHE_LIVEDOCS.ShellDoc).filter((string) => string !== ""),
		),
	};
}
