import $ from "./Shell/index.js";
import Use from "./Utils/index.js";
import HASHRULE from "./hash-rules.js";
import STYLE from "./Style/parse.js";
import COMPILE from "./Style/render.js";
import FORGE from "./Style/forge.js";
import ORDER from "./Worker/order-api.js";
import SCRIPT from "./Script/class.js";
import XTYLES from "./Style/stash.js";
import { NAV, RAW, STACK, CACHE, PUBLISH } from "./data-cache.js";
import { INDEX } from "./data-set.js";

export function UpdateXtylesFolder() {
	INDEX.RESET();
	Object.assign(CACHE, { PortableEssentials: [], LibraryStyle2Index: {}, PortableStyle2Index: {} });
	Object.assign(STACK, { LIBRARIES: {}, PORTABLES: {} });

	const {
		libraryTable,
		modulesTable,
		ModuleEssentials,
		AxiomStyleSkeleton,
		ClusterStyleSkeleton,
		PortableStyleSkeleton,
		BindingStyleSkeleton,
	} = XTYLES.ReRender();

	PUBLISH.MANIFEST.axiom = AxiomStyleSkeleton;
	PUBLISH.MANIFEST.cluster = ClusterStyleSkeleton;
	PUBLISH.MANIFEST.portable = PortableStyleSkeleton;
	PUBLISH.MANIFEST.binding = BindingStyleSkeleton;

	CACHE.PortableEssentials = ModuleEssentials;
	PUBLISH.LibFilesTemp = { ...libraryTable, ...modulesTable };
	PUBLISH.LastLibINDEX = INDEX._NOW;
}

export function ProcessProxies(
	action = "upload",
	targetFolder,
	filePath,
	fileContent,
	extension,
) {
	let reCache = true;
	switch (action) {
		case "add": case "change":
			if (STACK.PROXYCACHE[targetFolder].stylesheetPath === filePath) {
				RAW.PROXYFILES[targetFolder].stylesheetContent = fileContent;
				STACK.PROXYCACHE[targetFolder].stylesheetContent = fileContent;
				reCache = false;
			} else if (STACK.PROXYCACHE[targetFolder].extensions.includes(extension)) {
				RAW.PROXYFILES[targetFolder].fileContents[filePath] = fileContent;
				PUBLISH.DeltaPath = `${STACK.PROXYCACHE[targetFolder].source}/${filePath}`;
			} else {
				PUBLISH.DeltaPath = `${STACK.PROXYCACHE[targetFolder].source}/${filePath}`;
				PUBLISH.DeltaContent = fileContent;
				reCache = false;
			}
			break;
		case "unlink":
			if (RAW.PROXYFILES[targetFolder]) delete RAW.PROXYFILES[targetFolder].fileContents[filePath];
			break;
		default:
			PUBLISH.Report.hashrule = HASHRULE.UPLOAD();
			PUBLISH.MANIFEST.hashrules = CACHE.HashRule;
	}
	if (reCache) {
		// INDEX.RESET(PUBLISH.LastLibINDEX)
		Object.keys(CACHE.GlobalsStyle2Index).forEach(key => delete CACHE.GlobalsStyle2Index[key])
		Object.entries(STACK.PROXYCACHE).forEach(([key, cache]) => { cache.ClearFiles(); delete STACK.PROXYCACHE[key]; });
		Object.entries(RAW.PROXYFILES).forEach(([key, files]) => { STACK.PROXYCACHE[key] = new SCRIPT(files); });
	}
}

async function Engine() {

	const CUMULATES = {
		report: [],
		errors: [],
		styleMap: [],
		essentials: [],
		preBinds: new Set(),
		postBinds: new Set(),
	};

	Object.values(STACK.PROXYCACHE).forEach((cache) => {
		const cumulated = cache.Accumulator();

		CUMULATES.report.push(...cumulated.report);
		CUMULATES.errors.push(...cumulated.errors);
		CUMULATES.styleMap.push(...cumulated.styleMap);
		CUMULATES.essentials.push(...cumulated.essentials);
		cumulated.preBinds.forEach((bind) => CUMULATES.preBinds.add(bind));
		cumulated.postBinds.forEach((bind) => CUMULATES.postBinds.add(bind));
	});

	PUBLISH.MANIFEST.global = {};
	PUBLISH.MANIFEST.local = {};
	PUBLISH.MANIFEST.file = PUBLISH.LibFilesTemp;
	CUMULATES.styleMap.forEach((map) => {
		PUBLISH.MANIFEST.global[map.file.id] = map.global;
		PUBLISH.MANIFEST.local[map.file.id] = map.local;
		PUBLISH.MANIFEST.file[map.file.id] = map.file;
	});


	const TRACKS = []
	Object.values(STACK.PROXYCACHE).forEach((cache) => TRACKS.push(...cache.LoadTracks()));
	if (RAW.WATCH) {
		CACHE.FinalStack = {};
		PUBLISH.FinalMessage = CUMULATES.errors.length ? "Errors in " + CUMULATES.errors.length + " Tags." : "Zero errors.";
	} else {
		let output;
		if ("publish" === RAW.CMD) {
			if (CUMULATES.errors.length) {
				RAW.CMD = "preview";
				output = await ORDER(TRACKS, RAW.CMD, RAW.ARG);
				PUBLISH.FinalMessage = "Errors in " + CUMULATES.errors.length + " Tags. Falling back to 'preview' command.";
			} else {
				output = await ORDER(TRACKS, RAW.CMD, RAW.ARG);
				if (output.status) {
					PUBLISH.FinalMessage = "Build Success.";
				} else {
					RAW.CMD = "preview";
					PUBLISH.FinalError = output.message;
					PUBLISH.FinalMessage = "Build Atttempt Failed. Fallback with Preview.";
				}
			}
		} else {
			if (CUMULATES.errors.length)
				PUBLISH.FinalMessage = CUMULATES.errors.length + " Unresolved Errors. Rectify them to proceed with 'publish' command.";
			else
				PUBLISH.FinalMessage = "Preview verified. Procceed to 'publish' using your key."
			output = await ORDER(TRACKS, RAW.CMD, RAW.ARG);
		}

		CACHE.FinalStack = output.result.reduce((A, I) => {
			A["." + INDEX.STYLE(I).class] = I;
			return A;
		}, {});
		CACHE.SortedIndexes = output.result;
	}

	return CUMULATES;
}

function createStylesheet(CUMULATES) {
	const PREBINDS = new Set(CUMULATES.preBinds);
	const POSTBINDS = new Set(CUMULATES.postBinds);
	const RENDERFRAGS = {
		INDEX: "",
		PREBINDS: "",
		RENDERED: "",
		ESSENTIALS: "",
		APPENDIX: "",
		POSTBINDS: "",
	};


	const indexScanned = STYLE.CSSCANNER(Use.code.uncomment.Css(RAW.CSSIndex), "INDEX ||");
	indexScanned.postBinds.forEach((i) => POSTBINDS.add(i));
	indexScanned.preBinds.forEach((i) => PREBINDS.add(i));
	RENDERFRAGS.INDEX = COMPILE.Stylesheet(indexScanned.object, !RAW.WATCH);
	PUBLISH.MANIFEST.constants = Object.keys(indexScanned.variables);
	PUBLISH.Report.variables = $.MOLD.primary.Section(
		"Root variables",
		PUBLISH.MANIFEST.constants,
		$.list.text.Entries,
	);


	RENDERFRAGS.ESSENTIALS = COMPILE.Stylesheet([...CACHE.PortableEssentials, ...CUMULATES.essentials], !RAW.WATCH);
	Object.values(STACK.PROXYCACHE).forEach((cache) => cache.RenderFiles(PREBINDS, POSTBINDS, RAW.CMD));
	const renderdScanned = FORGE.indexMaps(CACHE.FinalStack);
	renderdScanned.postBinds.forEach((i) => POSTBINDS.add(i));
	renderdScanned.preBinds.forEach((i) => PREBINDS.add(i));
	RENDERFRAGS.RENDERED = COMPILE.Stylesheet(renderdScanned.object, !RAW.WATCH);


	RENDERFRAGS.APPENDIX = COMPILE.Stylesheet(
		Object.values(STACK.PROXYCACHE).reduce((appendix, cache) => {
			const appendixScanned = STYLE.CSSCANNER(
				Use.code.uncomment.Css(cache.stylesheetContent),
				`APPENDIX : ${cache.targetStylesheet} ||`
			);
			appendix.push(...appendixScanned.object);
			appendixScanned.postBinds.forEach((i) => POSTBINDS.add(i));
			appendixScanned.preBinds.forEach((i) => PREBINDS.add(i));
			return appendix;
		}, []), !RAW.WATCH
	);


	const bindObjects = FORGE.bindIndex(PREBINDS, POSTBINDS);
	RENDERFRAGS.PREBINDS = COMPILE.Stylesheet(Object.entries(bindObjects.preBindsObject), !RAW.WATCH);
	RENDERFRAGS.POSTBINDS = COMPILE.Stylesheet(Object.entries(bindObjects.postBindsObject), !RAW.WATCH);

	return { RENDERFRAGS, PREBINDS, POSTBINDS };
}

// On target stylesheet edit.
export async function Generate() {
	const SAVEFILES = {};
	const CUMULATES = await Engine();
	const XRESPONSE = XTYLES.Report();

	if (PUBLISH.FinalError.length) CUMULATES.errors.push($.MOLD.failed.List(PUBLISH.FinalError))
	PUBLISH.ErrorCount = CUMULATES.errors.length;
	PUBLISH.Report.targets = $.MOLD.std.Block(CUMULATES.report);
	PUBLISH.Report.library = XRESPONSE.report;
	PUBLISH.WarningCount = XRESPONSE.warnings.length;
	PUBLISH.Report.errors = $.MOLD[PUBLISH.ErrorCount ? "failed" : "success"].Section(
		`${PUBLISH.ErrorCount} Errors & ${PUBLISH.WarningCount} Warnings`,
		[...XRESPONSE.warnings, ...CUMULATES.errors]
	);

	if (PUBLISH.DeltaContent.length) {
		SAVEFILES[PUBLISH.DeltaPath] = PUBLISH.DeltaContent;
	} else {
		const { RENDERFRAGS, PREBINDS, POSTBINDS } = createStylesheet(CUMULATES);

		const FinalStylesheet = Object.entries(RENDERFRAGS).map(([chapter, content]) =>
			RAW.WATCH ? `\n\n/* CHAPTER: ${chapter} */\n${content}\n` : content).join("");
		Object.values(STACK.PROXYCACHE).forEach((cache) => cache.SummonFiles(SAVEFILES, FinalStylesheet));

		if (RAW.WATCH) {
			if (PUBLISH.DeltaPath.length) {
				Object.keys(SAVEFILES).forEach((filePath) => {
					if (PUBLISH.DeltaPath !== filePath) delete SAVEFILES[filePath];
				});
			}
			SAVEFILES[NAV.json.manifest] = JSON.stringify(PUBLISH.MANIFEST);
		} else {
			// 		const portableMd = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".css",
			// 			portableCss = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".xcss",
			// 			portableXcss = NAV.folder.portableBundle + "/" + RAW.PACKAGE + ".md";

			// 		const portable = COMPILE.Portable(
			// 			PREBINDS,
			// 			POSTBINDS,
			// 			CUMULATES.essentials,
			// 			RAW.PACKAGE,
			// 			RAW.VERSION,
			// 		);
			// 		SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".css"] =
			// 			portable.binding;
			// 		SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".xcss"] =
			// 			portable.portable;
			// 		SAVEFILES[NAV.folder.portableNative + "/" + RAW.PACKAGE + ".md"] =
			// 			RAW.ReadMe;

			// 		readmeFiles = { [`${RAW.PACKAGE}.md`]: `# ${RAW.PACKAGE}@${RAW.VERSION}` + "\n---\n" + RAW.ReadMe };
			// 		if (SAVEFILES[portableMd]) SAVEFILES[portableMd] += RAW.ReadMe;
			// 		else SAVEFILES[portableMd] = RAW.ReadMe;
			// 		if (SAVEFILES[portableCss]) SAVEFILES[portableCss] += portable.binding;
			// 		else SAVEFILES[portableCss] = portable.binding;
			// 		if (SAVEFILES[portableXcss]) SAVEFILES[portableXcss] += portable.portable;
			// 		else SAVEFILES[portableXcss] = portable.portable;

			const memChart = {
				Index: Use.string.stringMem(RENDERFRAGS.INDEX),
				Essentials: Use.string.stringMem(RENDERFRAGS.ESSENTIALS),
				Prebinds: Use.string.stringMem(RENDERFRAGS.PREBINDS),
				Rendered: Use.string.stringMem(RENDERFRAGS.RENDERED),
				Postbinds: Use.string.stringMem(RENDERFRAGS.POSTBINDS),
				Appendix: Use.string.stringMem(RENDERFRAGS.APPENDIX),
			};
			PUBLISH.Report.memChart = $.MOLD[PUBLISH.ErrorCount ? "failed" : "success"]
				.Section(PUBLISH.FinalMessage,
					Object.entries(memChart).reduce((ch, [k, v]) => {
						ch[k] = `${v} Kb`.padStart(9, " ");
						return ch;
					}, {}), $.list.std.Props);

			PUBLISH.Report.footer = $.MOLD.std.Footer(
				"Output size :  " +
				`${Use.string.stringMem(FinalStylesheet)} Kb`.padStart(9, " "),
			);
		}
	}

	PUBLISH.DeltaPath = ""; PUBLISH.DeltaContent = "";

	return {
		SaveFiles: SAVEFILES,
		ConsoleReport: $.MOLD.std.Block(
			Object.values(PUBLISH.Report).filter((string) => string !== ""),
		),
	};
}
