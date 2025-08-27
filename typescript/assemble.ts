import $ from "./Shell/main.js";
import * as $$ from "./shell.js";
import Use from "./Utils/main.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/render.js";
import ORDER from "./Worker/order-api.js";
import SCRIPT from "./Script/class.js";
import XTYLES from "./Style/stash.js";
import { CACHE_STATIC, CACHE_STORAGE, CACHE_DYNAMIC, CACHE_LIVEDOCS, NAVIGATE } from "./Data/cache.js";
import { INDEX } from "./Data/action.js";
// import { GeneratePortable } from "./portable.js";
import { t_ClassIndexMap, t_Cumulates, t_Diagnostic, t_FILE_Reference, t_OrganizedResult } from "./types.js";
import { t_RescriptAction } from "./Script/value.js";

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
			if (CACHE_STORAGE.TARGET[targetFolder].stylesheetPath === filePath) {
				CACHE_STATIC.TargeAS_Saved[targetFolder].stylesheetContent = fileContent;
				CACHE_STORAGE.TARGET[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (CACHE_STORAGE.TARGET[targetFolder].extensions.includes(extension)) {
				CACHE_STATIC.TargeAS_Saved[targetFolder].fileContents[filePath] = fileContent;
				CACHE_LIVEDOCS.DeltaPath = `${CACHE_STORAGE.TARGET[targetFolder].source}/${filePath}`;
			} else {
				CACHE_LIVEDOCS.DeltaPath = `${CACHE_STORAGE.TARGET[targetFolder].source}/${filePath}`;
				CACHE_LIVEDOCS.DeltaContent = fileContent;
				reCache = false;
			}
			break;
		case "unlink":
			if (CACHE_STATIC.TargeAS_Saved[targetFolder]) {
				delete CACHE_STATIC.TargeAS_Saved[targetFolder].fileContents[filePath];
			}
			break;
		default:
			CACHE_LIVEDOCS.Report.hashrule = HASHRULE.UPLOAD();
			CACHE_LIVEDOCS.Manifest.hashrules = CACHE_DYNAMIC.HashRule;
	}

	if (reCache) {
		XTYLES.ReDeclare();

		CACHE_DYNAMIC.PublicClass__Index = {};
		CACHE_DYNAMIC.GlobalClass__Index = {};

		Object.entries(CACHE_STORAGE.TARGET).forEach(([key, cache]) => {
			cache.ClearFiles();
			delete CACHE_STORAGE.TARGET[key];
		});

		Object.entries(CACHE_STATIC.TargeAS_Saved).forEach(([key, files], index) => {
			CACHE_STORAGE.TARGET[key] = new SCRIPT(files, Use.string.enCounter(index + 768));
		});
	}

}

function SaveClassRefs(stash: t_OrganizedResult) {
	CACHE_DYNAMIC.Sync_ClassDictionary = stash.referenceMap;
	CACHE_DYNAMIC.Sync_PublishIndexMap = Object.entries(stash.indexMap).reduce((A, [classname, index]) => {
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


	Object.values(CACHE_STORAGE.TARGET).forEach((cache) => {
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
	CACHE_DYNAMIC.ArchiveClass_Index = Object.fromEntries([
		...Object.entries(CACHE_DYNAMIC.GlobalClass__Index).map(([s, i]) => [`/${CACHE_STATIC.Package.Name}/${s}`, i]),
		...Object.entries(CACHE_DYNAMIC.PublicClass__Index).map(([s, i]) => [`/${CACHE_STATIC.Package.Name}/${s}`, i]),
	]);
	CACHE_DYNAMIC.ArcbindClass_Index =
		Object.fromEntries(Object.entries(CACHE_DYNAMIC.LibraryClass_Index).map(([s, i]) => [`/${CACHE_STATIC.Package.Name}/$/${s}`, i]));


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
	CACHE_LIVEDOCS.Report.project = $.MAKE("", (CUMULATES.report));

	CACHE_LIVEDOCS.Manifest.errors = Object.values(CACHE_LIVEDOCS.Diagnostics).reduce((A, V) => {
		A.push(...V);
		return A;
	}, [] as t_Diagnostic[]);


	const ERRORS = Object.values(CACHE_LIVEDOCS.Errors).reduce((A, I) => { A.push(...I); return A; }, [] as string[]);

	CACHE_LIVEDOCS.ErrorCount = ERRORS.length;
	CACHE_LIVEDOCS.Report.errors = CACHE_LIVEDOCS.ErrorCount ?
		$.MAKE($.tag.H2(`${CACHE_LIVEDOCS.ErrorCount} Errors`, $.preset.failed), ERRORS) :
		$.MAKE($.tag.H2(`${CACHE_LIVEDOCS.ErrorCount} Errors`, $.preset.success));

	return CUMULATES;
}


async function Synthasize() {

	Accumulate();

	const CLASSESLIST: number[][] = [];
	const ATTACHMENTS = new Set<number>();
	const ERRORS = CACHE_LIVEDOCS.Errors.project;

	Object.values(CACHE_STORAGE.TARGET).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

	if (CACHE_STATIC.WATCH) {
		CACHE_DYNAMIC.Sync_PublishIndexMap = {};
		CACHE_DYNAMIC.Sync_ClassDictionary = {};
		CACHE_LIVEDOCS.FinalMessage = ERRORS.length + " Errors.";
	} else {

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
				const response = await ORDER(CLASSESLIST, CACHE_STATIC.Command, CACHE_STATIC.Argument);
				SaveClassRefs(response.result);

				if (response.status) {
					CACHE_LIVEDOCS.FinalMessage = "Build Success.";
				} else {
					CACHE_LIVEDOCS.PublishError = response.message;
					CACHE_LIVEDOCS.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
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

	const targetRenderAction: t_RescriptAction = (CACHE_STATIC.Command === "debug") ? "monitor"
		: (CACHE_STATIC.Command === "preview" && CACHE_STATIC.Argument === "watch") ? "watch" : "sync";
	Object.values(CACHE_STORAGE.TARGET).forEach((cache) => cache.RenderFiles(targetRenderAction));

	RENDERFRAGS.CLASS = COMPILE.forPublish(
		Object.entries(CACHE_DYNAMIC.Sync_PublishIndexMap).map(([K, V]) => [K, INDEX.FETCH(V)]),
		CACHE_STATIC.DEBUG
	);


	const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(CACHE_STATIC.RootCSS), "INDEX ||");
	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment, false).index));
	const INDEXSHEET = RENDERFRAGS.ROOT = COMPILE.forPublish(indexScanned.object, CACHE_STATIC.DEBUG);

	CACHE_LIVEDOCS.Manifest.constants = Object.keys(indexScanned.variables);
	CACHE_LIVEDOCS.Report.constants =
		$.MAKE($.tag.H6("Root variables", $.preset.primary), CACHE_LIVEDOCS.Manifest.constants, [$.list.Catalog, 0, []]);


	RENDERFRAGS.APPENDIX = COMPILE.forPublish(
		Object.values(CACHE_STORAGE.TARGET).reduce((appendix, cache) => {
			const appendixScanned = STYLE.CSSCANNER(
				Use.code.uncomment.Css(cache.stylesheetContent),
				`APPENDIX : ${cache.targetStylesheet} ||`
			);
			appendix.push(...appendixScanned.object);
			appendixScanned.attachments.forEach((i) => ATTACHMENTS.add(INDEX.FIND(i).index));
			return appendix;
		}, [] as [string, string | object][]), !CACHE_STATIC.DEBUG
	);


	const ATTACH_STAPLES: string[] = [];
	const ATTACH_OBJECTS = Array.from(ATTACHMENTS).map(attachment => {
		const ClassData = INDEX.FETCH(attachment);
		if (ClassData.attached_staple.length) {
			ATTACH_STAPLES.push(ClassData.attached_staple);
		}
		return ClassData.attached_style;
	});

	RENDERFRAGS.ATTACH = COMPILE.forPublish(Object.entries(ATTACH_OBJECTS), !CACHE_STATIC.DEBUG);



	const STYLESHEET = Object.entries(RENDERFRAGS).map(([chapter, content]) =>
		CACHE_STATIC.DEBUG ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
	const STAPLESHEET = ATTACH_STAPLES.join("\n");
	const STYLETAG = `<style>${STYLESHEET}</style>`;
	const WATCHSHEET = CACHE_STATIC.WATCH
		? COMPILE.forPublish(Object.values(CACHE_DYNAMIC.Index_ClassData).reduce((A, D) => {
			A.push([D.watchclass, D.object], Object.entries(D.attached_style) as [string, string | object]);
			return A;
		}, [] as [string, string | object][]), !CACHE_STATIC.DEBUG) : '';

	return { RENDERFRAGS, STYLESHEET, STYLETAG, STAPLESHEET, INDEXSHEET, WATCHSHEET };
}

// On target stylesheet edit.
export async function Generate() {
	const OUTFILES: Record<string, string> = {};

	if (CACHE_LIVEDOCS.DeltaContent.length) {
		OUTFILES[CACHE_LIVEDOCS.DeltaPath] = CACHE_LIVEDOCS.DeltaContent;
	} else {

		const ATTACHMENTS = await Synthasize();
		const { RENDERFRAGS, STYLESHEET, STYLETAG, STAPLESHEET } = GenFinalSheets(ATTACHMENTS);


		const DeployedFiles = Object.values(CACHE_STORAGE.TARGET).reduce((acc, cache) => {
			acc.push(...cache.SummonFiles(OUTFILES, STYLESHEET, STYLETAG, STAPLESHEET));
			return acc;
		}, [CACHE_LIVEDOCS.DeltaPath]);

		if (CACHE_STATIC.WATCH) {
			if (CACHE_LIVEDOCS.DeltaPath.length) {
				Object.keys(OUTFILES).forEach((filePath) => {
					if (!DeployedFiles.includes(filePath)) { delete OUTFILES[filePath]; }
				});
			}
			OUTFILES[NAVIGATE.json.manifest.path] = JSON.stringify(CACHE_LIVEDOCS.Manifest);
		} else {

			const memChart = $$.PropMap(Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
				A[K] = `${Use.string.stringMem(V)} Kb`.padStart(9, " ");
				return A;
			}, {} as Record<string, string>), $.preset.text);

			CACHE_LIVEDOCS.Report.memChart = CACHE_LIVEDOCS.ErrorCount ?
				$.MAKE($.tag.H2(CACHE_LIVEDOCS.FinalMessage, $.preset.failed), memChart, [$.list.Bullets, 0, []]) :
				$.MAKE($.tag.H2(CACHE_LIVEDOCS.FinalMessage, $.preset.success), memChart, [$.list.Bullets, 0, []]);

			CACHE_LIVEDOCS.Report.footer =
				$.MAKE($.tag.H5(`Output size : ${Use.string.stringMem(STYLESHEET)} Kb`.padStart(9, " ")));
		}
	}

	CACHE_LIVEDOCS.DeltaPath = "";
	CACHE_LIVEDOCS.DeltaContent = "";

	return {
		SaveFiles: OUTFILES,
		ConsoleReport: $.MAKE("", Object.values(CACHE_LIVEDOCS.Report).filter((string) => string !== "")),
	};
}
