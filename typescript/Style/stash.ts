import PARSE from "./parse.js";

import $ from "../Shell/main.js";
import Use from "../Utils/main.js";
import Fileman from "../fileman.js";
import FILING from "../Data/filing.js";
import SCRIPTFILE from "../Script/file.js";

import { INDEX } from "../Data/init.js";
import { t_Data_FILING, t_SelectorMeta } from "../types.js";
import { NAVIGATE, CACHE_DYNAMIC, CACHE_STORAGE, CACHE_STATIC } from "../Data/cache.js";

function _DeleteLibraryFile(filePath: string) {
	if (CACHE_STORAGE.LIBRARIES[filePath]) {
		CACHE_STORAGE.LIBRARIES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE_STORAGE.LIBRARIES[filePath];
	}
}

function _DeletePackageFile(filePath: string) {
	if (CACHE_STORAGE.PACKAGES[filePath]) {
		CACHE_STORAGE.PACKAGES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE_STORAGE.PACKAGES[filePath];
	}
}

function _ClearStash() {
	Object.entries(CACHE_DYNAMIC.LibraryClass_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE_DYNAMIC.LibraryClass_Index[selector];
	});
	Object.entries(CACHE_DYNAMIC.PackageClass_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE_DYNAMIC.PackageClass_Index[selector];
	});

	Object.keys(CACHE_STORAGE.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
	Object.keys(CACHE_STORAGE.PACKAGES).forEach((filePath) => _DeletePackageFile(filePath));
}

function _SaveLibraryFile(filePath: string, fileContent: string) {
	if (CACHE_STORAGE.LIBRARIES[filePath]) { _DeleteLibraryFile(filePath); }
	CACHE_STORAGE.LIBRARIES[filePath] = FILING(
		"",
		NAVIGATE.folder.libraries.path,
		filePath.slice(NAVIGATE.folder.libraries.path.length + 1),
		fileContent, true, false
	);
}

function _SavePackageFile(filePath: string, fileContent: string) {
	if (CACHE_STORAGE.PACKAGES[filePath]) { _DeletePackageFile(filePath); }
	CACHE_STORAGE.PACKAGES[filePath] = FILING(
		"",
		NAVIGATE.folder.packages.path,
		filePath.slice(NAVIGATE.folder.packages.path.length + 1),
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
	Object.entries(CACHE_STORAGE.LIBRARIES).forEach(([filePath, fileData]) => {
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

function _StackPackageFiles() {
	const
		bindingArray: t_Data_FILING[] = [],
		xtylingArray: t_Data_FILING[] = [],
		packageTable: Record<string, { group: string, id: string }> = {};

	Object.entries(CACHE_STORAGE.PACKAGES).forEach(([filePath, fileData]) => {
		fileData.id = filePath;
		const { id, group } = fileData;
		packageTable[filePath] = { group, id };
		if (group === "binding") { bindingArray.push(fileData); }
		else if (group === "xtyling") { xtylingArray.push(fileData); }
	});

	return { packageTable, bindingArray, xtylingArray };
}


/////////////////////////////////////////////////////////////////////////////


let report = "";

let axiomCount = 0;
let clusterCount = 0;
let bindingCount = 0;
let packageCount = 0;

let warnings: string[] = [];
let axiomChart: Record<string, string[]> = {};
let clusterChart: Record<string, string[]> = {};
let bindingChart: Record<string, string[]> = {};
let packageChart: Record<string, string[]> = {};

function _UpdateFiles() {
	_ClearStash();
	Object.entries(CACHE_STATIC.LIBRARIES).forEach(([filePath, fileContent]) => {
		_SaveLibraryFile(filePath, fileContent);
	});
	Object.entries(CACHE_STATIC.PACKAGES).forEach(([filePath, fileContent]) => {
		_SavePackageFile(filePath, fileContent);
	});

}

function ReRender() {
	_UpdateFiles();

	report = "";
	axiomCount = 0;
	clusterCount = 0;
	packageCount = 0;
	bindingCount = 0;
	warnings = [];
	axiomChart = {};
	clusterChart = {};
	bindingChart = {};
	packageChart = {};

	const { libraryTable, axiomsArray, clustersArray } = _StackLibraryFiles();
	console.log(libraryTable);
	console.log(axiomsArray);
	console.log(clustersArray);
	const { packageTable: modulesTable, bindingArray, xtylingArray: packagesArray } = _StackPackageFiles();

	const PackageEssentials: [string, string | object][] = [];
	const XtylingStyleSkeleton = packagesArray.reduce((collection: Record<string, Record<string, t_SelectorMeta>>, fileData) => {
		const filePath = Fileman.path.join(NAVIGATE.folder.packages.path, fileData.filePath);
		const tagStash = SCRIPTFILE(fileData).stylesList, indexMetaCollection: Record<string, t_SelectorMeta> = {};
		tagStash.forEach((style) => {
			style.scope = "package";
			const response = PARSE.TAGSTYLE(style, fileData, CACHE_DYNAMIC.PackageClass_Index,);

			warnings.push(...response.errors);

			if (response.selector === "") {
				PackageEssentials.push(...response.essentials);
				if (!CACHE_STATIC.WATCH) { fileData.styleData.essentials.push(...response.essentials); }
			} else if (response.isOriginal) {
				fileData.styleData.usedIndexes.add(response.index);
				indexMetaCollection[response.selector] = response.metadata;
				packageCount++;
			}
		});
		collection[filePath] = indexMetaCollection;
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) { packageChart[`Package [${fileData.filePath}]: ${classNames.length} Classes`] = classNames; }
		return collection;
	}, {});

	const BindingStyleSkeleton = bindingArray.reduce((collection: Record<string, Record<string, t_SelectorMeta>>, fileData) => {
		const result = PARSE.CSSLIBRARY([fileData], "BINDING", true);
		collection[Fileman.path.join(NAVIGATE.folder.packages.path, fileData.filePath)] = result.indexMetaCollection;
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

	Object.values(CACHE_DYNAMIC.PackageClass_Index).forEach((index) => {
		const InStash = INDEX.IMPORT(index);
		if (InStash.metadata.declarations.length > 1) {
			warnings.push(
				$.MOLD.warning.List(
					"Multiple package declarations: " + InStash.selector,
					InStash.declarations,
					$.list.text.Bullets,
				),
			);
		}
	});

	Object.values(CACHE_DYNAMIC.LibraryClass_Index).forEach((index) => {
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
			`Xtylings: ${packageCount}`,
			Object.entries(packageChart).map(([heading, entries]) =>
				$.MOLD.tertiary.Topic(heading, entries, $.list.text.Entries),
			),
		),
	].join("");

	const nameCollitions: string[] | undefined = [];
	Object.values(CACHE_STORAGE.PACKAGES).forEach((F) => {
		if (CACHE_STATIC.PROJECT_NAME === F.fileName) { nameCollitions.push(F.sourcePath); }
	});
	if (nameCollitions.length) { warnings.push($.MOLD.warning.List(`Package-name collitions: ${CACHE_STATIC.PROJECT_NAME}`, nameCollitions, $.list.failed.Bullets)); }

	return {
		libraryTable,
		modulesTable,
		nameCollitions,
		PackageEssentials,
		AxiomStyleSkeleton,
		ClusterStyleSkeleton,
		BindingStyleSkeleton,
		XtylingStyleSkeleton,
	};
}

function ReDeclare() {
	Object.values(CACHE_DYNAMIC.LibraryClass_Index).forEach((val) => {
		const value = CACHE_DYNAMIC.Index_ClassData[val];
		value.metadata.declarations = [...value.declarations];
	});
}

function Appendix(indexes: number[] = []) {
	const stash: Record<string, { readme: string[], binding: number[], xtyling: number[] }> = {}, essentials: [string, string | object][] = [];

	if (!CACHE_STATIC.WATCH) {
		const usedPackages = Object.values(CACHE_DYNAMIC.PackageClass_Index).filter(i => indexes.includes(i))
			.reduce((a, c) => { a.add(INDEX.IMPORT(c).package); return a; }, new Set());

		Object.values(CACHE_STORAGE.PACKAGES).forEach((F) => {
			if (usedPackages.has(F.fileName)) {
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
