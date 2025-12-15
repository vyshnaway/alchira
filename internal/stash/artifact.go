package stash

import (
	_json "encoding/json"
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_script "main/internal/script"
	_style_ "main/internal/style"
	_model "main/models"
	O "main/package/object"
	_util "main/package/utils"
	_strconv "strconv"
)

func artifact_DeleteFile(filepath string) {
	if file, ok := Cache.Artifacts[filepath]; ok {
		_action.Index_Dispose(file.Cache.UsedIn...)
		delete(Cache.Artifacts, filepath)
	}
}

func artifact_SaveFile(filepath, content, label string) {
	artifact_DeleteFile(filepath)
	stored := _action.CreateContext(_action.Store_FileGroup_Artifact, filepath, content, "", "", label)
	Cache.Artifacts[filepath] = stored
}

type artifact_StackFiles_return struct {
	Files   []*_model.File_Stash
	Lookup  map[string]*_model.File_CacheData
	Handoff []*_model.File_Stash
}

func artifact_CacheFiles() artifact_StackFiles_return {
	artifact_Clear()
	i := 0
	for filepath, content := range _config.Saved.Artifacts_Saved {
		artifact_SaveFile(
			filepath,
			content,
			"_"+_util.String_EnCounter(i),
		)
		i++
	}

	files := make([]*_model.File_Stash, len(Cache.Artifacts))
	lookup := make(map[string]*_model.File_CacheData, len(Cache.Artifacts))
	handoff := make([]*_model.File_Stash, len(Cache.Artifacts))

	for path, data := range Cache.Artifacts {

		if data.Cache.Type == _model.File_Type_Artifact {
			lookup[path] = data.Cache
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
	Cache.Handoffs = make(map[string]map[string]string, len(_config.Style.Artifact_Index))

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

	for _, file := range SaveArtifactFile_.Handoff {
		var archive _model.Config_Archive
		if err := _json.Unmarshal([]byte(file.Content), &archive); err == nil {
			if archive.Constants != nil {
				Cache.Handoffs[file.FilePath] = archive.Constants
			}
		}
	}

	_config.Manifest.Group.Artifact = map[string]_model.Style_ClassIndexMap{}
	_config.Delta.Error.Artifacts = []string{}
	_config.Delta.Diagnostic.Artifacts = []*_model.File_Diagnostic{}
	artifact_chart := O.New[string, []string](len(SaveArtifactFile_.Files))
	artifact_counter := 0
	for _, file := range SaveArtifactFile_.Files {
		Cache.Artifacts[file.FilePath] = file

		symclasses := []string{}
		metadatas := _model.Style_ClassIndexMap{}
		for _, tagstyle := range _script.Rider(file, _script.E_Method_Read, map[int]bool{}).StylesList {

			if len(tagstyle.SymClasses) == 0 {
				E := X.Error_Standard(
					"Symclass missing declaration scope.",
					[]string{_fmt.Sprint(file.FilePath, ":", tagstyle.Range.Start.Row, ":", tagstyle.Range.Start.Col)},
				)
				file.Errors = append(file.Errors, E.Errorstring)
				file.Diagnostics = append(file.Diagnostics, &E.Diagnostic)
			} else if len(tagstyle.SymClasses) > 1 {
				E := X.Error_Standard(
					"Multiple SymClasses declaration scope.",
					[]string{_fmt.Sprint(file.FilePath, ":", tagstyle.Range.Start.Row, ":", tagstyle.Range.Start.Col)},
				)
				file.Errors = append(file.Errors, E.Errorstring)
				file.Diagnostics = append(file.Diagnostics, &E.Diagnostic)
			} else {
				artifact_counter++
				Rawtag_Upload_ := _style_.Rawtag_Upload(tagstyle, file, _config.Style.Artifact_Index)
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
