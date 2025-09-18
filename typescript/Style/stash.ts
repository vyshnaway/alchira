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

function _DeleteArtifactFile(filePath: string) {
	if (CACHE.FILES.ARTIFACTS[filePath]) {
		CACHE.FILES.ARTIFACTS[filePath].styleData.usedIndexes.forEach(i => INDEX.DISPOSE(i));
		delete CACHE.FILES.ARTIFACTS[filePath];
	}
}


function _ClearStash() {
	Object.entries(CACHE.CLASS.Library__Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.Library__Index[selector];
	});
	Object.entries(CACHE.CLASS.Artifact_Index).forEach(([selector, index]) => {
		INDEX.DISPOSE(index);
		delete CACHE.CLASS.Artifact_Index[selector];
	});

	Object.keys(CACHE.FILES.LIBRARIES).forEach((filePath) => _DeleteLibraryFile(filePath));
	Object.keys(CACHE.FILES.ARTIFACTS).forEach((filePath) => _DeleteArtifactFile(filePath));
}


function _SaveLibraryFile(filePath: string, fileContent: string) {
	if (CACHE.FILES.LIBRARIES[filePath]) { _DeleteLibraryFile(filePath); }
	const filed = FILING("library", filePath, fileContent);
	if (filed.liblevel < 3) {
		CACHE.FILES.LIBRARIES[filePath] = filed;
	}
}

function _SaveArtifactFile(filePath: string, fileContent: string) {
	if (CACHE.FILES.ARTIFACTS[filePath]) { _DeleteArtifactFile(filePath); }
	const filed = FILING("artifact", filePath, fileContent);
	if (filed.liblevel < 3) {
		CACHE.FILES.ARTIFACTS[filePath] = filed;
	}
}


function _StackLibraryFiles() {
	let length = 0;
	const
		none: Record<string, _File.Storage[]> = {},
		axiomMap: Record<string, _File.Storage[]> = {},
		clusterMap: Record<string, _File.Storage[]> = {},
		librariesLookup: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.FILES.LIBRARIES).forEach(([path, data]) => {
		const reference = data.manifesting.lookup;
		const collection = reference.type === "AXIOM" ? axiomMap
			: reference.type === "CLUSTER" ? clusterMap : none;

		librariesLookup[path] = reference;
		if (!collection[reference.id]) { collection[reference.id] = [data]; }
		else { collection[reference.id].push(data); }

		if (Number(reference.id) > length) { length = Number(reference.id); }
	});

	const axiomArray = Use.array.fromNumberedObject(axiomMap, length);
	const clusterArray = Use.array.fromNumberedObject(clusterMap, length);
	return { librariesLookup, axiomArray, clusterArray };
}

function _StackArtifactFiles() {
	const
		artifactArray: _File.Storage[] = [],
		artifactsLookup: Record<string, _File.Lookup> = {};

	Object.entries(CACHE.FILES.ARTIFACTS).forEach(([path, data]) => {
		const reference = data.manifesting.lookup;
		artifactsLookup[path] = reference;

		if (reference.type === "ARTIFACT"){
			artifactArray.push(data);
		}
	});

	return { artifactsLookup, artifactArray };
}


/////////////////////////////////////////////////////////////////////////////



function ReRender() {
	_ClearStash();
	Object.entries(CACHE.STATIC.Libraries_Saved).forEach(([filePath, fileContent]) => { _SaveLibraryFile(filePath, fileContent); });
	Object.entries(CACHE.STATIC.Artifacts_Saved).forEach(([filePath, fileContent]) => { _SaveArtifactFile(filePath, fileContent); });

	const { artifactsLookup, artifactArray } = _StackArtifactFiles();


	const artifactChart: Record<string, string[]> = {};
	const ArtifactSkeletons = artifactArray.reduce((collection, fileData) => {
		const indexMetaCollection = collection[fileData.filePath] = {} as Record<string, _Style.Metadata>;
		SCRIPTFILE(fileData).stylesList.forEach((tagStyle) => {
			if (tagStyle.symclasses.length === 0) {
				const E = $$.GenerateError("Symclass missing declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				fileData.manifesting.errors.push(E.error);
				fileData.manifesting.diagnostics.push(E.diagnostic);
			} else if (tagStyle.symclasses.length > 1) {
				const E = $$.GenerateError("Multiple Symclasses declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
				fileData.manifesting.errors.push(E.error);
				fileData.manifesting.diagnostics.push(E.diagnostic);
			} else {
				const response = PARSE.TagStyleScanner(tagStyle, fileData, CACHE.CLASS.Artifact_Index);
				const styleData = INDEX.FETCH(response.index);
				if (styleData?.declarations.length === 1) {
					fileData.styleData.usedIndexes.push(response.index);
					indexMetaCollection[response.symclass] = styleData.metadata;
				}
				fileData.manifesting.errors.push(...response.errors);
				fileData.manifesting.diagnostics.push(...response.diagnostics);
			}
		});
		const classNames = Object.keys(indexMetaCollection);
		if (classNames.length) {
			artifactChart[`Artifact [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
		}
		return collection;
	}, {} as Record<string, Record<string, _Style.Metadata>>);


	const ArtifactsErrors: string[] = [];
	const ArtifactsDiagnostics: _Support.Diagnostic[] = [];

	const nameCollitions = Object.values(CACHE.FILES.ARTIFACTS).reduce((A, F) => {
		if (CACHE.STATIC.Archive.name === F.artifact) { A.push(F.filePath); }
		return A;
	}, [] as string[]);

	if (nameCollitions.length) {
		const E = $$.GenerateError(`Artifact Name collitions: ${CACHE.STATIC.Archive.name}`, nameCollitions);
		ArtifactsErrors.push(E.error);
		ArtifactsDiagnostics.push(E.diagnostic);
	}

	Object.values(artifactArray).forEach(file => {
		ArtifactsErrors.push(...file.manifesting.errors);
		ArtifactsDiagnostics.push(...file.manifesting.diagnostics);
	});

	const artifactReport = $$.ClassChart(`Artifact: ${Object.values(ArtifactSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, artifactChart);



	const axiomChart: Record<string, string[]> = {};
	const clusterChart: Record<string, string[]> = {};
	const { librariesLookup, axiomArray, clusterArray } = _StackLibraryFiles();

	const AxiomSkeletons = axiomArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileData, index) => {
		const result = PARSE.CSSBulkScanner(fileData);
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) { axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
		return collection;
	}, {});

	const ClusterSkeletons = clusterArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileDatas, index) => {
		const result = PARSE.CSSBulkScanner(fileDatas);
		collection[index] = result.indexMetaCollection;
		if (result.selectorList.length) { clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
		return collection;
	}, {});

	const LibrariesErrors: string[] = [];
	const LibrariesDiagnostics: _Support.Diagnostic[] = [];

	Object.values(axiomArray).forEach(level => {
		Object.values(level).forEach(file => {
			LibrariesErrors.push(...file.manifesting.errors);
			LibrariesDiagnostics.push(...file.manifesting.diagnostics);
		});
	});

	Object.values(clusterArray).forEach(level => {
		Object.values(level).forEach(file => {
			LibrariesErrors.push(...file.manifesting.errors);
			LibrariesDiagnostics.push(...file.manifesting.diagnostics);
		});
	});

	const libraryReport = [
		$$.ClassChart(`Axiom: ${Object.values(AxiomSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, axiomChart),
		$$.ClassChart(`Cluster: ${Object.values(ClusterSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, clusterChart),
	].join("");



	CACHE.DELTA.Report.libraries = libraryReport;
	CACHE.DELTA.Report.artifacts = artifactReport;

	CACHE.DELTA.Errors.libraries = LibrariesErrors;
	CACHE.DELTA.Errors.artifacts = ArtifactsErrors;

	CACHE.DELTA.Diagnostics.libraries = LibrariesDiagnostics;
	CACHE.DELTA.Diagnostics.artifacts = ArtifactsDiagnostics;

	CACHE.DELTA.Manifest.AXIOM = AxiomSkeletons;
	CACHE.DELTA.Manifest.CLUSTER = ClusterSkeletons;
	CACHE.DELTA.Manifest.ARTIFACT = ArtifactSkeletons;

	CACHE.DELTA.Lookup.libraries = librariesLookup;
	CACHE.DELTA.Lookup.artifacts = artifactsLookup;
}



function ReDeclare() {
	Object.values(CACHE.CLASS.Artifact_Index).forEach((val) => {
		const value = CACHE.CLASS.Index_to_Data[val];
		value.metadata.declarations = [...value.declarations];
	});
	Object.values(CACHE.CLASS.Library__Index).forEach((val) => {
		const value = CACHE.CLASS.Index_to_Data[val];
		value.metadata.declarations = [...value.declarations];
	});
}


export default {
	ReRender,
	ReDeclare,
};
