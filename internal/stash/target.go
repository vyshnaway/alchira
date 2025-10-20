package stash

import (
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_target "main/internal/target"
	_model "main/models"
	O "main/package/object"
	_util "main/package/utils"
	_map "maps"
	_slice "slices"
	_strconv "strconv"
)

func Target_UpdateDirs() {
	
	for key, data := range Cache.Targetdir {
		data.ClearFiles()
		delete(Cache.Targetdir, key)
	}
	Cache.Targetdir = map[string]_target.Class{}

	for c, i := range _config.Style.Public___Index {
		_action.Index_Dispose(i)
		delete(_config.Style.Public___Index, c)
	}
	_config.Style.Public___Index = _model.Style_ClassIndexMap{}

	for c, i := range _config.Style.Global___Index {
		_action.Index_Dispose(i)
		delete(_config.Style.Public___Index, c)
	}
	_config.Style.Global___Index = _model.Style_ClassIndexMap{}

	index := 0
	for key, files := range _config.Static.TargetDir_Saved {
		Cache.Targetdir[key] = _target.New(files, _util.String_EnCounter(index))
	}
}

func Target_Accumulate() _target.Accumulator_return {
	accumulated := _target.Accumulator_return{
		GlobalClasses: map[string]int{},
		PublicClasses: map[string]int{},
		FileManifests: map[string]_model.File_LocalManifest{},
	}

	sections := O.New[string, []string]()
	for _, target := range Cache.Targetdir {
		C := target.Accumulator()
		_map.Copy(accumulated.GlobalClasses, C.GlobalClasses)
		_map.Copy(accumulated.PublicClasses, C.PublicClasses)
		_map.Copy(accumulated.FileManifests, C.FileManifests)
		symclasses := append(
			_slice.Collect(_map.Keys(C.GlobalClasses)),
			_slice.Collect(_map.Keys(C.PublicClasses))...,
		)
		sections.Set(
			"["+target.Target+" -> "+target.Source+"]: "+_strconv.Itoa(len(symclasses)),
			symclasses,
		)
	}
	counter := len(accumulated.GlobalClasses) + len(accumulated.PublicClasses)
	accumulated.Report = X.List_Chart("Globals: "+_strconv.Itoa(counter)+" Symclasses", sections)

	return accumulated
}

func Target_GetTracks() _target.GetTracks_return {
	classtracks := [][]int{}
	attachments := []int{}

	for _, target := range Cache.Targetdir {
		tracks_ := target.GetTracks()
		classtracks = append(classtracks, tracks_.ClassTracks...)
		attachments = append(attachments, tracks_.Attachments...)
	}

	return _target.GetTracks_return{
		Attachments: attachments,
		ClassTracks: classtracks,
	}
}
