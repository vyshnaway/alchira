// import * as _Config from "../type/config.js";
import * as _File from "../type/file.js";
import * as _Style from "../type/style.js";
// import * as _Script from "../type/script.js";
// import * as _Cache from "../type/cache.js";
import * as _Support from "../type/support.js";

import * as $$ from "../shell.js";
import * as INDEX from "../data/index.js";
import * as CACHE from "../data/cache.js";

import Use from "../utils/main.js";
import PARSE from "./parse.js";
import FILING from "../data/filing.js";
import SCRIPTFILE from "../script/file.js";




function _DeleteLibraryFile(filePath: string) {
	if (CACHE.FILES.LIBRARIES[filePath]) {
		CACHE.FILES.LIBRARIES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE.FILES.LIBRARIES[filePath];
	}
}

function _DeletePackageFile(filePath: string) {
	if (CACHE.FILES.PACKAGES[filePath]) {
		CACHE.FILES.PACKAGES[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE.FILES.PACKAGES[filePath];
	}
}


function _ClearStash() {
	Object.entries(CACHE.CLASS.Library__Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.Library__Index[selector];
	});
	Object.entries(CACHE.CLASS.Package__Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.Package__Index[selector];
	});

	Object.keys(CACHE.FILES.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
	Object.keys(CACHE.FILES.PACKAGES).forEach((filePath) => _DeletePackageFile(filePath));
}


function _SaveLibraryFile(filePath: string, fileContent: string) {
	if (CACHE.FILES.LIBRARIES[filePath]) { _DeleteLibraryFile(filePath); }
	CACHE.FILES.LIBRARIES[filePath] = FILING("library", filePath, fileContent);
}

function _SavePackageFile(filePath: string, fileContent: string) {
	if (CACHE.FILES.PACKAGES[filePath]) { _DeletePackageFile(filePath); }
	CACHE.FILES.PACKAGES[filePath] = FILING("package", filePath, fileContent);
}


function _StackLibraryFiles() {
	let length = 0;
	const
		none: Record<string, _File.Storage[]> = {},
		axiomArray: Record<string, _File.Storage[]> = {},
		clusterArray: Record<string, _File.Storage[]> = {},
		libraryLookup: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.FILES.LIBRARIES).forEach(([path, data]) => {
		const reference = data.manifest.lookup;
		const collection = reference.type === _File._Type.AXIOM ? axiomArray
			: reference.type === _File._Type.CLUSTER ? clusterArray : none;

		libraryLookup[path] = reference;
		if (!collection[reference.id]) { collection[reference.id] = [data]; }
		else { collection[reference.id].push(data); }

		if (Number(reference.id) > length) { length = Number(reference.id); }
	});

	const axiomsArray = Use.array.fromNumberedObject(axiomArray, length);
	const clustersArray = Use.array.fromNumberedObject(clusterArray, length);
	return { libraryLookup, axiomsArray, clustersArray };
}

function _StackPackageFiles() {
	const
		none: _File.Storage[] = [],
		pacbindsArray: _File.Storage[] = [],
		packagesArray: _File.Storage[] = [],
		packageLookup: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.FILES.PACKAGES).forEach(([path, data]) => {
		const reference = data.manifest.lookup;
		packageLookup[path] = reference;

		const collection = reference.type === _File._Type.PACBIND ? pacbindsArray
			: reference.type === _File._Type.PACKAGE ? packagesArray : none;

		collection.push(data);
	});

	return { packageLookup, pacbindsArray, packagesArray };
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
	const { packageLookup, pacbindsArray, packagesArray } = _StackPackageFiles();

	const PackageSkeletons = packagesArray.reduce((collection, fileData) => {
		const indexMetaCollection = collection[fileData.filePath] = {} as Record<string, _Style.Metadata>;
		SCRIPTFILE(fileData).stylesList.forEach((tagStyle) => {
			if (tagStyle.selector === "") {
				const E = $$.GenerateError(`Missing Declaration: ${tagStyle.selector}`, [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				fileData.manifest.errors.push(E.error);
				fileData.manifest.diagnostics.push(E.diagnostic);
			} else {
				const response = PARSE.TagStyleScanner(tagStyle, fileData, CACHE.CLASS.Package__Index);
				const styleData = INDEX.FETCH(response.index);
				if (styleData?.declarations.length === 1) {
					fileData.styleData.usedIndexes.add(response.index);
					indexMetaCollection[response.classname] = styleData.metadata;
				}
				fileData.manifest.errors.push(...response.errors);
				fileData.manifest.diagnostics.push(...response.diagnostics);
			}
		});
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) {
			packageChart[`Package [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
		}
		return collection;
	}, {} as Record<string, Record<string, _Style.Metadata>>);

	const PacbindSkeletons = pacbindsArray.reduce((collection, fileData) => {
		const result = PARSE.CSSBulkScanner([fileData], true);
		collection[fileData.filePath] = result.indexMetaCollection;
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

	const nameCollitions = Object.values(CACHE.FILES.PACKAGES).reduce((A, F) => {
		if (CACHE.STATIC.Artifact.name === F.packageName) { A.push(F.filePath); }
		return A;
	}, [] as string[]);

	if (nameCollitions.length) {
		const E = $$.GenerateError(`Package-name collitions: ${CACHE.STATIC.Artifact.name}`, nameCollitions);
		PackageErrors.push(E.error);
		PackageDiagnostics.push(E.diagnostic);
	}



	const axiomChart: Record<string, string[]> = {};
	const clusterChart: Record<string, string[]> = {};
	const { libraryLookup, axiomsArray, clustersArray } = _StackLibraryFiles();

	const AxiomSkeletons = axiomsArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileData, index) => {
		const result = PARSE.CSSBulkScanner(fileData);
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) { axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
		return collection;
	}, {});

	const ClusterSkeletons = clustersArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileDatas, index) => {
		const result = PARSE.CSSBulkScanner(fileDatas);
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) { clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
		return collection;
	}, {});


	const LibraryErrors: string[] = [];
	const LibraryDiagnostics: _Support.Diagnostic[] = [];

	const LibraryReport = [
		$$.ClassChart(`Axioms: ${Object.values(ClusterSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, axiomChart),
		$$.ClassChart(`Clusters: ${Object.values(PacbindSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, clusterChart),
	].join("");

	const PackageReport = [
		$$.ClassChart(`Pacbinds: ${Object.values(PackageSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, pacbindChart),
		$$.ClassChart(`Packages: ${Object.values(PacbindSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, packageChart),
	].join("");


	CACHE.DELTA.Report.libraries = LibraryReport;
	CACHE.DELTA.Report.packages = PackageReport;

	CACHE.DELTA.Errors.libraries = LibraryErrors;
	CACHE.DELTA.Errors.packages = PackageErrors;

	CACHE.DELTA.Diagnostics.libraries = LibraryDiagnostics;
	CACHE.DELTA.Diagnostics.packages = PackageDiagnostics;

	CACHE.DELTA.Manifest.AXIOM = AxiomSkeletons;
	CACHE.DELTA.Manifest.CLUSTER = ClusterSkeletons;
	CACHE.DELTA.Manifest.PACKAGE = PackageSkeletons;
	CACHE.DELTA.Manifest.PACBIND = PacbindSkeletons;

	CACHE.DELTA.Lookup.libraries = libraryLookup;
	CACHE.DELTA.Lookup.packages = packageLookup;
}



function ReDeclare() {
	Object.values(CACHE.CLASS.Package__Index).forEach((val) => {
		const value = CACHE.CLASS.Index_to_Data[val];
		value.metadata.declarations = [...value.declarations];
	});
	Object.values(CACHE.CLASS.Library__Index).forEach((val) => {
		const value = CACHE.CLASS.Index_to_Data[val];
		value.metadata.declarations = [...value.declarations];
	});
}



function Appendix(indexes: number[] = []) {
	const stash: Record<string, { readme: string[], pacbind: number[], package: number[] }> = {};

	if (!CACHE.STATIC.WATCH) {
		const usedPackages = Object.values(CACHE.CLASS.Package__Index).filter(i => indexes.includes(i))
			.reduce((a, c) => { a.add(INDEX.FETCH(c).package); return a; }, new Set());

		Object.values(CACHE.FILES.PACKAGES).forEach((F) => {
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
