import PARSE from "./parse.js";

import $ from "../Shell/main.js";
import Use from "../Utils/main.js";
import FILING from "../Data/filing.js";
import SCRIPTFILE from "../Script/file.js";

import { INDEX } from "../Data/init.js";
import { NAV, CACHE, STACK, RAW } from "../Data/cache.js";
import { t_Data_FILING, t_SelectorMeta } from "../types.js";

function _DeleteLibraryFile(filePath: string) {
	if (STACK.LIBRARIES[filePath]) {
		STACK.LIBRARIES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete STACK.LIBRARIES[filePath];
	}
}

function _DeletePortableFile(filePath: string) {
	if (STACK.PORTABLES[filePath]) {
		STACK.PORTABLES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete STACK.PORTABLES[filePath];
	}
}

function _ClearStash() {
	Object.entries(CACHE.LibraryStyle2Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.LibraryStyle2Index[selector];
	});
	Object.entries(CACHE.PortableStyle2Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.PortableStyle2Index[selector];
	});
	CACHE.PortableEssentials = [];

	Object.keys(STACK.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
	Object.keys(STACK.PORTABLES).forEach((filePath) => _DeletePortableFile(filePath));
}

function _SaveLibraryFile(filePath: string, fileContent: string) {
	if (STACK.LIBRARIES[filePath]) { _DeleteLibraryFile(filePath); }
	STACK.LIBRARIES[filePath] = FILING(
		"",
		NAV.folder.library.path,
		filePath.slice(NAV.folder.library.path.length + 1),
		fileContent, true, false
	);
}

function _SavePortableFile(filePath: string, fileContent: string) {
	if (STACK.PORTABLES[filePath]) { _DeletePortableFile(filePath); }
	STACK.PORTABLES[filePath] = FILING(
		"",
		NAV.folder.portables.path,
		filePath.slice(NAV.folder.portables.path.length + 1),
		fileContent, true, true
	);
}


/////////////////////////////////////////////////////////////////////////////

function _StackLibraryFiles() {
	let length = 0;
	const
		axiom: Record<string, t_Data_FILING[]> = {},
		cluster: Record<string, t_Data_FILING[]> = {},
		libraryTable: Record<string, { group: string, id: string }> = {};
	Object.entries(STACK.LIBRARIES).forEach(([filePath, fileData]) => {
		const { id, group } = fileData;
		libraryTable[filePath] = { group, id };
		if (group === "axiom") {
			if (!axiom[id]) { axiom[id] = []; }
			axiom[id].push(fileData);
		} else if (group === "cluster") {
			if (!cluster[id]) { cluster[id] = []; }
			cluster[id].push(fileData);
		}
		if (Number(id) > length) { length = Number(id); }
	});
	const axiomsArray = Use.array.fromNumberedObject(axiom, length);
	const clustersArray = Use.array.fromNumberedObject(cluster, length);
	return { libraryTable, axiomsArray, clustersArray };
}

function _StackPortableFiles() {
	const
		bindingArray: t_Data_FILING[] = [],
		xtylingArray: t_Data_FILING[] = [],
		portableTable: Record<string, { group: string, id: string }> = {};

	Object.entries(STACK.PORTABLES).forEach(([filePath, fileData]) => {
		fileData.id = filePath;
		const { id, group } = fileData;
		portableTable[filePath] = { group, id };
		if (group === "binding") { bindingArray.push(fileData); }
		else if (group === "xtyling") { xtylingArray.push(fileData); }
	});

	return { portableTable, bindingArray, xtylingArray };
}


/////////////////////////////////////////////////////////////////////////////


let report = "";

let axiomCount = 0;
let clusterCount = 0;
let bindingCount = 0;
let portableCount = 0;

let warnings: string[] = [];
let axiomChart: Record<string, string[]> = {};
let clusterChart: Record<string, string[]> = {};
let bindingChart: Record<string, string[]> = {};
let portableChart: Record<string, string[]> = {};

function _UpdateFiles() {
	_ClearStash();
	Object.entries(RAW.LIBRARIES).forEach(([filePath, fileContent]) => {
		_SaveLibraryFile(filePath, fileContent);
	});
	Object.entries(RAW.PORTABLES).forEach(([filePath, fileContent]) => {
		_SavePortableFile(filePath, fileContent);
	});

}

function ReRender() {
	_UpdateFiles();

	report = "";
	axiomCount = 0;
	clusterCount = 0;
	portableCount = 0;
	bindingCount = 0;
	warnings = [];
	axiomChart = {};
	clusterChart = {};
	bindingChart = {};
	portableChart = {};

	const { libraryTable, axiomsArray, clustersArray } = _StackLibraryFiles();
	const { portableTable: modulesTable, bindingArray, xtylingArray: portablesArray } = _StackPortableFiles();

	const PortableEssentials: unknown[][] = [];
	const XtylingStyleSkeleton = portablesArray.reduce((collection: Record<string, Record<string, t_SelectorMeta>>, fileData) => {
		const filePath = NAV.folder.portables + "/" + fileData.filePath;
		const tagStash = SCRIPTFILE(fileData).stylesList, indexMetaCollection: Record<string, t_SelectorMeta> = {};
		tagStash.forEach((style) => {
			style.scope = "xtyling";
			const response = PARSE.TAGSTYLE(style, fileData, CACHE.PortableStyle2Index,);

			warnings.push(...response.errors);

			if (response.selector === "") {
				PortableEssentials.push(...response.essentials);
				if (!RAW.WATCH) { fileData.styleData.essentials.push(...response.essentials); }
			} else if (response.isOriginal) {
				fileData.styleData.usedIndexes.add(response.index);
				indexMetaCollection[response.selector] = response.metadata;
				portableCount++;
			}
		});
		collection[filePath] = indexMetaCollection;
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) { portableChart[`Portable [${fileData.filePath}]: ${classNames.length} Classes`] = classNames; }
		return collection;
	}, {});

	const BindingStyleSkeleton = bindingArray.reduce((collection: Record<string, Record<string, t_SelectorMeta>>, fileData) => {
		const result = PARSE.CSSLIBRARY([fileData], "BINDING", true);
		collection[NAV.folder.portables + "/" + fileData.filePath] = result.indexMetaCollection;
		if (result.selectorList.length) { bindingChart[`Binding [${fileData.filePath}]: ${result.selectorList.length} Classes`] = result.selectorList; }
		bindingCount += result.selectorList.length;
		return collection;
	}, {});


	const AxiomStyleSkeleton = axiomsArray.reduce((collection: Record<string, Record<string, t_SelectorMeta>>, fileData, index) => {
		const result = PARSE.CSSLIBRARY(fileData, "AXIOM");
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) { axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
		axiomCount += result.selectorList.length;
		return collection;
	}, {});

	const ClusterStyleSkeleton = clustersArray.reduce((collection: Record<string, Record<string, t_SelectorMeta>>, level, index) => {
		const result = PARSE.CSSLIBRARY(level, "CLUSTER");
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) { clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
		clusterCount += result.selectorList.length;
		return collection;
	}, {});

	Object.values(CACHE.PortableStyle2Index).forEach((index) => {
		const InStash = INDEX.IMPORT(index);
		if (InStash.metadata.declarations.length > 1) {
			warnings.push(
				$.MOLD.warning.List(
					"Multiple portable declarations: " + InStash.selector,
					InStash.declarations,
					$.list.text.Bullets,
				),
			);
		}
	});

	Object.values(CACHE.LibraryStyle2Index).forEach((index) => {
		const InStash = INDEX.IMPORT(index);
		if (InStash.declarations.length > 1) {
			warnings.push(
				$.MOLD.warning.List(
					"Multiple Library declarations: " + InStash.selector,
					InStash.declarations,
					$.list.text.Bullets,
				),
			);
		}
	});

	report = [
		$.MOLD.primary.Section(
			`Axioms: ${axiomCount}`,
			Object.entries(axiomChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
		$.MOLD.primary.Section(
			`Clusters: ${clusterCount}`,
			Object.entries(clusterChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
		$.MOLD.primary.Section(
			`Bindings: ${bindingCount}`,
			Object.entries(bindingChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
		$.MOLD.primary.Section(
			`Xtylings: ${portableCount}`,
			Object.entries(portableChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
	].join("");

	const nameCollitions: string[] | undefined = [];
	Object.values(STACK.PORTABLES).forEach((F) => {
		if (RAW.PACKAGE === F.fileName) { nameCollitions.push(F.sourcePath); }
	});
	if (nameCollitions.length) { warnings.push($.MOLD.warning.List(`Package-name collitions: ${RAW.PACKAGE}`, nameCollitions, $.list.failed.Bullets)); }

	return {
		libraryTable,
		modulesTable,
		nameCollitions,
		PortableEssentials,
		AxiomStyleSkeleton,
		ClusterStyleSkeleton,
		BindingStyleSkeleton,
		XtylingStyleSkeleton,
	};
}

function ReDeclare() {
	Object.values(CACHE.LibraryStyle2Index).forEach((val) => {
		const value = CACHE.Index2StylesObject[val];
		value.metadata.declarations = [...value.declarations];
	});
}

function Appendix(indexes: number[] = []) {
	const stash: Record<string, { readme: string[], binding: number[], xtyling: number[] }> = {}, essentials: [string, string|object][] = [];

	if (!RAW.WATCH) {
		const usedPortables = Object.values(CACHE.PortableStyle2Index).filter(i => indexes.includes(i))
			.reduce((a, c) => { a.add(INDEX.IMPORT(c).portable); return a; }, new Set());

		Object.values(STACK.PORTABLES).forEach((F) => {
			if (usedPortables.has(F.fileName)) {
				if (F.extension === "md") {
					if (stash[F.fileName]) { stash[F.fileName].readme.push(F.content); }
					else { stash[F.fileName] = { readme: [F.content], binding: [], xtyling: [] }; }
				} else if (F.extension === "xcss") {
					if (stash[F.fileName]) { F.styleData.usedIndexes.forEach((i: number) => stash[F.fileName].xtyling.push(i)); }
					else { stash[F.fileName] = { readme: [], binding: [], xtyling: Array.from(F.styleData.usedIndexes) }; }
				} else if (F.extension === "css") {
					if (stash[F.fileName]) { F.styleData.usedIndexes.forEach((i: number) => stash[F.fileName].binding.push(i)); }
					else { stash[F.fileName] = { readme: [], binding: Array.from(F.styleData.usedIndexes), xtyling: [] }; }
				}
				essentials.push(...F.styleData.essentials);
			}
		});
	}

	return {
		essentials,
		warnings,
		report,
		stash
	};
}

export default {
	ReRender,
	ReDeclare,
	Appendix,
};
