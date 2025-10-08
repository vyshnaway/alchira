package craft

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_stash_ "main/stash"
	_style_ "main/style"
	_watcher_ "main/watcher"
)

func Update_Scaffold() {
	_cache_.Index_Reset(0)

	_cache_.Style_Reset()
	_cache_.Delta_Reset()
	_cache_.Manifest_Reset()

	_stash_.Reset()
	_stash_.Artifact_Update()
	_stash_.Library_Update()
}

func Build_Targets() {
	Update_Target(_watcher_.Event{Action: _watcher_.Action_Reload})
}

func Update_Target(event _watcher_.Event) {
	switch event.Action {
	case _watcher_.Action_Update:
		if targetStruct, ok := _cache_.Static.TargetDir_Saved[event.Folder]; ok &&
			targetStruct.Stylesheet == event.FilePath {
			targetStruct.StylesheetContent = event.FileContent
			_cache_.Static.TargetDir_Saved[event.Folder] = targetStruct
		} else if _, ok := _cache_.Static.TargetDir_Saved[event.Folder].Extensions[event.Extension]; ok {
			_cache_.Static.TargetDir_Saved[event.Folder].Filepath_to_Content[event.FilePath] = event.FileContent
			_cache_.Delta.Path = _fileman_.Path_Join(_cache_.Static.TargetDir_Saved[event.Folder].Source, event.FilePath)
			_stash_.Target_UpdateDirs()
		} else {
			_cache_.Delta.Path = _fileman_.Path_Join(_cache_.Static.TargetDir_Saved[event.Folder].Source, event.FilePath)
			_cache_.Delta.Content = event.FileContent
		}
	case _watcher_.Action_Unlink:
		if targetStruct, ok := _cache_.Static.TargetDir_Saved[event.Folder]; ok {
			delete(targetStruct.Filepath_to_Content, event.FilePath)
		}
	default:
		_style_.Hashrule_Upload()
		_stash_.Target_UpdateDirs()
	}
}
