// import * as _Config from "./type/config.js";
import * as _File from "./type/file.js";
import * as _Style from "./type/style.js";
import * as _Script from "./type/script.js";
// import * as _Cache from "./type/cache.js";
import * as _Support from "./type/support.js";


import $ from "./shell/main.js";
import * as $$ from "./shell.js";
import Use from "./utils/main.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./style/parse.js";
import COMPILE from "./style/render.js";
import ORDER from "./sort/order-api.js";
import SCRIPT from "./script/class.js";
import XTYLES from "./style/stash.js";
import { STATIC, FILES, CLASS, DELTA, PATH } from "./data/cache.js";
import * as INDEX from "./data/index.js";
// import { GeneratePortable } from "./portable.js";

export function UpdateXtylesFolder() {
	INDEX.RESET();
	DELTA.Manifest.prefix = STATIC.Archive.name;
	Object.assign(CLASS, {
		HashRule: {},
		Index_ClassData: {},
		NativeClass__Index: {},
		GlobalClass__Index: {},
		PublicClass__Index: {},
		LibraryClass_Index: {},
		PackageClass_Index: {},
		Computed_ClassMaps: {}
	});
	Object.assign(FILES, {
		PROXYCACHE: {},
		LIBRARIES: {},
		PORTABLES: {},
	});
	XTYLES.ReRender();
}

export function SaveToTarget(
	action: "upload" | "add" | "change" | "unlink" = "upload",
	targetFolder = '',
	filePath = '',
	fileContent = '',
	extension = '',
) {
	let reCache = true;

	switch (action) {
		case "add": case "change":
			if (FILES.TARGET[targetFolder].stylesheetPath === filePath) {
				STATIC.Targets_Saved[targetFolder].stylesheetContent = fileContent;
				FILES.TARGET[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (FILES.TARGET[targetFolder].extensions.includes(extension)) {
				STATIC.Targets_Saved[targetFolder].fileContents[filePath] = fileContent;
				DELTA.DeltaPath = `${FILES.TARGET[targetFolder].source}/${filePath}`;
			} else {
				DELTA.DeltaPath = `${FILES.TARGET[targetFolder].source}/${filePath}`;
				DELTA.DeltaContent = fileContent;
				reCache = false;
			}
			break;
		case "unlink":
			if (STATIC.Targets_Saved[targetFolder]) {
				delete STATIC.Targets_Saved[targetFolder].fileContents[filePath];
			}
			break;
		default:
			DELTA.Report.hashrule = HASHRULE.UPLOAD();
			DELTA.Manifest.hashrules = CLASS.HashRule;
	}

	if (reCache) {
		XTYLES.ReDeclare();

		CLASS.PublicClass__Index = {};
		CLASS.GlobalClass__Index = {};

		Object.entries(FILES.TARGET).forEach(([key, cache]) => {
			cache.ClearFiles();
			delete FILES.TARGET[key];
		});

		Object.entries(STATIC.Targets_Saved).forEach(([key, files], index) => {
			FILES.TARGET[key] = new SCRIPT(files, Use.string.enCounter(index + 768));
		});
	}

}

function SaveClassRefs(stash: _Style.SortedOutput) {
	CLASS.Sync_ClassDictionary = stash.referenceMap;
	CLASS.Sync_PublishIndexMap = Object.entries(stash.indexMap).reduce((A, [classname, index]) => {
		A["." + classname] = index;
		return A;
	}, {} as _Style.ClassIndexMap);
}


async function Accumulate() {

	const CUMULATES: _Script.Cumulates = {
		report: [],
		errors: [],
		diagnostics: [],
		usedIndexes: [],
		globalClasses: {},
		publicClasses: {},
		fileManifests: {},
	};


	Object.values(FILES.TARGET).forEach((cache) => {
		const C = cache.Accumulator();
		CUMULATES.report.push(...C.report);
		CUMULATES.errors.push(...C.errors);
		CUMULATES.diagnostics.push(...C.diagnostics);
		CUMULATES.usedIndexes.push(...C.usedIndexes);
		Object.assign(CUMULATES.globalClasses, C.globalClasses);
		Object.assign(CUMULATES.publicClasses, C.publicClasses);
		Object.assign(CUMULATES.fileManifests, C.fileManifests);
	});

	CLASS.GlobalClass__Index = CUMULATES.globalClasses;
	CLASS.PublicClass__Index = CUMULATES.publicClasses;
	CLASS.ArchiveClass_Index = Object.fromEntries([
		...Object.entries(CLASS.GlobalClass__Index).map(([s, i]) => [`/${STATIC.Archive.name}/${s}`, i]),
		...Object.entries(CLASS.PublicClass__Index).map(([s, i]) => [`/${STATIC.Archive.name}/${s}`, i]),
	]);
	CLASS.ArcbindClass_Index =
		Object.fromEntries(Object.entries(CLASS.LibraryClass_Index).map(([s, i]) => [`/${STATIC.Archive.name}/$/${s}`, i]));


	DELTA.Lookup.project = {};
	DELTA.Manifest.LOCAL = {};
	DELTA.Manifest.GLOBAL = {};

	Object.entries(CUMULATES.fileManifests).forEach(([K, V]) => {
		DELTA.Manifest.GLOBAL[K] = { ...V.public, ...V.global };
		DELTA.Manifest.LOCAL[K] = V.local;
		DELTA.Lookup.project[K] = V.refer;
	});

	DELTA.Manifest.file = Object.values(DELTA.Lookup).reduce((A, V) => {
		Object.assign(A, V);
		return A;
	}, {} as Record<string, _File.Lookup>);



	DELTA.Errors.project = CUMULATES.errors;
	DELTA.Diagnostics.project = CUMULATES.diagnostics;
	DELTA.Report.project = $.MAKE("", (CUMULATES.report));

	DELTA.Manifest.errors = Object.values(DELTA.Diagnostics).reduce((A, V) => {
		A.push(...V);
		return A;
	}, [] as _Support.Diagnostic[]);


	const ERRORS = Object.values(DELTA.Errors).reduce((A, I) => { A.push(...I); return A; }, [] as string[]);

	DELTA.ErrorCount = ERRORS.length;
	DELTA.Report.errors = DELTA.ErrorCount ?
		$.MAKE($.tag.H2(`${DELTA.ErrorCount} Errors`, $.preset.failed), ERRORS) :
		$.MAKE($.tag.H2(`${DELTA.ErrorCount} Errors`, $.preset.success));

	return CUMULATES;
}


async function Synthasize() {

	Accumulate();

	const CLASSESLIST: number[][] = [];
	const ATTACHMENTS = new Set<number>();
	const ERRORS = DELTA.Errors.project;

	Object.values(FILES.TARGET).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

	if (STATIC.WATCH) {
		CLASS.Sync_PublishIndexMap = {};
		CLASS.Sync_ClassDictionary = {};
		DELTA.FinalMessage = ERRORS.length + " Errors.";
	} else {

		if (STATIC.Command === "preview") {
			const response = await ORDER(CLASSESLIST, STATIC.Command, STATIC.Argument);
			SaveClassRefs(response.result);

			if (DELTA.Manifest.errors.length) {
				DELTA.FinalMessage = ERRORS.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
			} else {
				DELTA.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
			}
		}

		if (STATIC.Command === "publish") {
			if (DELTA.Manifest.errors.length) {
				const response = await ORDER(CLASSESLIST, "preview", STATIC.Argument);
				STATIC.Command = "preview";
				SaveClassRefs(response.result);

				DELTA.FinalMessage = "Errors in " + ERRORS.length + " Tags. Falling back to 'preview' command.";
			} else {
				// const json = GeneratePortable(CUMULATES.essentials);
				const response = await ORDER(CLASSESLIST, STATIC.Command, STATIC.Argument);
				SaveClassRefs(response.result);

				if (response.status) {
					DELTA.FinalMessage = "Build Success.";
				} else {
					DELTA.PublishError = response.message;
					DELTA.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
				}
			}
		}
	}

	return ATTACHMENTS;
}


function GenFinalSheets(ATTACHMENTS: Set<number>) {

	const RENDERFRAGS = {
		ROOT: "",
		CLASS: "",
		ATTACH: "",
		APPENDIX: "",
	};

	const targetRenderAction: _Script.Actions = (STATIC.Command === "debug") ? "monitor"
		: (STATIC.Command === "preview" && STATIC.Argument === "watch") ? "watch" : "sync";
	Object.values(FILES.TARGET).forEach((cache) => cache.RenderFiles(targetRenderAction));

	RENDERFRAGS.CLASS = COMPILE.forPublish(
		Object.entries(CLASS.Sync_PublishIndexMap).map(([K, V]) => [K, INDEX.FETCH(V)]),
		STATIC.DEBUG
	);


	const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(STATIC.RootCSS), "INDEX ||");
	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment, false).index));
	const INDEXSHEET = RENDERFRAGS.ROOT = COMPILE.forPublish(indexScanned.object, STATIC.DEBUG);

	DELTA.Manifest.constants = Object.keys(indexScanned.variables);
	DELTA.Report.constants =
		$.MAKE($.tag.H6("Root variables", $.preset.primary), DELTA.Manifest.constants, [$.list.Catalog, 0, []]);


	RENDERFRAGS.APPENDIX = COMPILE.forPublish(
		Object.values(FILES.TARGET).reduce((appendix, cache) => {
			const appendixScanned = STYLE.CSSCANNER(
				Use.code.uncomment.Css(cache.stylesheetContent),
				`APPENDIX : ${cache.targetStylesheet} ||`
			);
			appendix.push(...appendixScanned.object);
			appendixScanned.attachments.forEach((i) => ATTACHMENTS.add(INDEX.FIND(i).index));
			return appendix;
		}, [] as [string, string | object][]), !STATIC.DEBUG
	);


	const ATTACH_STAPLES: string[] = [];
	const ATTACH_OBJECTS = Array.from(ATTACHMENTS).map(attachment => {
		const ClassData = INDEX.FETCH(attachment);
		if (ClassData.attached_staple.length) {
			ATTACH_STAPLES.push(ClassData.attached_staple);
		}
		return ClassData.attached_style;
	});

	RENDERFRAGS.ATTACH = COMPILE.forPublish(Object.entries(ATTACH_OBJECTS), !STATIC.DEBUG);



	const STYLESHEET = Object.entries(RENDERFRAGS).map(([chapter, content]) =>
		STATIC.DEBUG ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
	const STAPLESHEET = ATTACH_STAPLES.join("\n");
	const STYLETAG = `<style>${STYLESHEET}</style>`;
	const WATCHSHEET = STATIC.WATCH
		? COMPILE.forPublish(Object.values(CLASS.Index_ClassData).reduce((A, D) => {
			A.push([D.watchclass, D.object], Object.entries(D.attached_style) as [string, string | object]);
			return A;
		}, [] as [string, string | object][]), !STATIC.DEBUG) : '';

	return { RENDERFRAGS, STYLESHEET, STYLETAG, STAPLESHEET, INDEXSHEET, WATCHSHEET };
}

// On target stylesheet edit.
export async function Generate() {
	const OUTFILES: Record<string, string> = {};

	if (DELTA.DeltaContent.length) {
		OUTFILES[DELTA.DeltaPath] = DELTA.DeltaContent;
	} else {

		const ATTACHMENTS = await Synthasize();
		const { RENDERFRAGS, STYLESHEET, STYLETAG, STAPLESHEET } = GenFinalSheets(ATTACHMENTS);


		const DeployedFiles = Object.values(FILES.TARGET).reduce((acc, cache) => {
			acc.push(...cache.SummonFiles(OUTFILES, STYLESHEET, STYLETAG, STAPLESHEET));
			return acc;
		}, [DELTA.DeltaPath]);

		if (STATIC.WATCH) {
			if (DELTA.DeltaPath.length) {
				Object.keys(OUTFILES).forEach((filePath) => {
					if (!DeployedFiles.includes(filePath)) { delete OUTFILES[filePath]; }
				});
			}
			OUTFILES[PATH.json.manifest.path] = JSON.stringify(DELTA.Manifest);
		} else {

			const memChart = $$.PropMap(Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
				A[K] = `${Use.string.stringMem(V)} Kb`.padStart(9, " ");
				return A;
			}, {} as Record<string, string>), $.preset.text);

			DELTA.Report.memChart = DELTA.ErrorCount ?
				$.MAKE($.tag.H2(DELTA.FinalMessage, $.preset.failed), memChart, [$.list.Bullets, 0, []]) :
				$.MAKE($.tag.H2(DELTA.FinalMessage, $.preset.success), memChart, [$.list.Bullets, 0, []]);

			DELTA.Report.footer =
				$.MAKE($.tag.H5(`Output size : ${Use.string.stringMem(STYLESHEET)} Kb`.padStart(9, " ")));
		}
	}

	DELTA.DeltaPath = "";
	DELTA.DeltaContent = "";

	return {
		SaveFiles: OUTFILES,
		ConsoleReport: $.MAKE("", Object.values(DELTA.Report).filter((string) => string !== "")),
	};
}
