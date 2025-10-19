package compiler

import (
	_config "main/configs"
	_action "main/internal/action"
	_stash "main/internal/stash"
	_style "main/internal/style"
	_model "main/models"
	_css "main/package/css"
	_util "main/package/utils"
)

func Update_Cache() {
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
	_style.Hashrule_Upload()
	_stash.Target_UpdateDirs()
}
