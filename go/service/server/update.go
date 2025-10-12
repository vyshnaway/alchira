package server

import (
	_config "main/configs"
	_action "main/internal/action"
	_stash "main/internal/stash"
	_style "main/internal/style"
	_fileman "main/package/fileman"
	_util "main/package/utils"
	_watcher "main/package/watcher"
)

func Update_Scaffold() {
	_action.Index_Reset(0)

	_config.Style_Reset()
	_config.Delta_Reset()
	_config.Manifest_Reset()

	_stash.Reset()
	_stash.Artifact_Update(_config.Static.DEBUG)
	_stash.Library_Update(_config.Static.DEBUG)

	index_scanned := _style.Cssfile_String(
		_util.Code_Uncomment(_config.Static.RootCSS, false, true, false),
		"INDEX | ",
		_config.Static.DEBUG,
	)
	_config.Manifest.Constants = index_scanned.Variables.ToMap()
}

func Build_Targets() {
	Update_Target(_watcher.Event{Action: _watcher.E_Action_Reload})
}

func Update_Target(event _watcher.Event) {
	switch event.Action {
	case _watcher.E_Action_Update:
		if targetStruct, ok := _config.Static.TargetDir_Saved[event.Folder]; ok &&
			targetStruct.Stylesheet == event.FilePath {
			targetStruct.StylesheetContent = event.FileContent
			_config.Static.TargetDir_Saved[event.Folder] = targetStruct
		} else if _, ok := _config.Static.TargetDir_Saved[event.Folder].Extensions[event.Extension]; ok {
			_config.Static.TargetDir_Saved[event.Folder].Filepath_to_Content[event.FilePath] = event.FileContent
			_config.Delta.Path = _fileman.Path_Join(_config.Static.TargetDir_Saved[event.Folder].Source, event.FilePath)
			_stash.Target_UpdateDirs()
		} else {
			_config.Delta.Path = _fileman.Path_Join(_config.Static.TargetDir_Saved[event.Folder].Source, event.FilePath)
			_config.Delta.Content = event.FileContent
		}
	case _watcher.E_Action_Unlink:
		if targetStruct, ok := _config.Static.TargetDir_Saved[event.Folder]; ok {
			delete(targetStruct.Filepath_to_Content, event.FilePath)
		}
	default:
		_style.Hashrule_Upload()
		_stash.Target_UpdateDirs()
	}
}
