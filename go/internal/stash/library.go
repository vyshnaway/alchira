package stash

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/shell"
	_style "main/internal/style"
	_model "main/models"
	_util "main/package/utils"
	_strconv "strconv"
)

func library_DeleteFile(filepath string) {
	if file, ok := Cache.Libraries[filepath]; ok {
		_action.Index_Dispose(file.StyleData.UsedIn...)
		delete(Cache.Libraries, filepath)
	}
}

func library_SaveFile(filepath string, content string) {
	library_DeleteFile(filepath)
	stored := _action.Store(_action.Store_FileGroup_Library, filepath, content, "", "", "")
	if stored.LibLevel < 3 {
		Cache.Libraries[filepath] = stored
	}
}

type library_StackFiles_return struct {
	Cluster [][]_model.File_Stash
	Axiom   [][]_model.File_Stash
	Lookup  map[string]_model.File_Lookup
}

func library_Clear() {
	for s, i := range _config.Style.Library__Index {
		_action.Index_Dispose(i)
		delete(_config.Style.Library__Index, s)
	}
	for k := range Cache.Libraries {
		library_DeleteFile(k)
	}
}

func Library_CacheFiles() library_StackFiles_return {

	library_Clear()
	for filepath, content := range _config.Static.Libraries_Saved {
		library_SaveFile(filepath, content)
	}

	length := 0
	axiom_map := map[int][]_model.File_Stash{}
	cluster_map := map[int][]_model.File_Stash{}
	lookup := map[string]_model.File_Lookup{}

	for path, data := range Cache.Libraries {
		var collection map[int][]_model.File_Stash
		switch data.Manifest.Lookup.Type {
		case _model.File_Type_Axiom:
			collection = axiom_map
		case _model.File_Type_Cluster:
			collection = cluster_map
		default:
			continue
		}
		lookup[path] = data.Manifest.Lookup
		id, er := _strconv.Atoi(data.Manifest.Lookup.Id)

		if er == nil {

			if _, exists := collection[id]; !exists {
				collection[id] = []_model.File_Stash{data}
			} else {
				collection[id] = append(collection[id], data)
			}

			if id > length {
				length = id
			}
		}
	}
	axiom := _util.Array_FromNumberMap(axiom_map, length)
	cluster := _util.Array_FromNumberMap(cluster_map, length)

	return library_StackFiles_return{
		Cluster: cluster,
		Axiom:   axiom,
		Lookup:  lookup,
	}
}

func Library_Update() {
	StackLibraryFiles_ := Library_CacheFiles()
	_config.Delta.Lookup.Libraries = StackLibraryFiles_.Lookup

	// Axiom update actions
	_config.Manifest.Group.Axiom = map[string]_model.File_MetadataMap{}
	_config.Delta.Errors.Axioms = []string{}
	_config.Delta.Diagnostics.Axioms = []_model.Refer_Diagnostic{}
	axiomChart := map[string][]string{}
	axiom_counter := 0
	for index, files := range StackLibraryFiles_.Axiom {
		Cssfile_Collection_ := _style.Cssfile_Collection(files, _config.Static.MINIFY)
		_config.Manifest.Group.Axiom[_strconv.Itoa(index)] = Cssfile_Collection_.MetadataCollection
		if count := len(Cssfile_Collection_.SelectorList); count > 0 {
			axiom_counter += count
			axiomChart[_fmt.Sprint("Axiom ", index, ": ", count)] = Cssfile_Collection_.SelectorList
		}
		for _, file := range files {
			_config.Delta.Errors.Axioms = append(_config.Delta.Errors.Axioms, file.Manifest.Errors...)
			_config.Delta.Diagnostics.Axioms = append(_config.Delta.Diagnostics.Axioms, file.Manifest.Diagnostics...)
		}
	}
	_config.Delta.Report.Axioms = X.List_Chart("", axiomChart)

	// Cluster update actions
	_config.Manifest.Group.Cluster = map[string]_model.File_MetadataMap{}
	_config.Delta.Errors.Clusters = []string{}
	_config.Delta.Diagnostics.Clusters = []_model.Refer_Diagnostic{}
	clusterChart := map[string][]string{}
	cluster_counter := 0
	for index, files := range StackLibraryFiles_.Cluster {
		Cssfile_Collection_ := _style.Cssfile_Collection(files, _config.Static.MINIFY)
		_config.Manifest.Group.Cluster[_strconv.Itoa(index)] = Cssfile_Collection_.MetadataCollection
		if count := len(Cssfile_Collection_.SelectorList); count > 0 {
			cluster_counter += count
			clusterChart[_fmt.Sprint("Cluster ", index, ": ", count)] = Cssfile_Collection_.SelectorList
		}
		for _, file := range files {
			_config.Delta.Errors.Clusters = append(_config.Delta.Errors.Clusters, file.Manifest.Errors...)
			_config.Delta.Diagnostics.Clusters = append(_config.Delta.Diagnostics.Clusters, file.Manifest.Diagnostics...)
		}
	}
	_config.Delta.Report.Clusters = X.List_Chart("", clusterChart)
}

func Library_ReDeclare() {
	for _, i := range _config.Style.Library__Index {
		data := _action.Index_Fetch(i)
		copy(data.Metadata.Declarations, data.Declarations)
	}
}
