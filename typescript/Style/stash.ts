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

function _DeleteExternalFile(filePath: string) {
	if (CACHE.FILES.EXTERNALS[filePath]) {
		CACHE.FILES.EXTERNALS[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE.FILES.EXTERNALS[filePath];
	}
}


function _ClearStash() {
	Object.entries(CACHE.CLASS.Library__Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.Library__Index[selector];
	});
	Object.entries(CACHE.CLASS.External_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.External_Index[selector];
	});

	Object.keys(CACHE.FILES.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
	Object.keys(CACHE.FILES.EXTERNALS).forEach((filePath) => _DeleteExternalFile(filePath));
}


function _SaveLibraryFile(filePath: string, fileContent: string) {
	if (CACHE.FILES.LIBRARIES[filePath]) { _DeleteLibraryFile(filePath); }
	const filed = FILING("library", filePath, fileContent);
	if (filed.liblevel < 3) {
		CACHE.FILES.LIBRARIES[filePath] = filed;
	}
}

function _SaveExternalFile(filePath: string, fileContent: string) {
	if (CACHE.FILES.EXTERNALS[filePath]) { _DeleteExternalFile(filePath); }
	const filed = FILING("external", filePath, fileContent);
	if (filed.liblevel < 3) {
		CACHE.FILES.EXTERNALS[filePath] = filed;
	}
}


function _StackLibraryFiles() {
	let length = 0;
	const
		none: Record<string, _File.Storage[]> = {},
		axiomArray: Record<string, _File.Storage[]> = {},
		clusterArray: Record<string, _File.Storage[]> = {},
		libraryLookup: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.FILES.LIBRARIES).forEach(([path, data]) => {
		const reference = data.manifesting.lookup;
		const collection = reference.type === "AXIOM" ? axiomArray
			: reference.type === "CLUSTER" ? clusterArray : none;

		libraryLookup[path] = reference;
		if (!collection[reference.id]) { collection[reference.id] = [data]; }
		else { collection[reference.id].push(data); }

		if (Number(reference.id) > length) { length = Number(reference.id); }
	});

	const axiomsArray = Use.array.fromNumberedObject(axiomArray, length);
	const clustersArray = Use.array.fromNumberedObject(clusterArray, length);
	return { libraryLookup, axiomsArray, clustersArray };
}

function _StackExternalFiles() {
	const
		none: _File.Storage[] = [],
		exattachArray: _File.Storage[] = [],
		externalArray: _File.Storage[] = [],
		externalLookup: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.FILES.EXTERNALS).forEach(([path, data]) => {
		const reference = data.manifesting.lookup;
		externalLookup[path] = reference;

		const collection = reference.type === "EXATTACH" ? exattachArray
			: reference.type === "EXTERNAL" ? externalArray : none;

		collection.push(data);
	});

	return { externalLookup, exattachArray, externalArray };
}


/////////////////////////////////////////////////////////////////////////////



function ReRender() {

	_ClearStash();
	Object.entries(CACHE.STATIC.Library_Saved).forEach(([filePath, fileContent]) => {
		_SaveLibraryFile(filePath, fileContent);
	});
	Object.entries(CACHE.STATIC.External_Saved).forEach(([filePath, fileContent]) => {
		_SaveExternalFile(filePath, fileContent);
	});



	const exattachChart: Record<string, string[]> = {};
	const externalChart: Record<string, string[]> = {};
	const { externalLookup, exattachArray, externalArray } = _StackExternalFiles();

	const ExternalSkeletons = externalArray.reduce((collection, fileData) => {
		const indexMetaCollection = collection[fileData.filePath] = {} as Record<string, _Style.Metadata>;
		SCRIPTFILE(fileData).stylesList.forEach((tagStyle) => {
			if (tagStyle.selector === "") {
				const E = $$.GenerateError(`Missing Declaration: ${tagStyle.selector}`, [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				fileData.manifesting.errors.push(E.error);
				fileData.manifesting.diagnostics.push(E.diagnostic);
			} else {
				const response = PARSE.TagStyleScanner(tagStyle, fileData, CACHE.CLASS.External_Index);
				const styleData = INDEX.FETCH(response.index);
				if (styleData?.declarations.length === 1) {
					fileData.styleData.usedIndexes.add(response.index);
					indexMetaCollection[response.classname] = styleData.metadata;
				}
				fileData.manifesting.errors.push(...response.errors);
				fileData.manifesting.diagnostics.push(...response.diagnostics);
			}
		});
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) {
			externalChart[`External [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
		}
		return collection;
	}, {} as Record<string, Record<string, _Style.Metadata>>);

	const ExattachSkeletons = exattachArray.reduce((collection, fileData) => {
		const result = PARSE.CSSBulkScanner([fileData], true);
		collection[fileData.filePath] = result.indexMetaCollection;
		if (result.selectorList.length) {
			exattachChart[`Exattach [${fileData.filePath}]: ${result.selectorList.length} Classes`] = result.selectorList;
		}
		return collection;
	}, {} as Record<string, Record<string, _Style.Metadata>>);


	const ExternalErrors: string[] = [];
	const ExternalDiagnostics: _Support.Diagnostic[] = [];

	Object.values(externalArray).forEach(file => {
		ExternalErrors.push(...file.manifesting.errors);
		ExternalDiagnostics.push(...file.manifesting.diagnostics);
	});

	Object.values(exattachArray).forEach(file => {
		ExternalErrors.push(...file.manifesting.errors);
		ExternalDiagnostics.push(...file.manifesting.diagnostics);
	});

	const nameCollitions = Object.values(CACHE.FILES.EXTERNALS).reduce((A, F) => {
		if (CACHE.STATIC.Artifact.name === F.artifact) { A.push(F.filePath); }
		return A;
	}, [] as string[]);

	if (nameCollitions.length) {
		const E = $$.GenerateError(`Artifact Name collitions: ${CACHE.STATIC.Artifact.name}`, nameCollitions);
		ExternalErrors.push(E.error);
		ExternalDiagnostics.push(E.diagnostic);
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
		$$.ClassChart(`Axioms: ${Object.values(AxiomSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, axiomChart),
		$$.ClassChart(`Clusters: ${Object.values(ClusterSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, clusterChart),
	].join("");

	const ExternalReport = [
		$$.ClassChart(`Exattach: ${Object.values(ExternalSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, exattachChart),
		$$.ClassChart(`External: ${Object.values(ExattachSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, externalChart),
	].join("");


	CACHE.DELTA.Report.libraries = LibraryReport;
	CACHE.DELTA.Report.externals = ExternalReport;

	CACHE.DELTA.Errors.libraries = LibraryErrors;
	CACHE.DELTA.Errors.externals = ExternalErrors;

	CACHE.DELTA.Diagnostics.libraries = LibraryDiagnostics;
	CACHE.DELTA.Diagnostics.externals = ExternalDiagnostics;

	CACHE.DELTA.Manifest.AXIOM = AxiomSkeletons;
	CACHE.DELTA.Manifest.CLUSTER = ClusterSkeletons;
	CACHE.DELTA.Manifest.EXTERNAL = ExternalSkeletons;
	CACHE.DELTA.Manifest.EXATTACH = ExattachSkeletons;

	CACHE.DELTA.Lookup.libraries = libraryLookup;
	CACHE.DELTA.Lookup.externals = externalLookup;

	CACHE.CLASS.Arattach_Index =
		Object.fromEntries(Object.entries(CACHE.CLASS.Library__Index).map(([k, v]) => [`/${CACHE.STATIC.Artifact.name}/$/${k}`, v]));
}



function ReDeclare() {
	Object.values(CACHE.CLASS.External_Index).forEach((val) => {
		const value = CACHE.CLASS.Index_to_Data[val];
		value.metadata.declarations = [...value.declarations];
	});
	Object.values(CACHE.CLASS.Library__Index).forEach((val) => {
		const value = CACHE.CLASS.Index_to_Data[val];
		value.metadata.declarations = [...value.declarations];
	});
}



// function Appendix(indexes: number[] = []) {
// 	const stash: Record<string, { readme: string[], pacbind: number[], external: number[] }> = {};

// 	if (!CACHE.STATIC.WATCH) {
// 		const usedExternals = Object.values(CACHE.CLASS.External_Index).filter(i => indexes.includes(i))
// 			.reduce((a, c) => { a.add(INDEX.FETCH(c).packname); return a; }, new Set());

// 		Object.values(CACHE.FILES.EXTERNALS).forEach((F) => {
// 			if (usedExternals.has(F.externalName)) {
// 				if (F.extension === "md") {
// 					if (stash[F.externalName]) { stash[F.externalName].readme.push(F.content); }
// 					else { stash[F.externalName] = { readme: [F.content], pacbind: [], external: [] }; }
// 				} else if (F.extension === "xcss") {
// 					if (stash[F.externalName]) { F.styleData.usedIndexes.forEach((i: number) => stash[F.externalName].external.push(i)); }
// 					else { stash[F.externalName] = { readme: [], pacbind: [], external: Array.from(F.styleData.usedIndexes) }; }
// 				} else if (F.extension === "css") {
// 					if (stash[F.externalName]) { F.styleData.usedIndexes.forEach((i: number) => stash[F.externalName].pacbind.push(i)); }
// 					else { stash[F.externalName] = { readme: [], pacbind: Array.from(F.styleData.usedIndexes), external: [] }; }
// 				}
// 			}
// 		});
// 	}

// 	return stash;
// }



export default {
	ReRender,
	ReDeclare,
	// Appendix,
};
