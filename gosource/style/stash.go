package style

import (
	_cache_ "main/cache"
	_action_ "main/action"
)

func stash_DeleteLibraryFile(filepath string) {
	if file, ok := _cache_.Files.LIBRARIES[filepath]; ok {
		for _, i := range file.StyleData.UsedIndexes {
			_cache_.Index_Dispose(i)
		}
		delete(_cache_.Files.LIBRARIES, filepath)
	}
}

func stash_DeleteArtifactFile(filepath string) {
	if file, ok := _cache_.Files.ARTIFACTS[filepath]; ok {
		for _, i := range file.StyleData.UsedIndexes {
			_cache_.Index_Dispose(i)
		}
		delete(_cache_.Files.ARTIFACTS, filepath)
	}
}


func stash_Clear() {
	for s, i := range _cache_.Style.Library__Index {
		_cache_.Index_Dispose(i)
		delete(_cache_.Style.Library__Index, s)
	}
	for s, i := range _cache_.Style.Artifact_Index {
		_cache_.Index_Dispose(i)
		delete(_cache_.Style.Library__Index, s)
	}

	for k, _ := range _cache_.Files.LIBRARIES {
		stash_DeleteLibraryFile(k)
	}
	for k, _ := range _cache_.Files.ARTIFACTS {
		stash_DeleteLibraryFile(k)
	}
}


func stash_SaveLibraryFile(filepath string, content string) {
	stash_DeleteLibraryFile(filepath)
	stored := _action_.Store(_action_.Store_FileGroup_Library, filepath, content, "", "", "")
	if stored.LibLevel < 3 {
		_cache_.Files.LIBRARIES[filepath] = stored;
	}
}

func stash_SaveArtifactFile(filepath string, content string) {
	stash_DeleteArtifactFile(filepath)
	stored := _action_.Store(_action_.Store_FileGroup_Artifact, filepath, content, "", "", "")
	if stored.LibLevel < 3 {
		_cache_.Files.ARTIFACTS[filepath] = stored;
	}
}


// func _StackLibraryFiles() {
// 	let length = 0;
// 	const
// 		none: Record<string, _File.Storage[]> = {},
// 		axiomMap: Record<string, _File.Storage[]> = {},
// 		clusterMap: Record<string, _File.Storage[]> = {},
// 		librariesLookup: Record<string, _File.Lookup> = {};

// 	Object.entries(CACHE.FILES.LIBRARIES).forEach(([path, data]) => {
// 		const reference = data.manifesting.lookup;
// 		const collection = reference.type === "AXIOM" ? axiomMap
// 			: reference.type === "CLUSTER" ? clusterMap : none;

// 		librariesLookup[path] = reference;
// 		if (!collection[reference.id]) { collection[reference.id] = [data]; }
// 		else { collection[reference.id].push(data); }

// 		if (Number(reference.id) > length) { length = Number(reference.id); }
// 	});

// 	const axiomArray = Use.array.fromNumberedObject(axiomMap, length);
// 	const clusterArray = Use.array.fromNumberedObject(clusterMap, length);
// 	return { librariesLookup, axiomArray, clusterArray };
// }

// func _StackArtifactFiles() {
// 	const
// 		artifactArray: _File.Storage[] = [],
// 		artifactsLookup: Record<string, _File.Lookup> = {};

// 	Object.entries(CACHE.FILES.ARTIFACTS).forEach(([path, data]) => {
// 		const reference = data.manifesting.lookup;
// 		artifactsLookup[path] = reference;

// 		if (reference.type === "ARTIFACT"){
// 			artifactArray.push(data);
// 		}
// 	});

// 	return { artifactsLookup, artifactArray };
// }


// /////////////////////////////////////////////////////////////////////////////



// func ReRender() {
// 	_ClearStash();
// 	Object.entries(CACHE.STATIC.Libraries_Saved).forEach(([filePath, fileContent]) => { _SaveLibraryFile(filePath, fileContent); });
// 	Object.entries(CACHE.STATIC.Artifacts_Saved).forEach(([filePath, fileContent]) => { _SaveArtifactFile(filePath, fileContent); });

// 	const { artifactsLookup, artifactArray } = _StackArtifactFiles();


// 	const artifactChart: Record<string, string[]> = {};
// 	const ArtifactSkeletons = artifactArray.reduce((collection, fileData) => {
// 		const indexMetaCollection = collection[fileData.filePath] = {} as Record<string, _Style.Metadata>;
// 		SCRIPTFILE(fileData).stylesList.forEach((tagStyle) => {
// 			if (tagStyle.symclasses.length === 0) {
// 				const E = $$.GenerateError("Symclass missing declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
// 				fileData.manifesting.errors.push(E.error);
// 				fileData.manifesting.diagnostics.push(E.diagnostic);
// 			} else if (tagStyle.symclasses.length > 1) {
// 				const E = $$.GenerateError("Multiple Symclasses declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
// 				fileData.manifesting.errors.push(E.error);
// 				fileData.manifesting.diagnostics.push(E.diagnostic);
// 			} else {
// 				const response = PARSE.TagStyleScanner(tagStyle, fileData, CACHE.CLASS.Artifact_Index);
// 				const styleData = INDEX.FETCH(response.index);
// 				if (styleData?.declarations.length === 1) {
// 					fileData.styleData.usedIndexes.push(response.index);
// 					indexMetaCollection[response.symclass] = styleData.metadata;
// 				}
// 				fileData.manifesting.errors.push(...response.errors);
// 				fileData.manifesting.diagnostics.push(...response.diagnostics);
// 			}
// 		});
// 		const classNames = Object.keys(indexMetaCollection);
// 		if (classNames.length) {
// 			artifactChart[`Artifact [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
// 		}
// 		return collection;
// 	}, {} as Record<string, Record<string, _Style.Metadata>>);


// 	const ArtifactsErrors: string[] = [];
// 	const ArtifactsDiagnostics: _Support.Diagnostic[] = [];

// 	const nameCollitions = Object.values(CACHE.FILES.ARTIFACTS).reduce((A, F) => {
// 		if (CACHE.STATIC.Archive.name === F.artifact) { A.push(F.filePath); }
// 		return A;
// 	}, [] as string[]);

// 	if (nameCollitions.length) {
// 		const E = $$.GenerateError(`Artifact Name collitions: ${CACHE.STATIC.Archive.name}`, nameCollitions);
// 		ArtifactsErrors.push(E.error);
// 		ArtifactsDiagnostics.push(E.diagnostic);
// 	}

// 	Object.values(artifactArray).forEach(file => {
// 		ArtifactsErrors.push(...file.manifesting.errors);
// 		ArtifactsDiagnostics.push(...file.manifesting.diagnostics);
// 	});

// 	const artifactReport = $$.ClassChart(`Artifact: ${Object.values(ArtifactSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, artifactChart);



// 	const axiomChart: Record<string, string[]> = {};
// 	const clusterChart: Record<string, string[]> = {};
// 	const { librariesLookup, axiomArray, clusterArray } = _StackLibraryFiles();

// 	const AxiomSkeletons = axiomArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileData, index) => {
// 		const result = PARSE.CSSBulkScanner(fileData);
// 		collection[index] = result.indexMetaCollection;
// 		if (result.selectorList.length) { axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
// 		return collection;
// 	}, {});

// 	const ClusterSkeletons = clusterArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileDatas, index) => {
// 		const result = PARSE.CSSBulkScanner(fileDatas);
// 		collection[index] = result.indexMetaCollection;
// 		if (result.selectorList.length) { clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
// 		return collection;
// 	}, {});

// 	const LibrariesErrors: string[] = [];
// 	const LibrariesDiagnostics: _Support.Diagnostic[] = [];

// 	Object.values(axiomArray).forEach(level => {
// 		Object.values(level).forEach(file => {
// 			LibrariesErrors.push(...file.manifesting.errors);
// 			LibrariesDiagnostics.push(...file.manifesting.diagnostics);
// 		});
// 	});

// 	Object.values(clusterArray).forEach(level => {
// 		Object.values(level).forEach(file => {
// 			LibrariesErrors.push(...file.manifesting.errors);
// 			LibrariesDiagnostics.push(...file.manifesting.diagnostics);
// 		});
// 	});

// 	const libraryReport = [
// 		$$.ClassChart(`Axiom: ${Object.values(AxiomSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, axiomChart),
// 		$$.ClassChart(`Cluster: ${Object.values(ClusterSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, clusterChart),
// 	].join("");



// 	CACHE.DELTA.Report.libraries = libraryReport;
// 	CACHE.DELTA.Report.artifacts = artifactReport;

// 	CACHE.DELTA.Errors.libraries = LibrariesErrors;
// 	CACHE.DELTA.Errors.artifacts = ArtifactsErrors;

// 	CACHE.DELTA.Diagnostics.libraries = LibrariesDiagnostics;
// 	CACHE.DELTA.Diagnostics.artifacts = ArtifactsDiagnostics;

// 	CACHE.DELTA.Manifest.AXIOM = AxiomSkeletons;
// 	CACHE.DELTA.Manifest.CLUSTER = ClusterSkeletons;
// 	CACHE.DELTA.Manifest.ARTIFACT = ArtifactSkeletons;

// 	CACHE.DELTA.Lookup.libraries = librariesLookup;
// 	CACHE.DELTA.Lookup.artifacts = artifactsLookup;
// }



// func ReDeclare() {
// 	Object.values(CACHE.CLASS.Artifact_Index).forEach((val) => {
// 		const value = CACHE.CLASS.Index_to_Data[val];
// 		value.metadata.declarations = [...value.declarations];
// 	});
// 	Object.values(CACHE.CLASS.Library__Index).forEach((val) => {
// 		const value = CACHE.CLASS.Index_to_Data[val];
// 		value.metadata.declarations = [...value.declarations];
// 	});
// }


// export default {
// 	ReRender,
// 	ReDeclare,
// };
