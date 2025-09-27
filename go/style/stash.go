package style

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_cache_ "main/cache"
	_script_ "main/script"
	_types_ "main/types"
	_utils_ "main/utils"
	X "main/xhell"
	_strconv_ "strconv"
)

func stash_DeleteLibraryFile(filepath string) {
	if file, ok := _cache_.Files.Libraries[filepath]; ok {
		_cache_.Index_Dispose(file.StyleData.UsedIn...)
		delete(_cache_.Files.Libraries, filepath)
	}
}

func stash_DeleteArtifactFile(filepath string) {
	if file, ok := _cache_.Files.Artifacts[filepath]; ok {
		_cache_.Index_Dispose(file.StyleData.UsedIn...)
		delete(_cache_.Files.Artifacts, filepath)
	}
}

func stash_Clear() {
	for s, i := range _cache_.Style.Library__Index {
		_cache_.Index_Dispose(i)
		delete(_cache_.Style.Artifact_Index, s)
	}
	for s, i := range _cache_.Style.Artifact_Index {
		_cache_.Index_Dispose(i)
		delete(_cache_.Style.Library__Index, s)
	}

	for k := range _cache_.Files.Libraries {
		stash_DeleteLibraryFile(k)
	}
	for k := range _cache_.Files.Artifacts {
		stash_DeleteLibraryFile(k)
	}
}

func stash_SaveLibraryFile(filepath string, content string) {
	stash_DeleteLibraryFile(filepath)
	stored := _action_.Store(_action_.Store_FileGroup_Library, filepath, content, "", "", "")
	if stored.LibLevel < 3 {
		_cache_.Files.Libraries[filepath] = stored
	}
}

func stash_SaveArtifactFile(filepath string, content string) {
	stash_DeleteArtifactFile(filepath)
	stored := _action_.Store(_action_.Store_FileGroup_Artifact, filepath, content, "", "", "")
	if stored.LibLevel < 3 {
		_cache_.Files.Artifacts[filepath] = stored
	}
}

type stash_StackLibraryFiles_return struct {
	Cluster [][]_types_.File_Stash
	Axiom   [][]_types_.File_Stash
	Lookup  map[string]_types_.File_Lookup
}

func stash_StackLibraryFiles() stash_StackLibraryFiles_return {
	length := 0
	axiom_map := map[int][]_types_.File_Stash{}
	cluster_map := map[int][]_types_.File_Stash{}
	lookup := map[string]_types_.File_Lookup{}

	for path, data := range _cache_.Files.Libraries {
		var collection *map[int][]_types_.File_Stash
		switch data.Manifest.Lookup.Type {
		case _types_.File_Type_Axiom:
			collection = &axiom_map
		case _types_.File_Type_Cluster:
			collection = &cluster_map
		}
		lookup[path] = data.Manifest.Lookup
		id, er := _strconv_.Atoi(data.Manifest.Lookup.Id)

		if er == nil {

			if _, exists := (*collection)[id]; !exists {
				(*collection)[id] = []_types_.File_Stash{data}
			} else {
				(*collection)[id] = append((*collection)[id], data)
			}

			if id > length {
				length = id
			}
		}
	}

	axiom := _utils_.Array_FromNumberMap(axiom_map, length)
	cluster := _utils_.Array_FromNumberMap(cluster_map, length)

	return stash_StackLibraryFiles_return{
		Cluster: cluster,
		Axiom:   axiom,
		Lookup:  lookup,
	}
}

type stash_StackArtifactFiles_return struct {
	Files  []_types_.File_Stash
	Lookup map[string]_types_.File_Lookup
}

func stash_StackArtifactFiles() stash_StackArtifactFiles_return {
	files := []_types_.File_Stash{}
	lookup := map[string]_types_.File_Lookup{}

	for path, data := range _cache_.Files.Artifacts {
		reference := data.Manifest.Lookup
		lookup[path] = reference

		if reference.Type == _types_.File_Type_Artifact {
			files = append(files, data)
		}
	}

	return stash_StackArtifactFiles_return{
		Files:  files,
		Lookup: lookup,
	}
}

func Stash_Update() {
	stash_Clear()
	for filepath, content := range _cache_.Static.Libraries_Saved {
		stash_SaveLibraryFile(filepath, content)
	}
	for filepath, content := range _cache_.Static.Artifacts_Saved {
		stash_SaveArtifactFile(filepath, content)
	}

	// Artifacts update actions
	SaveArtifactFile_ := stash_StackArtifactFiles()
	_cache_.Delta.Lookup.Artifacts = SaveArtifactFile_.Lookup
	_cache_.Manifest.Artifact = map[string]_types_.File_MetadataMap{}
	_cache_.Delta.Errors.Artifacts = []string{}
	_cache_.Delta.Diagnostics.Artifacts = []_types_.Refer_Diagnostic{}
	artifact_chart := map[string][]string{}
	artifact_counter := 0
	for _, file := range SaveArtifactFile_.Files {

		symclasses := []string{}
		metadatas := map[string]*_types_.Style_Metadata{}
		for _, tagstyle := range _script_.Rider(&file, []string{}, _types_.Target_Action_Read).StylesList {

			if len(tagstyle.SymClasses) == 0 {
				E := X.Error_Write(
					"Symclass missing declaration scope.",
					[]string{_fmt_.Sprint(file.FilePath, ":", tagstyle.RowIndex, ":", tagstyle.ColIndex)},
				)
				file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
				file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
			} else if len(tagstyle.SymClasses) > 1 {
				E := X.Error_Write(
					"Multiple SymClasses declaration scope.",
					[]string{_fmt_.Sprint(file.FilePath, ":", tagstyle.RowIndex, ":", tagstyle.ColIndex)},
				)
				file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
				file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
			} else {
				artifact_counter++
				Rawtag_Upload_ := Rawtag_Upload(&tagstyle, &file, &_cache_.Style.Artifact_Index, _cache_.Static.DEBUG)
				styledata := _cache_.Index_Fetch(Rawtag_Upload_.Index)
				if len(styledata.Declarations) == 1 {
					file.StyleData.UsedIn = append(file.StyleData.UsedIn, Rawtag_Upload_.Index)
					metadatas[Rawtag_Upload_.Symclass] = &styledata.Metadata
					symclasses = append(symclasses, Rawtag_Upload_.Symclass)
				}
				file.Manifest.Errors = append(file.Manifest.Errors, Rawtag_Upload_.Errors...)
				file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, Rawtag_Upload_.Diagnostics...)
			}
		}
		if len(symclasses) > 0 {
			artifact_chart[_fmt_.Sprint("Artifact [", file.FilePath, "]: ", len(symclasses), " SymClasses")] = symclasses
		}
		_cache_.Manifest.Artifact[file.FilePath] = metadatas
		_cache_.Delta.Errors.Artifacts = append(_cache_.Delta.Errors.Artifacts, file.Manifest.Errors...)
		_cache_.Delta.Diagnostics.Artifacts = append(_cache_.Delta.Diagnostics.Artifacts, file.Manifest.Diagnostics...)
	}
	_cache_.Delta.Report.Artifacts = X.List_Chart(_fmt_.Sprint("Artifact: ", artifact_counter), artifact_chart)

	// Library update actions
	StackLibraryFiles_ := stash_StackLibraryFiles()
	_cache_.Delta.Lookup.Libraries = StackLibraryFiles_.Lookup
	// Axiom update actions
	_cache_.Manifest.Axiom = map[string]_types_.File_MetadataMap{}
	_cache_.Delta.Errors.Axioms = []string{}
	_cache_.Delta.Diagnostics.Axioms = []_types_.Refer_Diagnostic{}
	axiomChart := map[string][]string{}
	axiom_counter := 0
	for index, files := range StackLibraryFiles_.Axiom {
		Cssfile_Collection_ := Cssfile_Collection(&files, false, _cache_.Static.DEBUG)
		_cache_.Manifest.Axiom[_strconv_.Itoa(index)] = Cssfile_Collection_.MetadataCollection
		if count := len(Cssfile_Collection_.SelectorList); count > 0 {
			axiom_counter += count
			axiomChart[_fmt_.Sprint("Level ", index, ": ", count, " Classes")] = Cssfile_Collection_.SelectorList
		}
		for _, file := range files {
			_cache_.Delta.Errors.Axioms = append(_cache_.Delta.Errors.Axioms, file.Manifest.Errors...)
			_cache_.Delta.Diagnostics.Axioms = append(_cache_.Delta.Diagnostics.Axioms, file.Manifest.Diagnostics...)
		}
	}
	_cache_.Delta.Report.Axioms += X.List_Chart(_fmt_.Sprintf("Axiom: %d", axiom_counter), axiomChart)

	// Cluster update actions
	_cache_.Manifest.Cluster = map[string]_types_.File_MetadataMap{}
	_cache_.Delta.Errors.Clusters = []string{}
	_cache_.Delta.Diagnostics.Clusters = []_types_.Refer_Diagnostic{}
	clusterChart := map[string][]string{}
	cluster_counter := 0
	for index, files := range StackLibraryFiles_.Cluster {
		Cssfile_Collection_ := Cssfile_Collection(&files, false, _cache_.Static.DEBUG)
		_cache_.Manifest.Cluster[_strconv_.Itoa(index)] = Cssfile_Collection_.MetadataCollection
		if count := len(Cssfile_Collection_.SelectorList); count > 0 {
			cluster_counter += count
			clusterChart[_fmt_.Sprint("Level ", index, ": ", count, " Classes")] = Cssfile_Collection_.SelectorList
		}
		for _, file := range files {
			_cache_.Delta.Errors.Clusters = append(_cache_.Delta.Errors.Clusters, file.Manifest.Errors...)
			_cache_.Delta.Diagnostics.Clusters = append(_cache_.Delta.Diagnostics.Clusters, file.Manifest.Diagnostics...)
		}
	}
	_cache_.Delta.Report.Clusters += X.List_Chart(_fmt_.Sprintf("Cluster: %d", cluster_counter), clusterChart)
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
