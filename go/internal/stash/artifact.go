package stash

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	X "main/internal/shell"
	_style_ "main/internal/style"
	_model "main/models"
)

func artifact_DeleteFile(filepath string) {
	if file, ok := Cache.Artifacts[filepath]; ok {
		_action.Index_Dispose(file.StyleData.UsedIn...)
		delete(Cache.Artifacts, filepath)
	}
}

func artifact_SaveFile(filepath string, content string) {
	artifact_DeleteFile(filepath)
	stored := _action.Store(_action.Store_FileGroup_Artifact, filepath, content, "", "", "")
	Cache.Artifacts[filepath] = stored
}

type artifact_StackFiles_return struct {
	Files   []_model.File_Stash
	Lookup  map[string]_model.File_Lookup
	Handoff []_model.File_Stash
}

func artifact_CacheFiles() artifact_StackFiles_return {
	artifact_Clear()
	for filepath, content := range _config.Static.Artifacts_Saved {
		artifact_SaveFile(filepath, content)
	}

	files := []_model.File_Stash{}
	lookup := map[string]_model.File_Lookup{}
	handoff := []_model.File_Stash{}

	for path, data := range Cache.Artifacts {
		reference := data.Manifest.Lookup

		if reference.Type == _model.File_Type_Artifact {
			lookup[path] = reference
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

	_config.Manifest.Group.Artifact = map[string]_model.File_MetadataMap{}
	_config.Delta.Errors.Artifacts = []string{}
	_config.Delta.Diagnostics.Artifacts = []_model.Refer_Diagnostic{}
	artifact_chart := map[string][]string{}
	artifact_counter := 0
	for _, file := range SaveArtifactFile_.Files {

		symclasses := []string{}
		metadatas := map[string]*_model.Style_Metadata{}
		for _, tagstyle := range _script.Rider(&file, []string{}, _script.E_Action_Read).StylesList {

			if len(tagstyle.SymClasses) == 0 {
				E := X.Error_Write(
					"Symclass missing declaration scope.",
					[]string{_fmt.Sprint(file.FilePath, ":", tagstyle.RowIndex, ":", tagstyle.ColIndex)},
				)
				file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
				file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
			} else if len(tagstyle.SymClasses) > 1 {
				E := X.Error_Write(
					"Multiple SymClasses declaration scope.",
					[]string{_fmt.Sprint(file.FilePath, ":", tagstyle.RowIndex, ":", tagstyle.ColIndex)},
				)
				file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
				file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
			} else {
				artifact_counter++
				Rawtag_Upload_ := _style_.Rawtag_Upload(tagstyle, &file, _config.Style.Artifact_Index, metadatas, _config.Static.MINIFY)
				styledata := _action.Index_Fetch(Rawtag_Upload_.Index)
				if len(styledata.Declarations) == 1 {
					symclasses = append(symclasses, Rawtag_Upload_.Symclass)
				}
				file.Manifest.Errors = append(file.Manifest.Errors, Rawtag_Upload_.Errors...)
				file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, Rawtag_Upload_.Diagnostics...)
			}
		}
		if len(symclasses) > 0 {
			artifact_chart[_fmt.Sprint("Artifact [", file.FilePath, "]: ", len(symclasses))] = symclasses
		}
		_config.Manifest.Group.Artifact[file.FilePath] = metadatas
		_config.Delta.Errors.Artifacts = append(_config.Delta.Errors.Artifacts, file.Manifest.Errors...)
		_config.Delta.Diagnostics.Artifacts = append(_config.Delta.Diagnostics.Artifacts, file.Manifest.Diagnostics...)
	}
	_config.Delta.Report.Artifacts = X.List_Chart("", artifact_chart)
}

func Aritfact_ReDeclare() {
	for _, i := range _config.Style.Artifact_Index {
		data := _action.Index_Fetch(i)
		copy(data.Metadata.Declarations, data.Declarations)
	}
}
