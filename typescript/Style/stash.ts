import PARSE from "./parse.js";

import $ from "../Shell/main.js";
import Use from "../Utils/main.js";
import Fileman from "../fileman.js";
import FILING from "../Data/filing.js";
import SCRIPTFILE from "../Script/file.js";

import { INDEX } from "../Data/init.js";
import { t_FILE_Storage, t_FILE_Reference, t_ClassMeta } from "../types.js";
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
		filePath.slice(NAVIGATE.folder.libraries.path.length + 1),
		fileContent,
		"",
		NAVIGATE.folder.libraries.path,
		"library"
	);
}

function _SavePackageFile(filePath: string, fileContent: string) {
	if (CACHE_STORAGE.PACKAGES[filePath]) { _DeletePackageFile(filePath); }
	CACHE_STORAGE.PACKAGES[filePath] = FILING(
		filePath.slice(NAVIGATE.folder.packages.path.length + 1),
		fileContent,
		"",
		NAVIGATE.folder.packages.path,
		"package"
	);
}


/////////////////////////////////////////////////////////////////////////////

function _StackLibraryFiles() {
	let length = 0;
	const
		none: Record<string, t_FILE_Storage[]> = {},
		axiomArray: Record<string, t_FILE_Storage[]> = {},
		clusterArray: Record<string, t_FILE_Storage[]> = {},
		libraryTable: Record<string, t_FILE_Reference> = {};

	Object.entries(CACHE_STORAGE.LIBRARIES).forEach(([path, data]) => {
		const reference = data.manifest.refer;
		const collection = reference.group === "AXIOM" ? axiomArray
			: reference.group === "CLUSTER" ? clusterArray : none;

		libraryTable[path] = reference;
		if (!collection[reference.id]) { collection[reference.id] = [data]; }
		else { collection[reference.id].push(data); }

		if (Number(reference.id) > length) { length = Number(reference.id); }
	});

	const axiomsArray = Use.array.fromNumberedObject(axiomArray, length);
	const clustersArray = Use.array.fromNumberedObject(clusterArray, length);
	return { libraryTable, axiomsArray, clustersArray };
}

function _StackPackageFiles() {
	const
		none: t_FILE_Storage[] = [],
		pacbindsArray: t_FILE_Storage[] = [],
		packagesArray: t_FILE_Storage[] = [],
		packageTable: Record<string, t_FILE_Reference> = {};

	Object.entries(CACHE_STORAGE.PACKAGES).forEach(([path, data]) => {
		const reference = data.manifest.refer;
		packageTable[path] = reference;

		const collection = reference.group === "PACBIND" ? pacbindsArray
			: reference.group === "PACKAGE" ? packagesArray : none;

		collection.push(data);
	});

	return { packageTable, pacbindsArray, packagesArray };
}


/////////////////////////////////////////////////////////////////////////////


let report = "";

let axiomCount = 0;
let clusterCount = 0;
let pacbindCount = 0;
let packageCount = 0;

let warnings: string[] = [];
let axiomChart: Record<string, string[]> = {};
let clusterChart: Record<string, string[]> = {};
let pacbindChart: Record<string, string[]> = {};
let packageChart: Record<string, string[]> = {};


function ReRender() {

	_ClearStash();
	Object.entries(CACHE_STATIC.LIBRARIES).forEach(([filePath, fileContent]) => {
		_SaveLibraryFile(filePath, fileContent);
	});
	Object.entries(CACHE_STATIC.PACKAGES).forEach(([filePath, fileContent]) => {
		_SavePackageFile(filePath, fileContent);
	});

	report = "";
	axiomCount = 0;
	clusterCount = 0;
	packageCount = 0;
	pacbindCount = 0;
	warnings = [];
	axiomChart = {};
	clusterChart = {};
	pacbindChart = {};
	packageChart = {};

	const { packageTable, pacbindsArray, packagesArray } = _StackPackageFiles();


	const PackageStyleSkeleton = packagesArray.reduce((collection: Record<string, Record<string, t_ClassMeta>>, fileData) => {
		const filePath = Fileman.path.join(NAVIGATE.folder.packages.path, fileData.filePath);
		const tagStash = SCRIPTFILE(fileData).stylesList;
		const indexMetaCollection: Record<string, t_ClassMeta> = {};

		tagStash.forEach((style) => {
			style.scope = "PACKAGE";
			const response = PARSE.TAGSTYLE(style, fileData, CACHE_DYNAMIC.PackageClass_Index,);

			warnings.push(...response.errors);

			if (response.isOriginal) {
				fileData.styleData.usedIndexes.add(response.index);
				indexMetaCollection[response.selector] = INDEX.IMPORT(response.index).metadata;
				packageCount++;
			}
		});
		collection[filePath] = indexMetaCollection;
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) { packageChart[`Package [${fileData.filePath}]: ${classNames.length} Classes`] = classNames; }
		return collection;
	}, {});

	const PacbindStyleSkeleton = pacbindsArray.reduce((collection: Record<string, Record<string, t_ClassMeta>>, fileData) => {
		const result = PARSE.CSSLIBRARY([fileData], "BINDING", true);
		collection[Fileman.path.join(NAVIGATE.folder.packages.path, fileData.filePath)] = result.indexMetaCollection;
		if (result.selectorList.length) {
			pacbindChart[`Pacbind [${fileData.filePath}]: ${result.selectorList.length} Classes`] = result.selectorList;
		}
		pacbindCount += result.selectorList.length;
		return collection;
	}, {});
	console.log(PackageStyleSkeleton);


	const { libraryTable, axiomsArray, clustersArray } = _StackLibraryFiles();
	const AxiomStyleSkeleton = axiomsArray.reduce((collection: Record<string, Record<string, t_ClassMeta>>, fileData, index) => {
		const result = PARSE.CSSLIBRARY(fileData, "AXIOM");
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) {
			axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
		}
		axiomCount += result.selectorList.length;
		return collection;
	}, {});

	const ClusterStyleSkeleton = clustersArray.reduce((collection: Record<string, Record<string, t_ClassMeta>>, level, index) => {
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
			`Pacbinds: ${pacbindCount}`,
			Object.entries(pacbindChart).map(([heading, entries]) =>
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
		if (CACHE_STATIC.PROJECT_NAME === F.packageName) { nameCollitions.push(F.sourcePath); }
	});
	if (nameCollitions.length) { warnings.push($.MOLD.warning.List(`Package-name collitions: ${CACHE_STATIC.PROJECT_NAME}`, nameCollitions, $.list.failed.Bullets)); }

	return {
		libraryTable,
		modulesTable: packageTable,
		nameCollitions,
		AxiomStyleSkeleton,
		ClusterStyleSkeleton,
		PacbindStyleSkeleton,
		PackageStyleSkeleton,
	};
}

function ReDeclare() {
	Object.values(CACHE_DYNAMIC.LibraryClass_Index).forEach((val) => {
		const value = CACHE_DYNAMIC.Index_ClassData[val];
		value.metadata.declarations = [...value.declarations];
	});
}

function Appendix(indexes: number[] = []) {
	const stash: Record<string, { readme: string[], pacbind: number[], package: number[] }> = {};

	if (!CACHE_STATIC.WATCH) {
		const usedPackages = Object.values(CACHE_DYNAMIC.PackageClass_Index).filter(i => indexes.includes(i))
			.reduce((a, c) => { a.add(INDEX.IMPORT(c).package); return a; }, new Set());

		Object.values(CACHE_STORAGE.PACKAGES).forEach((F) => {
			if (usedPackages.has(F.packageName)) {
				if (F.extension === "md") {
					if (stash[F.packageName]) { stash[F.packageName].readme.push(F.content); }
					else { stash[F.packageName] = { readme: [F.content], pacbind: [], package: [] }; }
				} else if (F.extension === "xcss") {
					if (stash[F.packageName]) { F.styleData.usedIndexes.forEach((i: number) => stash[F.packageName].package.push(i)); }
					else { stash[F.packageName] = { readme: [], pacbind: [], package: Array.from(F.styleData.usedIndexes) }; }
				} else if (F.extension === "css") {
					if (stash[F.packageName]) { F.styleData.usedIndexes.forEach((i: number) => stash[F.packageName].pacbind.push(i)); }
					else { stash[F.packageName] = { readme: [], pacbind: Array.from(F.styleData.usedIndexes), package: [] }; }
				}
			}
		});
	}

	return {
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
