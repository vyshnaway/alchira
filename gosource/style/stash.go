package style

import (
	_action_ "main/action"
	_cache_ "main/cache"
	_types_ "main/types"
	_utils_ "main/utils"
	_strconv_ "strconv"
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
		_cache_.Files.LIBRARIES[filepath] = stored
	}
}

func stash_SaveArtifactFile(filepath string, content string) {
	stash_DeleteArtifactFile(filepath)
	stored := _action_.Store(_action_.Store_FileGroup_Artifact, filepath, content, "", "", "")
	if stored.LibLevel < 3 {
		_cache_.Files.ARTIFACTS[filepath] = stored
	}
}

type stash_StackLibraryFiles_return struct {
	Cluster [][]*_types_.File_Storage
	Axiom   [][]*_types_.File_Storage
	Lookup  map[string]*_types_.File_Lookup
}

func stash_StackLibraryFiles() stash_StackLibraryFiles_return {
	length := 0
	axiomMap := map[int][]*_types_.File_Storage{}
	clusterMap := map[int][]*_types_.File_Storage{}
	lookup := map[string]*_types_.File_Lookup{}

	for path, data := range _cache_.Files.LIBRARIES {
		var collection *map[int][]*_types_.File_Storage
		switch data.Manifesting.Lookup.Type {
		case _types_.File_Type_Axiom:
			collection = &axiomMap
		case _types_.File_Type_Cluster:
			collection = &clusterMap
		}
		lookup[path] = &data.Manifesting.Lookup
		id, er := _strconv_.Atoi(data.Manifesting.Lookup.Id)

		if er == nil {

			if _, exists := (*collection)[id]; !exists {
				(*collection)[id] = []*_types_.File_Storage{&data}
			} else {
				(*collection)[id] = append((*collection)[id], &data)
			}

			if id > length {
				length = id
			}
		}
	}

	axiom := _utils_.Array_FromNumberMap(axiomMap, length)
	cluster := _utils_.Array_FromNumberMap(clusterMap, length)
	
	return stash_StackLibraryFiles_return{
		Cluster: cluster,
		Axiom: axiom,
		Lookup: lookup,
	}
}

type stash_StackArtifactFiles_return struct {
	Artifacts []*_types_.File_Storage
	Lookup    map[string]_types_.File_Lookup
}

func stash_StackArtifactFiles() stash_StackArtifactFiles_return {
	artifacts := []*_types_.File_Storage{}
	lookup := map[string]_types_.File_Lookup{}

	for path, data := range _cache_.Files.ARTIFACTS {
		reference := data.Manifesting.Lookup
		lookup[path] = reference

		if reference.Type == _types_.File_Type_Artifact {
			artifacts = append(artifacts, &data)
		}
	}

	return stash_StackArtifactFiles_return{
		Artifacts: artifacts,
		Lookup:    lookup,
	}
}

func Stash_Update() {
// 	_ClearStash();
// 	Object.entries(CACHE.STATIC.Libraries_Saved).forEach(([filePath, fileContent]) => { _SaveLibraryFile(filePath, fileContent); });
// 	Object.entries(CACHE.STATIC.Artifacts_Saved).forEach(([filePath, fileContent]) => { _SaveArtifactFile(filePath, fileContent); });

// 	{ artifactsLookup, artifactArray } = _StackArtifactFiles();

// 	artifactChart: Record<string, string[]> = {};
// 	ArtifactSkeletons = artifactArray.reduce((collection, fileData) => {
// 		indexMetaCollection = collection[fileData.filePath] = {} as Record<string, _Style.Metadata>;
// 		SCRIPTFILE(fileData).stylesList.forEach((tagStyle) => {
// 			if (tagStyle.symclasses.length === 0) {
// 				E = $$.GenerateError("Symclass missing declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
// 				fileData.manifesting.errors.push(E.error);
// 				fileData.manifesting.diagnostics.push(E.diagnostic);
// 			} else if (tagStyle.symclasses.length > 1) {
// 				E = $$.GenerateError("Multiple Symclasses declaration scope.", [`${fileData.filePath}:${tagStyle.rowIndex}:${tagStyle.colIndex}`]);
// 				fileData.manifesting.errors.push(E.error);
// 				fileData.manifesting.diagnostics.push(E.diagnostic);
// 			} else {
// 				response = PARSE.TagStyleScanner(tagStyle, fileData, CACHE.CLASS.Artifact_Index);
// 				styleData = INDEX.FETCH(response.index);
// 				if (styleData?.declarations.length === 1) {
// 					fileData.styleData.usedIndexes.push(response.index);
// 					indexMetaCollection[response.symclass] = styleData.metadata;
// 				}
// 				fileData.manifesting.errors.push(...response.errors);
// 				fileData.manifesting.diagnostics.push(...response.diagnostics);
// 			}
// 		});
// 		classNames = Object.keys(indexMetaCollection);
// 		if (classNames.length) {
// 			artifactChart[`Artifact [${fileData.filePath}]: ${classNames.length} Classes`] = classNames;
// 		}
// 		return collection;
// 	}, {} as Record<string, Record<string, _Style.Metadata>>);

// 	ArtifactsErrors: string[] = [];
// 	ArtifactsDiagnostics: _Support.Diagnostic[] = [];

// 	nameCollitions = Object.values(CACHE.FILES.ARTIFACTS).reduce((A, F) => {
// 		if (CACHE.STATIC.Archive.name === F.artifact) { A.push(F.filePath); }
// 		return A;
// 	}, [] as string[]);

// 	if (nameCollitions.length) {
// 		E = $$.GenerateError(`Artifact Name collitions: ${CACHE.STATIC.Archive.name}`, nameCollitions);
// 		ArtifactsErrors.push(E.error);
// 		ArtifactsDiagnostics.push(E.diagnostic);
// 	}

// 	Object.values(artifactArray).forEach(file => {
// 		ArtifactsErrors.push(...file.manifesting.errors);
// 		ArtifactsDiagnostics.push(...file.manifesting.diagnostics);
// 	});

// 	artifactReport = $$.ClassChart(`Artifact: ${Object.values(ArtifactSkeletons).reduce((a, v) => a += Object.keys(v).length, 0)}`, artifactChart);

// 	axiomChart: Record<string, string[]> = {};
// 	clusterChart: Record<string, string[]> = {};
// 	{ librariesLookup, axiomArray, clusterArray } = _StackLibraryFiles();

// 	AxiomSkeletons = axiomArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileData, index) => {
// 		result = PARSE.CSSBulkScanner(fileData);
// 		collection[index] = result.indexMetaCollection;
// 		if (result.selectorList.length) { axiomChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
// 		return collection;
// 	}, {});

// 	ClusterSkeletons = clusterArray.reduce((collection: Record<string, Record<string, _Style.Metadata>>, fileDatas, index) => {
// 		result = PARSE.CSSBulkScanner(fileDatas);
// 		collection[index] = result.indexMetaCollection;
// 		if (result.selectorList.length) { clusterChart[`Level ${index}: ${result.selectorList.length} Classes`] = result.selectorList; }
// 		return collection;
// 	}, {});

// 	LibrariesErrors: string[] = [];
// 	LibrariesDiagnostics: _Support.Diagnostic[] = [];

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

// 	libraryReport = [
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
}

func ReDeclare() {
	for _, i := range _cache_.Style.Artifact_Index {
		data := _cache_.Index_Fetch(i)
		data.Metadata.Declarations = data.Declarations
	}
	for _, i := range _cache_.Style.Library__Index {
		data := _cache_.Index_Fetch(i)
		data.Metadata.Declarations = data.Declarations
	}
}
