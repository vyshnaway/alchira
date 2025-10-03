package craft

import (
	// S "main/shell"
	// S "main/shell"
	// S "main/shell"
	// S "main/shell"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_stash_ "main/stash"
	_style_ "main/style"
)

func Update_Barebones() {
	_cache_.Index_Reset(0)

	_cache_.Style_Reset()
	_cache_.Delta_Reset()
	_cache_.Manifest_Reset()

	_stash_.Reset()
	_stash_.Library_Update()
	_stash_.Artifact_Update()
}

type Update_Target_action_enum int

const (
	Update_Target_action_Refresh Update_Target_action_enum = 1 << iota
	Update_Target_action_Updated
	Update_Target_action_Removed
)

func Update_Target(
	action Update_Target_action_enum,
	targetfolder string,
	filepath string,
	filecontent string,
	extension string,
) {
	reCache := true
	switch action {
	case Update_Target_action_Updated:
		if targetStruct, ok := _cache_.Static.TargetDir_Saved[targetfolder]; ok {
			if targetStruct.Stylesheet == filepath {
				targetStruct.StylesheetContent = filecontent
				_cache_.Static.TargetDir_Saved[targetfolder] = targetStruct
				reCache = false
			}
		} else if _, ok := _cache_.Static.TargetDir_Saved[targetfolder].Extensions[extension]; ok {
			_cache_.Static.TargetDir_Saved[targetfolder].Filepath_to_Content[filepath] = filecontent
			_cache_.Delta.Path = _fileman_.Path_Join(_cache_.Static.TargetDir_Saved[targetfolder].Source, filepath)
		} else {
			_cache_.Delta.Path = _fileman_.Path_Join(_cache_.Static.TargetDir_Saved[targetfolder].Source, filepath)
			_cache_.Delta.Content = filecontent
			reCache = false
		}
	case Update_Target_action_Removed:
		if targetStruct, ok := _cache_.Static.TargetDir_Saved[targetfolder]; ok {
			delete(targetStruct.Filepath_to_Content, filepath)
		}
	default:
		_style_.Hashrule_Upload()
	}

	if reCache {
		_stash_.Target_UpdateDirs()
	}
}
