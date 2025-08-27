// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
import * as _Support from "../type/support.js";

import PARSE from "./parse.js";

import $ from "../shell/main.js";
import Use from "../utils/main.js";
import Fileman from "../fileman.js";
import FILING from "../data/filing.js";
import SCRIPTFILE from "../script/file.js";

import { INDEX } from "../data/action.js";
import * as CACHE from "../data/cache.js";



function _DeleteLibraryFile(filePath: string) {
	if (CACHE.STORAGE.LIBRARIES[filePath]) {
		CACHE.STORAGE.LIBRARIES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE.STORAGE.LIBRARIES[filePath];
	}
}

function _DeletePackageFile(filePath: string) {
	if (CACHE.STORAGE.PACKAGES[filePath]) {
		CACHE.STORAGE.PACKAGES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE.STORAGE.PACKAGES[filePath];
	}
}


function _ClearStash() {
	Object.entries(CACHE.DYNAMIC.LibraryClass_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.DYNAMIC.LibraryClass_Index[selector];
	});
	Object.entries(CACHE.DYNAMIC.PackageClass_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.DYNAMIC.PackageClass_Index[selector];
	});

	Object.keys(CACHE.STORAGE.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
	Object.keys(CACHE.STORAGE.PACKAGES).forEach((filePath) => _DeletePackageFile(filePath));
}


function _SaveLibraryFile(filePath: string, fileContent: string) {
	if (CACHE.STORAGE.LIBRARIES[filePath]) { _DeleteLibraryFile(filePath); }
	CACHE.STORAGE.LIBRARIES[filePath] = FILING("library", filePath, fileContent);
}

function _SavePackageFile(filePath: string, fileContent: string) {
	if (CACHE.STORAGE.PACKAGES[filePath]) { _DeletePackageFile(filePath); }
	CACHE.STORAGE.PACKAGES[filePath] = FILING("package", filePath, fileContent);
}


function _StackLibraryFiles() {
	let length = 0;
	const
		none: Record<string, _File.Storage[]> = {},
		axiomArray: Record<string, _File.Storage[]> = {},
		clusterArray: Record<string, _File.Storage[]> = {},
		libraryTable: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.STORAGE.LIBRARIES).forEach(([path, data]) => {
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
	return { LibraryLookupTable: libraryTable, axiomsArray, clustersArray };
}

function _StackPackageFiles() {
	const
		none: _File.Storage[] = [],
		pacbindsArray: _File.Storage[] = [],
		packagesArray: _File.Storage[] = [],
		packageTable: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.STORAGE.PACKAGES).forEach(([path, data]) => {
		const reference = data.manifest.refer;
		packageTable[path] = reference;

		const collection = reference.group === "PACBIND" ? pacbindsArray
			: reference.group === "PACKAGE" ? packagesArray : none;

		collection.push(data);
	});

	return { PackageLookupTable: packageTable, pacbindsArray, packagesArray };
}


/////////////////////////////////////////////////////////////////////////////



function ReRender() {

	_ClearStash();
	Object.entries(CACHE.STATIC.Library_Saved).forEach(([filePath, fileContent]) => {
		_SaveLibraryFile(filePath, fileContent);
	});
	Object.entries(CACHE.STATIC.Package_Saved).forEach(([filePath, fileContent]) => {
		_SavePackageFile(filePath, fileContent);
	});




	const pacbindChart: Record<string, string[]> = {};
	const packageChart: Record<string, string[]> = {};
	const { PackageLookupTable, pacbindsArray, packagesArray } = _StackPackageFiles();


	const PackageStyleSkeleton = packagesArray.reduce((collection, fileData) => {
		const indexMetaCollection = collection[fileData.filePath] = {} as Record<string, _Style.Metadata>;
		SCRIPTFILE(fileData).stylesList.forEach((style) => {
			const response = PARSE.TAGSTYLE(style, fileData, CACHE.DYNAMIC.PackageClass_Index);
			const styleData = INDEX.FETCH(response.identity.index);

			fileData.manifest.errors.push(...response.errors);
			fileData.manifest.diagnostics.push(...response.diagnostics);

			if (styleData.declarations.length === 1) {
				fileData.styleData.usedIndexes.add(response.identity.index);
				indexMetaCollection[response.classname] = styleData.metadata;
			}
		});
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) { packageChart[`Package [${fileData.filePath}]: ${classNames.length} Classes`] = classNames; }
		return collection;
	}, {} as Record<string, Record<string, _Style.Metadata>>);


	const PacbindStyleSkeleton = pacbindsArray.reduce((collection, fileData) => {
		const result = PARSE.CSSLIBRARY([fileData], fileData.manifest.refer.group, true);
		collection[Fileman.path.join(CACHE.PATH.folder.packages.path, fileData.filePath)] = result.indexMetaCollection;
		if (result.selectorList.length) {
			pacbindChart[`Pacbind [${fileData.filePath}]: ${result.selectorList.length} Classes`] = result.selectorList;
		}
		return collection;
	}, {} as Record<string, Record<string, _Style.Metadata>>);



	const PackageErrors: string[] = [];
	const PackageDiagnostics: _Support.Diagnostic[] = [];


	Object.values(packagesArray).forEach(file => {
		PackageErrors.push(...file.manifest.errors);
		PackageDiagnostics.push(...file.manifest.diagnostics);
	});

	Object.values(pacbindsArray).forEach(file => {
		PackageErrors.push(...file.manifest.errors);
		PackageDiagnostics.push(...file.manifest.diagnostics);
	});


	Object.values(CACHE.DYNAMIC.PackageClass_Index).forEach((index) => {
		const InStash = INDEX.FETCH(index);
		if (InStash.metadata.declarations.length > 1) {
			PackageErrors.push(
				$.MAKE(
					$.tag.H6("Duplicate Package declarations: ", $.preset.warning),
					InStash.declarations,
					[$.list.Bullets, 0, []]
				),
			);
			PackageDiagnostics.push({
				error: "Duplicate Package declarations: " + InStash.selector,
				source: InStash.declarations,

			});
		}
	});


	const nameCollitions = Object.values(CACHE.STORAGE.PACKAGES).reduce((A, F) => {
		if (CACHE.STATIC.Archive.name === F.packageName) { A.push(F.sourcePath); }
		return A;
	}, [] as string[]);

	if (nameCollitions.length) {
		PackageErrors.push(
			$.MAKE(
				$.tag.H6(`Package-name collitions: ${CACHE.STATIC.Archive.name}`, $.preset.warning),
				nameCollitions,
				[$.list.Bullets, 0, []]
			)
		);
		PackageDiagnostics.push({
			error: `Package-name collitions: ${CACHE.STATIC.Archive.name}`,
			source: nameCollitions
		});
	}




	const axiomChart: Record<string, string[]> = {};
	const clusterChart: Record<string, string[]> = {};
	const { LibraryLookupTable, axiomsArray, clustersArray } = _StackLibraryFiles();


	const AxiomStyleSkeleton = axiomsArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileData, index) => {
		const result = PARSE.CSSLIBRARY(fileData, "AXIOM");
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) {
			axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
		}
		return collection;
	}, {});


	const ClusterStyleSkeleton = clustersArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, level, index) => {
		const result = PARSE.CSSLIBRARY(level, "CLUSTER");
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) { clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
		return collection;
	}, {});



	const LibraryErrors: string[] = [];
	const LibraryDiagnostics: _Support.Diagnostic[] = [];


	Object.values(CACHE.DYNAMIC.LibraryClass_Index).forEach((index) => {
		const InStash = INDEX.FETCH(index);
		if (InStash.declarations.length > 1) {
			LibraryErrors.push(
				$.MAKE(
					$.tag.H4("Duplicate Library declarations: " + InStash.selector, $.preset.warning),
					InStash.declarations,
					[$.list.Bullets, 0, []],
				),
			);
			LibraryDiagnostics.push({
				error: "Duplicate Library declarations: " + InStash.selector,
				source: InStash.declarations,

			});
		}
	});


	const template = (heading: string, items: Record<string, string[]>) => $.MAKE(
		$.tag.H2(heading, $.preset.primary),
		Object.entries(items).map(([heading, entries]) =>
			$.MAKE(
				$.tag.H2(heading, $.preset.tertiary),
				entries,
				[$.list.Catalog, 0, $.preset.tertiary]
			),
		)
	);

	const LibraryReport = [
		template(`Axioms: ${Object.values(ClusterStyleSkeleton).reduce((a, v) => a += Object.keys(v).length, 0)}`, axiomChart),
		template(`Clusters: ${Object.values(PacbindStyleSkeleton).reduce((a, v) => a += Object.keys(v).length, 0)}`, clusterChart),
	].join("");


	const PackageReport = [
		template(`Pacbinds: ${Object.values(PackageStyleSkeleton).reduce((a, v) => a += Object.keys(v).length, 0)}`, pacbindChart),
		template(`Packages: ${Object.values(PacbindStyleSkeleton).reduce((a, v) => a += Object.keys(v).length, 0)}`, packageChart),
	].join("");





	CACHE.LIVEDOCS.Report.library = LibraryReport;
	CACHE.LIVEDOCS.Report.package = PackageReport;

	CACHE.LIVEDOCS.Errors.library = LibraryErrors;
	CACHE.LIVEDOCS.Errors.package = PackageErrors;

	CACHE.LIVEDOCS.Diagnostics.library = LibraryDiagnostics;
	CACHE.LIVEDOCS.Diagnostics.package = PackageDiagnostics;

	CACHE.LIVEDOCS.Manifest.AXIOM = AxiomStyleSkeleton;
	CACHE.LIVEDOCS.Manifest.CLUSTER = ClusterStyleSkeleton;
	CACHE.LIVEDOCS.Manifest.PACKAGE = PackageStyleSkeleton;
	CACHE.LIVEDOCS.Manifest.PACBIND = PacbindStyleSkeleton;

	CACHE.LIVEDOCS.Lookup.library = LibraryLookupTable;
	CACHE.LIVEDOCS.Lookup.package = PackageLookupTable;

}



function ReDeclare() {
	Object.values(CACHE.DYNAMIC.LibraryClass_Index).forEach((val) => {
		const value = CACHE.DYNAMIC.Index_ClassData[val];
		value.metadata.declarations = [...value.declarations];
	});
}



function Appendix(indexes: number[] = []) {
	const stash: Record<string, { readme: string[], pacbind: number[], package: number[] }> = {};

	if (!CACHE.STATIC.WATCH) {
		const usedPackages = Object.values(CACHE.DYNAMIC.PackageClass_Index).filter(i => indexes.includes(i))
			.reduce((a, c) => { a.add(INDEX.FETCH(c).package); return a; }, new Set());

		Object.values(CACHE.STORAGE.PACKAGES).forEach((F) => {
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

	return stash;
}



export default {
	ReRender,
	ReDeclare,
	Appendix,
};
