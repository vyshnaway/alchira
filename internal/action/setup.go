package action

import (
	_config "main/configs"
	_model "main/models"
	_fileman "main/package/fileman"
	_reflect "reflect"
)

func Setup_Environment(rootpath string, workpath string) {

	_config.Static.RootPath = rootpath
	_config.Static.WorkPath = workpath

	for id, source := range _config.Root_Scaffold {
		source.Path = _fileman.Path_Join(append([]string{rootpath}, source.Frags...)...)
		_config.Root_Scaffold[id] = source
	}

	for _, group := range []map[string]_model.File_Source{
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

	cdn := _config.Root.Url.Docs
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

func Setup_Tweaks(tweaks map[string]any) {
	_config.Saved.Tweaks = make(map[string]any)
	if tweaks == nil {
		tweaks = map[string]any{}
	}

	for key, val := range _config.Root.Tweaks {

		ual, ok := tweaks[key]
		if ok {
			switch v := ual.(type) {
			case float64:
				// Convert float64 to int if val is int
				if _, val_int_ok := val.(int); val_int_ok {
					_config.Saved.Tweaks[key] = int(v)
					continue
				}
			case int:
				if _, val_int_ok := val.(int); val_int_ok {
					_config.Saved.Tweaks[key] = v
					continue
				}
			default:
				// General type equality check
				if _reflect.TypeOf(ual) == _reflect.TypeOf(val) {
					_config.Saved.Tweaks[key] = ual
					continue
				}
			}
		}

		_config.Saved.Tweaks[key] = val
	}
}
