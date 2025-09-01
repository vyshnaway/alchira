// import * as _Config from "./type/config.js";
// import * as _File from "./type/file.js";
import * as _Style from "./type/style.js";
import * as _Script from "./type/script.js";
// import * as _Cache from "./type/cache.js";
// import * as _Support from "./type/support.js";


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
	CACHE.DELTA.Manifest.prefix = CACHE.STATIC.Artifact.name;
	Object.values(CACHE.CLASS).forEach(V => { for (const v in V) { delete V[v]; } });
	Object.values(CACHE.FILES).forEach(V => { for (const v in V) { delete V[v]; } });
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
			if (CACHE.FILES.TARGETS[targetFolder].targetStylesheet === filePath) {
				CACHE.STATIC.Targets_Saved[targetFolder].stylesheetContent = fileContent;
				CACHE.FILES.TARGETS[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (CACHE.FILES.TARGETS[targetFolder].extensions.includes(extension)) {
				CACHE.STATIC.Targets_Saved[targetFolder].fileContents[filePath] = fileContent;
				CACHE.DELTA.DeltaPath = `${CACHE.FILES.TARGETS[targetFolder].source}/${filePath}`;
			} else {
				CACHE.DELTA.DeltaPath = `${CACHE.FILES.TARGETS[targetFolder].source}/${filePath}`;
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
			HASHRULE.UPLOAD();
	}

	if (reCache) {
		XTYLES.ReDeclare();

		Object.entries(CACHE.FILES.TARGETS).forEach(([key, cache]) => {
			cache.ClearFiles();
			delete CACHE.FILES.TARGETS[key];
		});
		Object.entries(CACHE.STATIC.Targets_Saved).forEach(([key, files], index) => {
			CACHE.FILES.TARGETS[key] = new SCRIPT(files, Use.string.enCounter(index));
		});
	}
}



async function Accumulate() {

	const CUMULATED: _Script.Cumulated = {
		report: [],
		globalClasses: {},
		publicClasses: {},
		fileManifests: {},
	};


	Object.values(CACHE.FILES.TARGETS).forEach((cache) => {
		const C = cache.Accumulator();
		CUMULATED.report.push(...C.report);
		Object.assign(CUMULATED.globalClasses, C.globalClasses);
		Object.assign(CUMULATED.publicClasses, C.publicClasses);
		Object.assign(CUMULATED.fileManifests, C.fileManifests);
	});
	CACHE.DELTA.Report.artifacts = $.MAKE("", CUMULATED.report);

	CACHE.CLASS.Global___Index = CUMULATED.globalClasses;
	CACHE.CLASS.Public___Index = CUMULATED.publicClasses;
	CACHE.CLASS.Artifact_Index = Object.fromEntries([
		...Object.entries(CACHE.CLASS.Global___Index).map(([s, i]) => [`/${CACHE.STATIC.Artifact.name}/${s}`, i]),
		...Object.entries(CACHE.CLASS.Public___Index).map(([s, i]) => [`/${CACHE.STATIC.Artifact.name}/${s}`, i]),
	]);


	CACHE.DELTA.Lookup.artifacts = {};
	CACHE.DELTA.Manifest.LOCAL = {};
	CACHE.DELTA.Manifest.GLOBAL = {};
	CACHE.DELTA.Errors.artifacts = [];
	CACHE.DELTA.Diagnostics.artifacts = [];

	Object.entries(CUMULATED.fileManifests).forEach(([K, V]) => {
		CACHE.DELTA.Manifest.GLOBAL[K] = { ...V.public, ...V.global };
		CACHE.DELTA.Manifest.LOCAL[K] = V.local;
		CACHE.DELTA.Lookup.artifacts[K] = V.lookup;
		CACHE.DELTA.Errors.artifacts.push(...V.errors);
		CACHE.DELTA.Diagnostics.artifacts.push(...V.diagnostics);
	});

	CACHE.DELTA.Manifest.filelookup = {};
	Object.values(CACHE.DELTA.Lookup).forEach((V) => Object.assign(CACHE.DELTA.Manifest.filelookup, V));


	CACHE.DELTA.Errors.multiples = [];
	CACHE.DELTA.Diagnostics.multiples = [];
	Object.values(CACHE.CLASS.Index_to_Data).forEach((data) => {
		if (data.metadata.declarations.length > 1) {
			const E = $$.GenerateError(`Duplicate Declarations: ${data.classname}`, data.metadata.declarations);
			CACHE.DELTA.Errors.multiples.push(E.error);
			CACHE.DELTA.Diagnostics.multiples.push(E.diagnostic);
		}
	});

	CACHE.DELTA.Manifest.diagnostics = [];
	Object.values(CACHE.DELTA.Diagnostics).forEach((V) => CACHE.DELTA.Manifest.diagnostics.push(...V));
	CACHE.DELTA.ErrorCount = CACHE.DELTA.Manifest.diagnostics.length;


	CACHE.DELTA.Report.errors = $.MAKE(
		$.tag.H2(`${CACHE.DELTA.ErrorCount} Errors`, CACHE.DELTA.ErrorCount ? $.preset.failed : $.preset.success),
		Object.values(CACHE.DELTA.Errors).reduce((A, I) => { A.push(...I); return A; }, [] as string[])
	);
}


function SaveClassRefs(stash: _Style.SortedOutput) {
	CACHE.CLASS.Sync_ClassDictionary = {};
	CACHE.CLASS.Sync_PublishIndexMap = {};

	Object.entries(stash.referenceMap).forEach(([iArray, iMap]) => {
		CACHE.CLASS.Sync_ClassDictionary[iArray] = Object.fromEntries(Object.entries(iMap).map(([ref, id]) => {
			const className = "_" + Use.string.enCounter(id);
			CACHE.CLASS.Sync_PublishIndexMap[`.${className}`] = Number(ref);
			return [ref, className];
		}));
	}, {} as _Style.ClassIndexMap);
}

async function Synthasize() {

	Accumulate();

	const CLASSESLIST: number[][] = [];
	const ATTACHMENTS: number[] = [];
	Object.values(CACHE.FILES.TARGETS).forEach((cache) => cache.GetTracks(CLASSESLIST, ATTACHMENTS));

	if (CACHE.STATIC.WATCH) {
		CACHE.CLASS.Sync_PublishIndexMap = {};
		CACHE.CLASS.Sync_ClassDictionary = {};
		CACHE.DELTA.FinalMessage = CACHE.DELTA.ErrorCount + " Errors.";
	} else {

		if (CACHE.STATIC.Command === "preview") {
			const response = await ORDER(CLASSESLIST, CACHE.STATIC.Command, CACHE.STATIC.Argument);
			SaveClassRefs(response.result);

			if (CACHE.DELTA.Manifest.diagnostics.length) {
				CACHE.DELTA.FinalMessage = CACHE.DELTA.ErrorCount + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
			} else {
				CACHE.DELTA.FinalMessage = "Preview verified with no major errors. Procceed to 'publish' using your key.";
			}
		}

		if (CACHE.STATIC.Command === "publish") {
			if (CACHE.DELTA.Manifest.diagnostics.length) {
				const response = await ORDER(CLASSESLIST, "preview", CACHE.STATIC.Argument);
				CACHE.STATIC.Command = "preview";
				SaveClassRefs(response.result);

				CACHE.DELTA.FinalMessage = "Errors in " + CACHE.DELTA.ErrorCount + " Tags. Falling back to 'preview' command.";
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


	const indexScanned = STYLE.CSSFileScanner(Use.code.uncomment.Css(CACHE.STATIC.RootCSS), "INDEX ||", false);
	CACHE.DELTA.Manifest.constants = Object.keys(indexScanned.constants);
	CACHE.DELTA.Report.constants = $$.ListCatalog("Root Constants", CACHE.DELTA.Manifest.constants);
	indexScanned.attachments.forEach((attachment) => ATTACHMENTS.add(INDEX.FIND(attachment, false).index));
	const WATCHINDEX = RENDERFRAGS.Root = COMPILE.Prefixed(indexScanned.styles);


	RENDERFRAGS.Appendix = COMPILE.Prefixed(
		Object.values(CACHE.FILES.TARGETS).reduce((appendix, cache) => {
			const appendixScanned = STYLE.CSSFileScanner(cache.stylesheetContent, `APPENDIX : ${cache.targetStylesheet} ||`, true);
			appendix.push(...appendixScanned.styles);
			appendixScanned.attachments.forEach((i) => {
				const found = INDEX.FIND(i).index;
				if (found) { ATTACHMENTS.add(INDEX.FIND(i).index); }
			});
			return appendix;
		}, [] as [string, string | object][])
	);


	const ATTACH_STAPLES: string[] = [];
	const ATTACH_STYLES: [string, object | string][] = [];
	ATTACHMENTS.forEach(attachment => {
		const ClassData = INDEX.FETCH(attachment);
		const AttachedStyle = Object.entries(ClassData.attached_style);
		if (AttachedStyle.length) { ATTACH_STYLES.push(...AttachedStyle); }
		if (ClassData.metadata.staple.length) { ATTACH_STAPLES.push(ClassData.metadata.staple); }
		return ClassData.attached_style;
	});
	RENDERFRAGS.Attach = COMPILE.Prefixed(ATTACH_STYLES);


	const targetRenderAction: _Script._Actions = (CACHE.STATIC.Command === "debug") ? _Script._Actions.monitor
		: (CACHE.STATIC.Command === "preview" && CACHE.STATIC.Argument === "watch") ? _Script._Actions.watch : _Script._Actions.sync;
	Object.values(CACHE.FILES.TARGETS).forEach((cache) => cache.SyncClassnames(targetRenderAction));
	RENDERFRAGS.Class = COMPILE.Switched(CACHE.CLASS.Sync_PublishIndexMap);

	// console.log(CACHE.CLASS.Index_to_Data);

	const WATCHCLASS = CACHE.STATIC.WATCH
		? COMPILE.Switched(
			Object.entries(CACHE.CLASS.Index_to_Data).reduce((A, [I, D]) => {
				A['.__' + D.metadata.watch] = Number(I);
				return A;
			}, {} as Record<string, number>)
		) : '';
	const STYLESHEET = Object.entries(RENDERFRAGS).map(([chapter, content]) =>
		CACHE.STATIC.DEBUG ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
	const STAPLEBLOCK = CACHE.STATIC.DEBUG ? ATTACH_STAPLES.join("\n") :
		Use.code.uncomment.Script(ATTACH_STAPLES.join(""), false, false, true);


	return { RENDERFRAGS, STAPLEBLOCK, STYLESHEET, WATCHINDEX, WATCHCLASS };
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
			STAPLEBLOCK,
			WATCHINDEX,
			WATCHCLASS
		} = GenFinalSheets(new Set(ATTACHMENTS));

		const STYLEBLOCK = `<style>${STYLESHEET}</style>`;
		const SUMMONBLOCK = `${STYLEBLOCK}\n${STAPLEBLOCK}`;
		Object.values(CACHE.FILES.TARGETS).forEach((cache) => {
			cache.SummonFiles(OUTFILES, STYLESHEET, SUMMONBLOCK);
		}, [CACHE.DELTA.DeltaPath]);

		if (CACHE.STATIC.WATCH) {
			OUTFILES[CACHE.PATH.autogen.manifest.path] = JSON.stringify(CACHE.DELTA.Manifest);
			OUTFILES[CACHE.PATH.autogen.index.path] = WATCHINDEX;
			OUTFILES[CACHE.PATH.autogen.styles.path] = WATCHCLASS;
		} else {
			const memChart = Object.entries(RENDERFRAGS).reduce((A, [K, V]) => {
				A[K] = `${Use.string.stringMem(V)} Kb`.padStart(9, " ");
				return A;
			}, {} as Record<string, string>);

			memChart[`[final.css]`] = `${Use.string.stringMem(STYLESHEET)} Kb`.padStart(9, " ");

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
