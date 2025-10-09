package stash

import (
	_config "main/configs"
	_action "main/internal/action"
	_target "main/internal/target"
	_model "main/models"
	_util "main/package/utils"
	_map "maps"
)

func Target_UpdateDirs() {
	Library_ReDeclare()
	Aritfact_ReDeclare()

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
		Report:        []string{},
		GlobalClasses: map[string]int{},
		PublicClasses: map[string]int{},
		FileManifests: map[string]_model.File_LocalManifest{},
	}

	for _, target := range Cache.Targetdir {
		C := target.Accumulator()
		accumulated.Report = append(accumulated.Report, C.Report...)
		_map.Copy(accumulated.GlobalClasses, C.GlobalClasses)
		_map.Copy(accumulated.PublicClasses, C.PublicClasses)
		_map.Copy(accumulated.FileManifests, C.FileManifests)
	}

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
