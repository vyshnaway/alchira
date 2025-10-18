package compiler

import (
	_config "main/configs"
	_action "main/internal/action"
	_stash "main/internal/stash"
	_style "main/internal/style"
	_model "main/models"
	_css "main/package/css"
	_fileman "main/package/fileman"
	_util "main/package/utils"
	_watcher "main/package/watchman"
)

func Update_Blueprint() {
	_action.Index_Reset(0)

	_config.Style_Reset()
	_config.Delta_Reset()
	_config.Manifest_Reset()

	_stash.Reset()
	_stash.Artifact_Update()
	_stash.Library_Update()

	index_scanned := _style.Cssfile_String(_util.Code_Uncomment(_config.Static.RootCSS, false, true, false), "INDEX | ")
	_config.Manifest.Constants = index_scanned.Variables.ToMap()
	for _, attachment := range index_scanned.Attachments {
		if res := _action.Index_Find(attachment, _model.Style_ClassIndexMap{}); res.Index > 0 {
			_config.Delta.IndexAttach = append(_config.Delta.IndexAttach, res.Index)
		}
	}
	_config.Delta.IndexBuild = _css.Render_Sequence(index_scanned.Result, _config.Static.MINIFY)
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
	case _watcher.E_Action_Refactor:
		if targetStruct, ok := _config.Static.TargetDir_Saved[event.Folder]; ok {
			delete(targetStruct.Filepath_to_Content, event.FilePath)
		}
	default:
		_style.Hashrule_Upload()
		_stash.Target_UpdateDirs()
	}
}
