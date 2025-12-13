package action

import (
	_config "main/configs"
	_model "main/models"
	_fileman "main/package/fileman"
	_reflect "reflect"
)

func Setup_Environment(compilerdir, relWorkpath, absWorkpath string, config _model.Compiler_Config) (flavourable bool) {

	_config.Static.RootPath = compilerdir
	_config.Static.WorkPath = relWorkpath

	var FlavRef _model.Compiler_Flavor
	if res, ok := config.Flavour.Workspace[absWorkpath]; ok {
		FlavRef = res
	}

	if blueprint := FlavRef.Blueprint; len(blueprint) > 0 && _fileman.Path_IfDir(blueprint) {
		flavourable = true
		_config.Root_Flavor["blueprint"].Path = blueprint
	} else {
		_config.Root_Flavor["blueprint"].Path = config.Flavour.Default.Blueprint
	}

	if libraries := FlavRef.Libraries; len(libraries) > 0 && _fileman.Path_IfDir(libraries) {
		flavourable = true
		_config.Root_Flavor["libraries"].Path = libraries
	} else {
		_config.Root_Flavor["libraries"].Path = config.Flavour.Default.Libraries
	}

	if sandbox := FlavRef.Sandbox; len(sandbox) > 0 && _fileman.Path_IfDir(sandbox) {
		flavourable = true
		_config.Root_Flavor["sandbox"].Path = sandbox
	} else {
		_config.Root_Flavor["sandbox"].Path = config.Flavour.Default.Sandbox

	}

	if flavourable {
		_config.Root.Flavor = FlavRef
	} else {
		_config.Root.Flavor = config.Flavour.Default
	}

	for _, group := range []map[string]_model.File_Source{
		_config.Path_Css,
		_config.Path_Files,
		_config.Path_Folder,
		_config.Path_Json,
	} {
		for id, source := range group {
			source.Path = _fileman.Path_Join(append([]string{relWorkpath}, source.Frags...)...)
			group[id] = source
		}
	}

	cdn := _config.Root.Url.Cdn
	for id, source := range _config.Sync_Agreements {
		source.Url = cdn + source.Url
		source.Path = _fileman.Path_Join(append([]string{compilerdir}, source.Frags...)...)
		_config.Sync_Agreements[id] = source
	}
	for id, source := range _config.Sync_References {
		source.Url = cdn + source.Url
		source.Path = _fileman.Path_Join(append([]string{compilerdir}, source.Frags...)...)
		_config.Sync_References[id] = source
	}

	return flavourable
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

func Setup_Sandbox(configs map[string]any) {
	if configs == nil {
		_config.Saved.Sandbox = map[string]any{}
	} else {
		_config.Saved.Sandbox = configs
	}
}
