package action

import (
	_config "main/configs"
	S "main/package/console"
	_css "main/package/css"
	_fileman "main/package/fileman"
	_util "main/package/utils"
)

func Save_RootCss() {
	_config.Saved.RootCSS = _css.Read_Files([]string{
		_config.Path_Css["atrules"].Path,
		_config.Path_Css["constants"].Path,
		_config.Path_Css["elements"].Path,
		_config.Path_Css["extends"].Path,
	})
}

func Save_Libraries() {
	_config.Saved.Libraries_Saved, _ = _fileman.Read_Bulk(
		_config.Path_Folder["libraries"].Path,
		[]string{"css"},
	)
}

func Save_Artifacts() {
	// _config.Saved.Artifacts_Saved, _ = _fileman.Read_Bulk(
	// 	_config.Path_Folder["artifacts"].Path,
	// 	[]string{_config.Root.Extension, "json"},
	// )
}

func Save_Targets() {
	S.TASK("Saving Proxy-folders", 1)
	_config.Saved.TargetDir_Saved = Sync_ProxyMapDirs(_config.Saved.ProxyMap)
}

func Save_Hashrule() (Report string, Status bool) {

	S.TASK("Saving Hashrule", 1)

	status := true
	errors := make([]string, 0, 1)
	_config.Saved.Hashrule = map[string]string{}
	hashrule_path := _config.Path_Json["hashrule"].Path
	if content, err := _fileman.Read_File(hashrule_path, false); err == nil {
		if hashrules, e := _util.Code_JsoncParse[map[string]string](content); e == nil {
			_config.Saved.Hashrule = hashrules
		} else {
			status = false
			errors = append(errors, "Bad "+hashrule_path+" file data.")
		}
	} else {
		status = false
		errors = append(errors, "Failed to read "+hashrule_path+".")
	}

	report := S.MAKE(
		S.Tag.H4("Hashrule error: "+hashrule_path, S.Preset.Failed, S.Style.AS_Bold),
		errors,
		S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed, Styles: []string{S.Style.AS_Bold}},
	)

	return report, status
}
