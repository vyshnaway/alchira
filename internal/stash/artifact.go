package stash

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_script "main/internal/script"
	_style_ "main/internal/style"
	_model "main/models"
	O "main/package/object"
	"main/package/utils"
	_strconv "strconv"
)

func artifact_DeleteFile(filepath string) {
	if file, ok := Cache.Artifacts[filepath]; ok {
		_action.Index_Dispose(file.StyleData.UsedIn...)
		delete(Cache.Artifacts, filepath)
	}
}

func artifact_SaveFile(filepath, content, label string) {
	artifact_DeleteFile(filepath)
	stored := _action.Store(_action.Store_FileGroup_Artifact, filepath, content, "", "", label)
	Cache.Artifacts[filepath] = stored
}

type artifact_StackFiles_return struct {
	Files   []*_model.File_Stash
	Lookup  map[string]_model.File_Lookup
	Handoff []*_model.File_Stash
}

func artifact_CacheFiles() artifact_StackFiles_return {
	artifact_Clear()
	i := 0
	for filepath, content := range _config.Static.Artifacts_Saved {
		artifact_SaveFile(
			filepath,
			content,
			string(_config.Lodash_rune)+utils.String_EnCounter(i),
		)
		i++
	}

	files := []*_model.File_Stash{}
	lookup := map[string]_model.File_Lookup{}
	handoff := []*_model.File_Stash{}

	for path, data := range Cache.Artifacts {

		if data.Lookup.Type == _model.File_Type_Artifact {
			lookup[path] = data.Lookup
			files = append(files, data)
		} else {
			handoff = append(handoff, data)

		}
	}

	return artifact_StackFiles_return{
		Files:   files,
		Lookup:  lookup,
		Handoff: handoff,
	}
}

func artifact_Clear() {
	for s, i := range _config.Style.Artifact_Index {
		_action.Index_Dispose(i)
		delete(_config.Style.Artifact_Index, s)
	}

	for k := range Cache.Artifacts {
		artifact_DeleteFile(k)
	}
}

func Artifact_Update() {

	SaveArtifactFile_ := artifact_CacheFiles()
	_config.Delta.Lookup.Artifacts = SaveArtifactFile_.Lookup

	_config.Manifest.Group.Artifact = map[string]_model.File_SymclassIndexMap{}
	_config.Delta.Error.Artifacts = []string{}
	_config.Delta.Diagnostic.Artifacts = []_model.File_Diagnostic{}
	artifact_chart := O.New[string, []string]()
	artifact_counter := 0
	for _, file := range SaveArtifactFile_.Files {

		symclasses := []string{}
		metadatas := _model.File_SymclassIndexMap{}
		for _, tagstyle := range _script.Rider(file, []string{}, _script.E_Action_Read).StylesList {

			if len(tagstyle.SymClasses) == 0 {
				E := X.Error_Standard(
					"Symclass missing declaration scope.",
					[]string{_fmt.Sprint(file.FilePath, ":", tagstyle.RowIndex, ":", tagstyle.ColIndex)},
				)
				file.Errors = append(file.Errors, E.Errorstring)
				file.Diagnostics = append(file.Diagnostics, E.Diagnostic)
			} else if len(tagstyle.SymClasses) > 1 {
				E := X.Error_Standard(
					"Multiple SymClasses declaration scope.",
					[]string{_fmt.Sprint(file.FilePath, ":", tagstyle.RowIndex, ":", tagstyle.ColIndex)},
				)
				file.Errors = append(file.Errors, E.Errorstring)
				file.Diagnostics = append(file.Diagnostics, E.Diagnostic)
			} else {
				artifact_counter++
				Rawtag_Upload_ := _style_.Rawtag_Upload(tagstyle, file, _config.Style.Artifact_Index, metadatas)
				if _, k := _config.Style.Artifact_Index[Rawtag_Upload_.Symclass]; !k {
					symclasses = append(symclasses, Rawtag_Upload_.Symclass)
					_config.Style.Artifact_Index[Rawtag_Upload_.Symclass] = Rawtag_Upload_.Index
				}

				file.Errors = append(file.Errors, Rawtag_Upload_.Errors...)
				file.Diagnostics = append(file.Diagnostics, Rawtag_Upload_.Diagnostics...)
			}
		}
		if len(symclasses) > 0 {
			artifact_chart.Set(
				_fmt.Sprint("[", file.FilePath, "]: ", len(symclasses)),
				symclasses,
			)
		}
		_config.Manifest.Group.Artifact[file.FilePath] = metadatas
		_config.Delta.Error.Artifacts = append(_config.Delta.Error.Artifacts, file.Errors...)
		_config.Delta.Diagnostic.Artifacts = append(_config.Delta.Diagnostic.Artifacts, file.Diagnostics...)
	}
	_config.Delta.Report.Artifacts = X.List_Chart("Artifact: "+_strconv.Itoa(artifact_counter)+" Symclasses", artifact_chart)
}
