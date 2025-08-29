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
import Fileman from "../fileman.js";
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
	Object.entries(CACHE.CLASS.Library_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.Library_Index[selector];
	});
	Object.entries(CACHE.CLASS.Package_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.Package_Index[selector];
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
		libraryTable: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.FILES.LIBRARIES).forEach(([path, data]) => {
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

	Object.entries(CACHE.FILES.PACKAGES).forEach(([path, data]) => {
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

	const PackageSkeletons = packagesArray.reduce((collection, fileData) => {
		const indexMetaCollection = collection[fileData.filePath] = {} as Record<string, _Style.Metadata>;
		SCRIPTFILE(fileData).stylesList.forEach((tagStyle) => {
			if (tagStyle.selector === "") {
				const E = $$.GenerateError(`Missing Declaration: ${tagStyle.selector}`, [`${fileData.targetPath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				fileData.manifest.errors.push(E.error);
				fileData.manifest.diagnostics.push(E.diagnostic);
			} else {
				const response = PARSE.TAGSTYLE(tagStyle, fileData, CACHE.CLASS.Package_Index);
				const styleData = INDEX.FETCH(response.identity.index);
				fileData.manifest.diagnostics.push(...response.diagnostics);
				fileData.manifest.errors.push(...response.errors);

				if (styleData.declarations.length === 1) {
					fileData.styleData.usedIndexes.add(response.identity.index);
					indexMetaCollection[response.classname] = styleData.metadata;
				}
			}
		});
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) {
			packageChart[`Package [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
		}
		return collection;
	}, {} as Record<string, Record<string, _Style.Metadata>>);

	const PacbindSkeletons = pacbindsArray.reduce((collection, fileData) => {
		const result = PARSE.CSSCLUSTR([fileData], fileData.manifest.refer.group, true);
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


	Object.values(CACHE.CLASS.Package_Index).forEach((index) => {
		const InStash = INDEX.FETCH(index);
		if (InStash.metadata.declarations.length > 1) {
			const E = $$.GenerateError(`"Duplicate Declarations: ${InStash.selector}`, InStash.declarations);
			PackageErrors.push(E.error);
			PackageDiagnostics.push(E.diagnostic);
		}
	});


	const nameCollitions = Object.values(CACHE.FILES.PACKAGES).reduce((A, F) => {
		if (CACHE.STATIC.Archive.name === F.packageName) { A.push(F.filePath); }
		return A;
	}, [] as string[]);

	if (nameCollitions.length) {
		const E = $$.GenerateError(`Package-name collitions: ${CACHE.STATIC.Archive.name}`, nameCollitions);
		PackageErrors.push(E.error);
		PackageDiagnostics.push(E.diagnostic);
	}






	const axiomChart: Record<string, string[]> = {};
	const clusterChart: Record<string, string[]> = {};
	const { LibraryLookupTable, axiomsArray, clustersArray } = _StackLibraryFiles();


	const AxiomSkeletons = axiomsArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileData, index) => {
		const result = PARSE.CSSCLUSTR(fileData, "AXIOM");
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) {
			axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
		}
		return collection;
	}, {});

	const ClusterSkeletons = clustersArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, level, index) => {
		const result = PARSE.CSSCLUSTR(level, "CLUSTER");
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) {
			clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList;
		}
		return collection;
	}, {});



	const LibraryErrors: string[] = [];
	const LibraryDiagnostics: _Support.Diagnostic[] = [];


	Object.values(CACHE.CLASS.Library_Index).forEach((index) => {
		const InStash = INDEX.FETCH(index);
		if (InStash.declarations.length > 1) {
			const E = $$.GenerateError(`Duplicate Declarations: ${InStash.selector}`, InStash.declarations);
			LibraryErrors.push(E.error);
			LibraryDiagnostics.push(E.diagnostic);
		}
	});


	const LibraryReport = [
		$$.ClassChart(
			`Axioms: ${Object.values(ClusterSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`,
			axiomChart
		),
		$$.ClassChart(
			`Clusters: ${Object.values(PacbindSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`,
			clusterChart
		),
	].join("");

	const PackageReport = [
		$$.ClassChart(
			`Pacbinds: ${Object.values(PackageSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`,
			pacbindChart
		),
		$$.ClassChart(
			`Packages: ${Object.values(PacbindSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`,
			packageChart
		),
	].join("");



	CACHE.DELTA.Report.library = LibraryReport;
	CACHE.DELTA.Report.package = PackageReport;

	CACHE.DELTA.Errors.library = LibraryErrors;
	CACHE.DELTA.Errors.package = PackageErrors;

	CACHE.DELTA.Diagnostics.library = LibraryDiagnostics;
	CACHE.DELTA.Diagnostics.package = PackageDiagnostics;

	CACHE.DELTA.Manifest.AXIOM = AxiomSkeletons;
	CACHE.DELTA.Manifest.CLUSTER = ClusterSkeletons;
	CACHE.DELTA.Manifest.PACKAGE = PackageSkeletons;
	CACHE.DELTA.Manifest.PACBIND = PacbindSkeletons;

	CACHE.DELTA.Lookup.library = LibraryLookupTable;
	CACHE.DELTA.Lookup.package = PackageLookupTable;

}



function ReDeclare() {
	Object.values(CACHE.CLASS.Library_Index).forEach((val) => {
		const value = CACHE.CLASS.Index_to_Data[val];
		value.metadata.declarations = [...value.declarations];
	});
}



function Appendix(indexes: number[] = []) {
	const stash: Record<string, { readme: string[], pacbind: number[], package: number[] }> = {};

	if (!CACHE.STATIC.WATCH) {
		const usedPackages = Object.values(CACHE.CLASS.Package_Index).filter(i => indexes.includes(i))
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
