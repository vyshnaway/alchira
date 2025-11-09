package stash

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_style "main/internal/style"
	_model "main/models"
	O "main/package/object"
	_map "maps"
	_strconv "strconv"
)

func library_DeleteFile(filepath string) {
	if file, ok := Cache.Libraries[filepath]; ok {
		_action.Index_Dispose(file.Style.UsedIn...)
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
	Cluster [][]*_model.File_Stash
	Axiom   [][]*_model.File_Stash
	Lookup  map[string]*_model.File_Lookup
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
	for filepath, content := range _config.Saved.Libraries_Saved {
		library_SaveFile(filepath, content)
	}

	length := 0
	axiom_map := map[int][]*_model.File_Stash{}
	cluster_map := map[int][]*_model.File_Stash{}
	lookup := map[string]*_model.File_Lookup{}

	for path, data := range Cache.Libraries {
		var collection map[int][]*_model.File_Stash
		switch data.Lookup.Type {
		case _model.File_Type_Axiom:
			collection = axiom_map
		case _model.File_Type_Cluster:
			collection = cluster_map
		default:
			continue
		}
		lookup[path] = &data.Lookup
		id, er := _strconv.Atoi(data.Lookup.Id)

		if er == nil {

			if _, exists := collection[id]; !exists {
				collection[id] = []*_model.File_Stash{data}
			} else {
				collection[id] = append(collection[id], data)
			}

			if id > length {
				length = id
			}
		}
	}
	axiom := Array_FromNumberMap(axiom_map, length)
	cluster := Array_FromNumberMap(cluster_map, length)

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
	_config.Manifest.Group.Axiom = map[string]_model.Style_ClassIndexMap{}
	_config.Delta.Error.Axioms = []string{}
	_config.Delta.Diagnostic.Axioms = []*_model.File_Diagnostic{}
	axiom_chart := O.New[string, []string](len(StackLibraryFiles_.Axiom))
	axiom_counter := 0
	for index, files := range StackLibraryFiles_.Axiom {
		Cssfile_Collection_ := _style.Cssfile_Collection(files)
		_map.Copy(_config.Style.Library__Index, Cssfile_Collection_.SelectorMap)
		_config.Manifest.Group.Axiom[_strconv.Itoa(index)] = Cssfile_Collection_.SelectorMap
		if count := len(Cssfile_Collection_.SelectorList); count > 0 {
			axiom_counter += count
			axiom_chart.Set(
				_fmt.Sprint("Level ", index, ": ", count),
				Cssfile_Collection_.SelectorList,
			)
		}
		for _, file := range files {
			_config.Delta.Error.Axioms = append(_config.Delta.Error.Axioms, file.Errors...)
			_config.Delta.Diagnostic.Axioms = append(_config.Delta.Diagnostic.Axioms, file.Diagnostics...)
		}
	}
	_config.Delta.Report.Axioms = X.List_Chart("Axiom: "+_strconv.Itoa(axiom_counter)+" Symclasses", axiom_chart)

	// Cluster update actions
	_config.Manifest.Group.Cluster = map[string]_model.Style_ClassIndexMap{}
	_config.Delta.Error.Clusters = []string{}
	_config.Delta.Diagnostic.Clusters = []*_model.File_Diagnostic{}
	cluster_chart := O.New[string, []string](len(StackLibraryFiles_.Cluster))
	cluster_counter := 0
	for index, files := range StackLibraryFiles_.Cluster {
		Cssfile_Collection_ := _style.Cssfile_Collection(files)
		_map.Copy(_config.Style.Library__Index, Cssfile_Collection_.SelectorMap)
		_config.Manifest.Group.Cluster[_strconv.Itoa(index)] = Cssfile_Collection_.SelectorMap
		if count := len(Cssfile_Collection_.SelectorList); count > 0 {
			cluster_counter += count
			cluster_chart.Set(
				_fmt.Sprint("Level ", index, ": ", count),
				Cssfile_Collection_.SelectorList,
			)
		}
		for _, file := range files {
			_config.Delta.Error.Clusters = append(_config.Delta.Error.Clusters, file.Errors...)
			_config.Delta.Diagnostic.Clusters = append(_config.Delta.Diagnostic.Clusters, file.Diagnostics...)
		}
	}
	_config.Delta.Report.Clusters = X.List_Chart("Cluster: "+_strconv.Itoa(cluster_counter)+" Symclasses", cluster_chart)
}
