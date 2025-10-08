package stash

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_cache_ "main/cache"
	_script_ "main/script"
	"main/shell"

	// "main/shell"
	_style_ "main/style"
	_types_ "main/types"
	X "main/xhell"
)

func artifact_DeleteFile(filepath string) {
	if file, ok := Cache.Artifacts[filepath]; ok {
		_cache_.Index_Dispose(file.StyleData.UsedIn...)
		delete(Cache.Artifacts, filepath)
	}
}

func artifact_SaveFile(filepath string, content string) {
	artifact_DeleteFile(filepath)
	stored := _action_.Store(_action_.Store_FileGroup_Artifact, filepath, content, "", "", "")
	Cache.Artifacts[filepath] = stored
}

type artifact_StackFiles_return struct {
	Files   []_types_.File_Stash
	Lookup  map[string]_types_.File_Lookup
	Handoff []_types_.File_Stash
}

func artifact_CacheFiles() artifact_StackFiles_return {
	artifact_Clear()
	for filepath, content := range _cache_.Static.Artifacts_Saved {
		artifact_SaveFile(filepath, content)
	}

	files := []_types_.File_Stash{}
	lookup := map[string]_types_.File_Lookup{}
	handoff := []_types_.File_Stash{}

	for path, data := range Cache.Artifacts {
		reference := data.Manifest.Lookup

		if reference.Type == _types_.File_Type_Artifact {
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
	for s, i := range _cache_.Style.Artifact_Index {
		_cache_.Index_Dispose(i)
		delete(_cache_.Style.Artifact_Index, s)
	}

	for k := range Cache.Artifacts {
		artifact_DeleteFile(k)
	}
}

func Artifact_Update() {

	SaveArtifactFile_ := artifact_CacheFiles()
	_cache_.Delta.Lookup.Artifacts = SaveArtifactFile_.Lookup

	_cache_.Manifest.Artifact = map[string]_types_.File_MetadataMap{}
	_cache_.Delta.Errors.Artifacts = []string{}
	_cache_.Delta.Diagnostics.Artifacts = []_types_.Refer_Diagnostic{}
	artifact_chart := map[string][]string{}
	artifact_counter := 0
	for _, file := range SaveArtifactFile_.Files {

		symclasses := []string{}
		metadatas := map[string]*_types_.Style_Metadata{}
		for _, tagstyle := range _script_.Rider(&file, []string{}, _types_.Script_Action_Read).StylesList {

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
				Rawtag_Upload_ := _style_.Rawtag_Upload(tagstyle, &file, &_cache_.Style.Artifact_Index, _cache_.Static.VERBOSE)
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
			artifact_chart[_fmt_.Sprint("Artifact [", file.FilePath, "]: ", len(symclasses))] = symclasses
		}
		_cache_.Manifest.Artifact[file.FilePath] = metadatas
		_cache_.Delta.Errors.Artifacts = append(_cache_.Delta.Errors.Artifacts, file.Manifest.Errors...)
		_cache_.Delta.Diagnostics.Artifacts = append(_cache_.Delta.Diagnostics.Artifacts, file.Manifest.Diagnostics...)
	}
	_cache_.Delta.Report.Artifacts = X.List_Chart("", artifact_chart)
	shell.Post(_cache_.Delta.Report.Artifacts)
}

func Aritfact_ReDeclare() {
	for _, i := range _cache_.Style.Artifact_Index {
		data := _cache_.Index_Fetch(i)
		copy(data.Metadata.Declarations, data.Declarations)
	}
}
