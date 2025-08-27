import $ from "./shell/main.js";
import * as $$ from "./shell.js";
import Use from "./utils/main.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./style/parse.js";
import COMPILE from "./style/render.js";
import ORDER from "./sort/order-api.js";
import SCRIPT from "./script/class.js";
import XTYLES from "./style/stash.js";
import { STATIC, STORAGE, DYNAMIC, LIVEDOCS, _PATH } from "./data/cache.js";
import { INDEX } from "./data/action.js";
// import { GeneratePortable } from "./portable.js";
import * as TYPE from "./types.js";

export function UpdateXtylesFolder() {
	INDEX.RESET();
	LIVEDOCS.Manifest.prefix = STATIC.Package.Name;
	Object.assign(DYNAMIC, {
		HashRule: {},
		Index_ClassData: {},
		NativeClass__Index: {},
		GlobalClass__Index: {},
		PublicClass__Index: {},
		LibraryClass_Index: {},
		PackageClass_Index: {},
		Computed_ClassMaps: {}
	});
	Object.assign(STORAGE, {
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
			if (STORAGE.TARGET[targetFolder].stylesheetPath === filePath) {
				STATIC.TargeAS_Saved[targetFolder].stylesheetContent = fileContent;
				STORAGE.TARGET[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (STORAGE.TARGET[targetFolder].extensions.includes(extension)) {
				STATIC.TargeAS_Saved[targetFolder].fileContents[filePath] = fileContent;
				LIVEDOCS.DeltaPath = `${STORAGE.TARGET[targetFolder].source}/${filePath}`;
			} else {
				LIVEDOCS.DeltaPath = `${STORAGE.TARGET[targetFolder].source}/${filePath}`;
				LIVEDOCS.DeltaContent = fileContent;
				reCache = false;
			}
			break;
		case "unlink":
			if (STATIC.TargeAS_Saved[targetFolder]) {
				delete STATIC.TargeAS_Saved[targetFolder].fileContents[filePath];
			}
			break;
		default:
			LIVEDOCS.Report.hashrule = HASHRULE.UPLOAD();
			LIVEDOCS.Manifest.hashrules = DYNAMIC.HashRule;
	}

	if (reCache) {
		XTYLES.ReDeclare();

		DYNAMIC.PublicClass__Index = {};
		DYNAMIC.GlobalClass__Index = {};

		Object.entries(STORAGE.TARGET).forEach(([key, cache]) => {
			cache.ClearFiles();
			delete STORAGE.TARGET[key];
		});

		Object.entries(STATIC.TargeAS_Saved).forEach(([key, files], index) => {
			STORAGE.TARGET[key] = new SCRIPT(files, Use.string.enCounter(index + 768));
		});
	}

}

function SaveClassRefs(stash: TYPE.OrganizedResult) {
	DYNAMIC.Sync_ClassDictionary = stash.referenceMap;
	DYNAMIC.Sync_PublishIndexMap = Object.entries(stash.indexMap).reduce((A, [classname, index]) => {
		A["." + classname] = index;
		return A;
	}, {} as TYPE.ClassIndexMap);
}


async function Accumulate() {

	const CUMULATES: TYPE.Cumulates = {
		report: [],
		errors: [],
		diagnostics: [],
		usedIndexes: [],
		globalClasses: {},
		publicClasses: {},
		fileManifests: {},
	};


	Object.values(STORAGE.TARGET).forEach((cache) => {
		const C = cache.Accumulator();
		CUMULATES.report.push(...C.report);
		CUMULATES.errors.push(...C.errors);
		CUMULATES.diagnostics.push(...C.diagnostics);
		CUMULATES.usedIndexes.push(...C.usedIndexes);
		Object.assign(CUMULATES.globalClasses, C.globalClasses);
		Object.assign(CUMULATES.publicClasses, C.publicClasses);
		Object.assign(CUMULATES.fileManifests, C.fileManifests);
	});

	DYNAMIC.GlobalClass__Index = CUMULATES.globalClasses;
	DYNAMIC.PublicClass__Index = CUMULATES.publicClasses;
	DYNAMIC.ArchiveClass_Index = Object.fromEntries([
		...Object.entries(DYNAMIC.GlobalClass__Index).map(([s, i]) => [`/${STATIC.Package.Name}/${s}`, i]),
		...Object.entries(DYNAMIC.PublicClass__Index).map(([s, i]) => [`/${STATIC.Package.Name}/${s}`, i]),
	]);
	DYNAMIC.ArcbindClass_Index =
		Object.fromEntries(Object.entries(DYNAMIC.LibraryClass_Index).map(([s, i]) => [`/${STATIC.Package.Name}/$/${s}`, i]));


	LIVEDOCS.Lookup.project = {};
	LIVEDOCS.Manifest.LOCAL = {};
	LIVEDOCS.Manifest.GLOBAL = {};

	Object.entries(CUMULATES.fileManifests).forEach(([K, V]) => {
		LIVEDOCS.Manifest.GLOBAL[K] = { ...V.public, ...V.global };
		LIVEDOCS.Manifest.LOCAL[K] = V.local;
		LIVEDOCS.Lookup.project[K] = V.refer;
	});

	LIVEDOCS.Manifest.file = Object.values(LIVEDOCS.Lookup).reduce((A, V) => {
		Object.assign(A, V);
		return A;
	}, {} as Record<string, TYPE.FILE_Reference>);



	LIVEDOCS.Errors.project = CUMULATES.errors;
	LIVEDOCS.Diagnostics.project = CUMULATES.diagnostics;
	LIVEDOCS.Report.project = $.MAKE("", (CUMULATES.report));

	LIVEDOCS.Manifest.errors = Object.values(LIVEDOCS.Diagnostics).reduce((A, V) => {
		A.push(...V);
		return A;
	}, [] as TYPE.Diagnostic[]);


	const ERRORS = Object.values(LIVEDOCS.Errors).reduce((A, I) => { A.push(...I); return A; }, [] as string[]);

	LIVEDOCS.ErrorCount = ERRORS.length;
	LIVEDOCS.Report.errors = LIVEDOCS.ErrorCount ?
		$.MAKE($.tag.H2(`${LIVEDOCS.ErrorCount} Errors`, $.preset.failed), ERRORS) :
		$.MAKE($.tag.H2(`${LIVEDOCS.ErrorCount} Errors`, $.preset.success));

	return CUMULATES;
}


async function Synthasize() {

	Accumulate();

	const CLASSESLIST: number[][] = [];
	const ATTACHMENTS = new Set<number>();
	const ERRORS = LIVEDOCS.Errors.project;

	Object.values(STORAGE.TARGET).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

	if (STATIC.WATCH) {
		DYNAMIC.Sync_PublishIndexMap = {};
		DYNAMIC.Sync_ClassDictionary = {};
		LIVEDOCS.FinalMessage = ERRORS.length + " Errors.";
	} else {

		if (STATIC.Command === "preview") {
			const response = await ORDER(CLASSESLIST, STATIC.Command, STATIC.Argument);
			SaveClassRefs(response.result);

			if (LIVEDOCS.Manifest.errors.length) {
				LIVEDOCS.FinalMessage = ERRORS.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
			} else {
				LIVEDOCS.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
			}
		}

		if (STATIC.Command === "publish") {
			if (LIVEDOCS.Manifest.errors.length) {
				const response = await ORDER(CLASSESLIST, "preview", STATIC.Argument);
				STATIC.Command = "preview";
				SaveClassRefs(response.result);

				LIVEDOCS.FinalMessage = "Errors in " + ERRORS.length + " Tags. Falling back to 'preview' command.";
			} else {
				// const json = GeneratePortable(CUMULATES.essentials);
				const response = await ORDER(CLASSESLIST, STATIC.Command, STATIC.Argument);
				SaveClassRefs(response.result);

				if (response.status) {
					LIVEDOCS.FinalMessage = "Build Success.";
				} else {
					LIVEDOCS.PublishError = response.message;
					LIVEDOCS.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
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

	const targetRenderAction: TYPE.ScriptParseActions = (STATIC.Command === "debug") ? "monitor"
		: (STATIC.Command === "preview" && STATIC.Argument === "watch") ? "watch" : "sync";
	Object.values(STORAGE.TARGET).forEach((cache) => cache.RenderFiles(targetRenderAction));

	RENDERFRAGS.CLASS = COMPILE.forPublish(
		Object.entries(DYNAMIC.Sync_PublishIndexMap).map(([K, V]) => [K, INDEX.FETCH(V)]),
		STATIC.DEBUG
	);


	const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(STATIC.RootCSS), "INDEX ||");
	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment, false).index));
	const INDEXSHEET = RENDERFRAGS.ROOT = COMPILE.forPublish(indexScanned.object, STATIC.DEBUG);

	LIVEDOCS.Manifest.constants = Object.keys(indexScanned.variables);
	LIVEDOCS.Report.constants =
		$.MAKE($.tag.H6("Root variables", $.preset.primary), LIVEDOCS.Manifest.constants, [$.list.Catalog, 0, []]);


	RENDERFRAGS.APPENDIX = COMPILE.forPublish(
		Object.values(STORAGE.TARGET).reduce((appendix, cache) => {
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
		? COMPILE.forPublish(Object.values(DYNAMIC.Index_ClassData).reduce((A, D) => {
			A.push([D.watchclass, D.object], Object.entries(D.attached_style) as [string, string | object]);
			return A;
		}, [] as [string, string | object][]), !STATIC.DEBUG) : '';

	return { RENDERFRAGS, STYLESHEET, STYLETAG, STAPLESHEET, INDEXSHEET, WATCHSHEET };
}

// On target stylesheet edit.
export async function Generate() {
	const OUTFILES: Record<string, string> = {};

	if (LIVEDOCS.DeltaContent.length) {
		OUTFILES[LIVEDOCS.DeltaPath] = LIVEDOCS.DeltaContent;
	} else {

		const ATTACHMENTS = await Synthasize();
		const { RENDERFRAGS, STYLESHEET, STYLETAG, STAPLESHEET } = GenFinalSheets(ATTACHMENTS);


		const DeployedFiles = Object.values(STORAGE.TARGET).reduce((acc, cache) => {
			acc.push(...cache.SummonFiles(OUTFILES, STYLESHEET, STYLETAG, STAPLESHEET));
			return acc;
		}, [LIVEDOCS.DeltaPath]);

		if (STATIC.WATCH) {
			if (LIVEDOCS.DeltaPath.length) {
				Object.keys(OUTFILES).forEach((filePath) => {
					if (!DeployedFiles.includes(filePath)) { delete OUTFILES[filePath]; }
				});
			}
			OUTFILES[_PATH.json.manifest.path] = JSON.stringify(LIVEDOCS.Manifest);
		} else {

			const memChart = $$.PropMap(Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
				A[K] = `${Use.string.stringMem(V)} Kb`.padStart(9, " ");
				return A;
			}, {} as Record<string, string>), $.preset.text);

			LIVEDOCS.Report.memChart = LIVEDOCS.ErrorCount ?
				$.MAKE($.tag.H2(LIVEDOCS.FinalMessage, $.preset.failed), memChart, [$.list.Bullets, 0, []]) :
				$.MAKE($.tag.H2(LIVEDOCS.FinalMessage, $.preset.success), memChart, [$.list.Bullets, 0, []]);

			LIVEDOCS.Report.footer =
				$.MAKE($.tag.H5(`Output size : ${Use.string.stringMem(STYLESHEET)} Kb`.padStart(9, " ")));
		}
	}

	LIVEDOCS.DeltaPath = "";
	LIVEDOCS.DeltaContent = "";

	return {
		SaveFiles: OUTFILES,
		ConsoleReport: $.MAKE("", Object.values(LIVEDOCS.Report).filter((string) => string !== "")),
	};
}
