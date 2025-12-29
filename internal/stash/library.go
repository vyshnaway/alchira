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
		_action.Index_Dispose(file.Cache.UsedIn...)
		delete(Cache.Libraries, filepath)
	}
}

func library_SaveFile(filepath string, content string) {
	library_DeleteFile(filepath)
	stored := _action.CreateContext(_action.Store_FileGroup_Library, filepath, content, "", "", "")
	if stored.LibLevel < 3 {
		Cache.Libraries[filepath] = stored
	}
}

type library_StackFiles_return struct {
	Group  [][]*_model.File_Stash
	Axiom  [][]*_model.File_Stash
	Lookup map[string]*_model.File_CacheData
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
	group_map := map[int][]*_model.File_Stash{}
	lookup := map[string]*_model.File_CacheData{}

	for path, data := range Cache.Libraries {
		var collection map[int][]*_model.File_Stash
		switch data.Cache.Type {
		case _model.File_Type_Axiom:
			collection = axiom_map
		case _model.File_Type_Group:
			collection = group_map
		default:
			continue
		}
		lookup[path] = data.Cache
		id, er := _strconv.Atoi(data.Cache.Id)

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
	group := Array_FromNumberMap(group_map, length)

	return library_StackFiles_return{
		Group:  group,
		Axiom:  axiom,
		Lookup: lookup,
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
	_config.Delta.Report.Axioms = X.List_Chart("Axiom: "+_strconv.Itoa(axiom_counter)+" Symlinks", axiom_chart)

	// Group update actions
	_config.Manifest.Group.Group = map[string]_model.Style_ClassIndexMap{}
	_config.Delta.Error.Groups = []string{}
	_config.Delta.Diagnostic.Groups = []*_model.File_Diagnostic{}
	group_chart := O.New[string, []string](len(StackLibraryFiles_.Group))
	group_counter := 0
	for index, files := range StackLibraryFiles_.Group {
		Cssfile_Collection_ := _style.Cssfile_Collection(files)
		_map.Copy(_config.Style.Library__Index, Cssfile_Collection_.SelectorMap)
		_config.Manifest.Group.Group[_strconv.Itoa(index)] = Cssfile_Collection_.SelectorMap
		if count := len(Cssfile_Collection_.SelectorList); count > 0 {
			group_counter += count
			group_chart.Set(
				_fmt.Sprint("Level ", index, ": ", count),
				Cssfile_Collection_.SelectorList,
			)
		}
		for _, file := range files {
			_config.Delta.Error.Groups = append(_config.Delta.Error.Groups, file.Errors...)
			_config.Delta.Diagnostic.Groups = append(_config.Delta.Diagnostic.Groups, file.Diagnostics...)
		}
	}
	_config.Delta.Report.Groups = X.List_Chart("Groups: "+_strconv.Itoa(group_counter)+" Symlinks", group_chart)
}
