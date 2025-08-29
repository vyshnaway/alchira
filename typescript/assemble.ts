// import * as _Config from "./type/config.js";
import * as _File from "./type/file.js";
import * as _Style from "./type/style.js";
import * as _Script from "./type/script.js";
// import * as _Cache from "./type/cache.js";
import * as _Support from "./type/support.js";


import $ from "./shell/main.js";
import * as $$ from "./shell.js";
import * as CACHE from "./data/cache.js";
import * as INDEX from "./data/index.js";

import Use from "./utils/main.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./style/parse.js";
import COMPILE from "./style/render.js";
import ORDER from "./sort/order-api.js";
import SCRIPT from "./script/class.js";
import XTYLES from "./style/stash.js";
// import { GeneratePortable } from "./portable.js";

export function UpdateXtylesFolder() {
	INDEX.RESET();
	CACHE.DELTA.Manifest.prefix = CACHE.STATIC.Archive.name;
	Object.assign(CACHE.CLASS, {
		HashRule: {},
		Index_ClassData: {},
		NativeClass__Index: {},
		GlobalClass__Index: {},
		PublicClass__Index: {},
		LibraryClass_Index: {},
		PackageClass_Index: {},
		Computed_ClassMaps: {}
	});
	Object.assign(CACHE.FILES, {
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
			if (CACHE.FILES.TARGET[targetFolder].targetStylesheet === filePath) {
				CACHE.STATIC.Targets_Saved[targetFolder].stylesheetContent = fileContent;
				CACHE.FILES.TARGET[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (CACHE.FILES.TARGET[targetFolder].extensions.includes(extension)) {
				CACHE.STATIC.Targets_Saved[targetFolder].fileContents[filePath] = fileContent;
				CACHE.DELTA.DeltaPath = `${CACHE.FILES.TARGET[targetFolder].source}/${filePath}`;
			} else {
				CACHE.DELTA.DeltaPath = `${CACHE.FILES.TARGET[targetFolder].source}/${filePath}`;
				CACHE.DELTA.DeltaContent = fileContent;
				reCache = false;
			}
			break;
		case "unlink":
			if (CACHE.STATIC.Targets_Saved[targetFolder]) {
				delete CACHE.STATIC.Targets_Saved[targetFolder].fileContents[filePath];
			}
			break;
		default:
			CACHE.DELTA.Report.hashrule = HASHRULE.UPLOAD();
			CACHE.DELTA.Manifest.hashrules = CACHE.CLASS.HashRule;
	}

	if (reCache) {
		XTYLES.ReDeclare();

		CACHE.CLASS.Public__Index = {};
		CACHE.CLASS.Global__Index = {};

		Object.entries(CACHE.FILES.TARGET).forEach(([key, cache]) => {
			cache.ClearFiles();
			delete CACHE.FILES.TARGET[key];
		});
		// console.log(CACHE.STATIC);
		// console.log(CACHE.FILES);
		Object.entries(CACHE.STATIC.Targets_Saved).forEach(([key, files], index) => {
			CACHE.FILES.TARGET[key] = new SCRIPT(files, Use.string.enCounter(index + 768));
			console.log(CACHE.FILES.TARGET[key]);
		});
	}
}

function SaveClassRefs(stash: _Style.SortedOutput) {
	CACHE.CLASS.Sync_ClassDictionary = stash.referenceMap;
	CACHE.CLASS.Sync_PublishIndexMap = Object.entries(stash.indexMap).reduce((A, [classname, index]) => {
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


	Object.values(CACHE.FILES.TARGET).forEach((cache) => {
		const C = cache.Accumulator();
		CUMULATES.report.push(...C.report);
		CUMULATES.errors.push(...C.errors);
		CUMULATES.diagnostics.push(...C.diagnostics);
		CUMULATES.usedIndexes.push(...C.usedIndexes);
		Object.assign(CUMULATES.globalClasses, C.globalClasses);
		Object.assign(CUMULATES.publicClasses, C.publicClasses);
		Object.assign(CUMULATES.fileManifests, C.fileManifests);
	});

	CACHE.CLASS.Global__Index = CUMULATES.globalClasses;
	CACHE.CLASS.Public__Index = CUMULATES.publicClasses;
	CACHE.CLASS.Archive_Index = Object.fromEntries([
		...Object.entries(CACHE.CLASS.Global__Index).map(([s, i]) => [`/${CACHE.STATIC.Archive.name}/${s}`, i]),
		...Object.entries(CACHE.CLASS.Public__Index).map(([s, i]) => [`/${CACHE.STATIC.Archive.name}/${s}`, i]),
	]);
	CACHE.CLASS.Arcbind_Index =
		Object.fromEntries(Object.entries(CACHE.CLASS.Library_Index).map(([s, i]) => [`/${CACHE.STATIC.Archive.name}/$/${s}`, i]));


	CACHE.DELTA.Lookup.project = {};
	CACHE.DELTA.Manifest.LOCAL = {};
	CACHE.DELTA.Manifest.GLOBAL = {};

	Object.entries(CUMULATES.fileManifests).forEach(([K, V]) => {
		CACHE.DELTA.Manifest.GLOBAL[K] = { ...V.public, ...V.global };
		CACHE.DELTA.Manifest.LOCAL[K] = V.local;
		CACHE.DELTA.Lookup.project[K] = V.refer;
	});

	CACHE.DELTA.Manifest.file = Object.values(CACHE.DELTA.Lookup).reduce((A, V) => {
		Object.assign(A, V);
		return A;
	}, {} as Record<string, _File.Lookup>);



	CACHE.DELTA.Errors.project = CUMULATES.errors;
	CACHE.DELTA.Diagnostics.project = CUMULATES.diagnostics;
	CACHE.DELTA.Report.project = $.MAKE("", CUMULATES.report);

	CACHE.DELTA.Manifest.errors = Object.values(CACHE.DELTA.Diagnostics).reduce((A, V) => {
		A.push(...V);
		return A;
	}, [] as _Support.Diagnostic[]);


	const ERRORS = Object.values(CACHE.DELTA.Errors).reduce((A, I) => { A.push(...I); return A; }, [] as string[]);

	CACHE.DELTA.ErrorCount = ERRORS.length;
	CACHE.DELTA.Report.errors = $.MAKE(
		$.tag.H2(`${CACHE.DELTA.ErrorCount} Errors`, CACHE.DELTA.ErrorCount ? $.preset.failed : $.preset.success),
		ERRORS
	);

	return CUMULATES;
}


async function Synthasize() {

	Accumulate();

	const CLASSESLIST: number[][] = [];
	const ATTACHMENTS = new Set<number>();
	const ERRORS = CACHE.DELTA.Errors.project;

	Object.values(CACHE.FILES.TARGET).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

	if (CACHE.STATIC.WATCH) {
		CACHE.CLASS.Sync_PublishIndexMap = {};
		CACHE.CLASS.Sync_ClassDictionary = {};
		CACHE.DELTA.FinalMessage = ERRORS.length + " Errors.";
	} else {

		if (CACHE.STATIC.Command === "preview") {
			const response = await ORDER(CLASSESLIST, CACHE.STATIC.Command, CACHE.STATIC.Argument);
			SaveClassRefs(response.result);

			if (CACHE.DELTA.Manifest.errors.length) {
				CACHE.DELTA.FinalMessage = ERRORS.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
			} else {
				CACHE.DELTA.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
			}
		}

		if (CACHE.STATIC.Command === "publish") {
			if (CACHE.DELTA.Manifest.errors.length) {
				const response = await ORDER(CLASSESLIST, "preview", CACHE.STATIC.Argument);
				CACHE.STATIC.Command = "preview";
				SaveClassRefs(response.result);

				CACHE.DELTA.FinalMessage = "Errors in " + ERRORS.length + " Tags. Falling back to 'preview' command.";
			} else {
				// const json = GeneratePortable(CUMULATES.essentials);
				const response = await ORDER(CLASSESLIST, CACHE.STATIC.Command, CACHE.STATIC.Argument);
				SaveClassRefs(response.result);

				if (response.status) {
					CACHE.DELTA.FinalMessage = "Build Success.";
				} else {
					CACHE.DELTA.PublishError = response.message;
					CACHE.DELTA.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
				}
			}
		}
	}

	return ATTACHMENTS;
}


function GenFinalSheets(ATTACHMENTS: Set<number>) {

	const RENDERFRAGS = {
		Root: "",
		Class: "",
		Attach: "",
		Appendix: "",
	};

	const targetRenderAction: _Script.Actions = (CACHE.STATIC.Command === "debug") ? "monitor"
		: (CACHE.STATIC.Command === "preview" && CACHE.STATIC.Argument === "watch") ? "watch" : "sync";
	Object.values(CACHE.FILES.TARGET).forEach((cache) => cache.RenderFiles(targetRenderAction));

	RENDERFRAGS.Class = COMPILE.Prefixed(
		Object.entries(CACHE.CLASS.Sync_PublishIndexMap).map(([K, V]) => [K, INDEX.FETCH(V)]),
		CACHE.STATIC.DEBUG
	);


	const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(CACHE.STATIC.RootCSS), "INDEX ||");
	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment, false).index));
	const INDEXSHEET = RENDERFRAGS.Root = COMPILE.Prefixed(indexScanned.object, CACHE.STATIC.DEBUG);

	CACHE.DELTA.Manifest.constants = Object.keys(indexScanned.variables);
	CACHE.DELTA.Report.constants = $$.BulletCatalog("Root variables", CACHE.DELTA.Manifest.constants);


	RENDERFRAGS.Appendix = COMPILE.Prefixed(
		Object.values(CACHE.FILES.TARGET).reduce((appendix, cache) => {
			const appendixScanned = STYLE.CSSCANNER(
				cache.stylesheetContent,
				`APPENDIX : ${cache.targetStylesheet} ||`
			);
			appendix.push(...appendixScanned.object);
			appendixScanned.attachments.forEach((i) => ATTACHMENTS.add(INDEX.FIND(i).index));
			return appendix;
		}, [] as [string, string | object][]), !CACHE.STATIC.DEBUG
	);


	const ATTACH_STAPLES: string[] = [];
	const ATTACH_OBJECTS = Array.from(ATTACHMENTS).map(attachment => {
		const ClassData = INDEX.FETCH(attachment);
		if (ClassData.attached_staple.length) {
			ATTACH_STAPLES.push(ClassData.attached_staple);
		}
		return ClassData.attached_style;
	});

	RENDERFRAGS.Attach = COMPILE.Prefixed(Object.entries(ATTACH_OBJECTS), !CACHE.STATIC.DEBUG);



	const STYLESHEET = Object.entries(RENDERFRAGS).map(([chapter, content]) =>
		CACHE.STATIC.DEBUG ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
	const STAPLESHEET = ATTACH_STAPLES.join("\n");
	const STYLETAG = `<style>${STYLESHEET}</style>`;
	const WATCHSHEET = CACHE.STATIC.WATCH
		? COMPILE.Prefixed(Object.values(CACHE.CLASS.Index_to_Data).reduce((A, D) => {
			A.push([D.watchclass, D.object], Object.entries(D.attached_style) as [string, string | object]);
			return A;
		}, [] as [string, string | object][]), !CACHE.STATIC.DEBUG) : '';

	return { RENDERFRAGS, STYLESHEET, STYLETAG, STAPLESHEET, INDEXSHEET, WATCHSHEET };
}

// On target stylesheet edit.
export async function Generate() {
	const OUTFILES: Record<string, string> = {};

	if (CACHE.DELTA.DeltaContent.length) {
		OUTFILES[CACHE.DELTA.DeltaPath] = CACHE.DELTA.DeltaContent;
	} else {

		const ATTACHMENTS = await Synthasize();
		const {
			RENDERFRAGS,
			STYLESHEET,
			STYLETAG,
			STAPLESHEET,
			INDEXSHEET,
			WATCHSHEET
		} = GenFinalSheets(ATTACHMENTS);


		const DeployedFiles = Object.values(CACHE.FILES.TARGET).reduce((acc, cache) => {
			acc.push(...cache.SummonFiles(OUTFILES, STYLESHEET, STYLETAG, STAPLESHEET));
			return acc;
		}, [CACHE.DELTA.DeltaPath]);

		if (CACHE.STATIC.WATCH) {
			if (CACHE.DELTA.DeltaPath.length) {
				Object.keys(OUTFILES).forEach((filePath) => {
					if (!DeployedFiles.includes(filePath)) { delete OUTFILES[filePath]; }
				});
			}
			OUTFILES[CACHE.PATH.autogen.manifest.path] = JSON.stringify(CACHE.DELTA.Manifest);
			OUTFILES[CACHE.PATH.autogen.index.path] = INDEXSHEET;
			OUTFILES[CACHE.PATH.autogen.styles.path] = WATCHSHEET;
		} else {
			const memChart = Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
				A[K] = `${Use.string.stringMem(V)} Kb`.padStart(9, " ");
				return A;
			}, {} as Record<string, string>);

			memChart["FINAL-SIZE"] = `${Use.string.stringMem(STYLESHEET)} Kb`.padStart(9, " ");

			CACHE.DELTA.Report.memChart = $.MAKE(
				$.tag.H2(CACHE.DELTA.FinalMessage, CACHE.DELTA.ErrorCount ? $.preset.failed : $.preset.success),
				$$.ListProps(memChart, [...$.preset.primary, $.style.AS_Bold], [...$.preset.tertiary, $.style.AS_Bold])
			);

		}
	}

	CACHE.DELTA.DeltaPath = "";
	CACHE.DELTA.DeltaContent = "";

	return {
		SaveFiles: OUTFILES,
		ConsoleReport: $.MAKE("", Object.values(CACHE.DELTA.Report).filter((string) => string !== "")),
	};
}
