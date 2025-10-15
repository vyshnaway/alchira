package action

import (
	_config "main/configs"
	_model "main/models"
	_fileman "main/package/fileman"
	_reflect "reflect"
	_slice "slices"
	_string "strings"
)

func Setup_Environment(rootpath string, workpath string) {

	_config.Static.RootPath = rootpath
	_config.Static.WorkPath = workpath

	for id, source := range _config.Sync_Blueprint {
		source.Path = _fileman.Path_Join(append([]string{rootpath}, source.Frags...)...)
		_config.Sync_Blueprint[id] = source
	}

	for _, group := range []map[string]_model.File_Source{
		_config.Path_Autogen,
		_config.Path_Css,
		_config.Path_Files,
		_config.Path_Folder,
		_config.Path_Json,
	} {
		for id, source := range group {
			source.Path = _fileman.Path_Join(append([]string{workpath}, source.Frags...)...)
			group[id] = source
		}
	}

	cdn := _config.Root.Url.Docs + "version/" + _string.Split(_config.Root.Version, ".")[0] + "/"
	for id, source := range _config.Sync_Agreements {
		source.Url = cdn + source.Url
		source.Path = _fileman.Path_Join(append([]string{rootpath}, source.Frags...)...)
		_config.Sync_Agreements[id] = source
	}
	for id, source := range _config.Sync_References {
		source.Url = cdn + source.Url
		source.Path = _fileman.Path_Join(append([]string{rootpath}, source.Frags...)...)
		_config.Sync_References[id] = source
	}
}

func Setup_Ignorefiles() {
	ignorepath := _config.Path_Autogen["ignore"].Path

	project_ignores := []string{}
	if result, err := _fileman.Read_File(ignorepath, false); err == nil {
		for ig := range _string.SplitSeq(result, "\r\n") {
			project_ignores = append(project_ignores, _string.Trim(ig, "\r\t "))
		}

	}

	points := 0
	default_ignores := _string.SplitSeq(_config.Path_Autogen["ignore"].Content, "\r\n")
	for ignore := range default_ignores {
		if !_slice.Contains(project_ignores, ignore) {
			points++
			project_ignores = append(project_ignores, ignore)
		}
	}
	if points > 0 {
		_fileman.Write_File(ignorepath, _string.Join(project_ignores, "\r\n"))
	}
}

func Setup_Tweaks(tweaks map[string]any) {
	_config.Static.Tweaks = _config.Root.Tweaks

	if tweaks != nil {
		for key, val := range _config.Root.Tweaks {
			if _reflect.TypeOf(tweaks[key]) == _reflect.TypeOf(val) {
				_config.Static.Tweaks[key] = tweaks[key]
			}
		}
	}
}
