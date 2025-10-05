package stash

import (
	_cache_ "main/cache"
	_target_ "main/class/Target"
	_types_ "main/types"
	_utils_ "main/utils"
	_maps_ "maps"
)

func Target_UpdateDirs() {
	Library_ReDeclare()
	Aritfact_ReDeclare()

	for key, data := range Cache.Targetdir {
		data.ClearFiles()
		delete(_cache_.Static.TargetDir_Saved, key)
	}
	Cache.Targetdir = map[string]_target_.Class{}

	for c, i := range _cache_.Style.Public___Index {
		_cache_.Index_Dispose(i)
		delete(_cache_.Style.Public___Index, c)
	}
	_cache_.Style.Public___Index = _types_.Style_ClassIndexMap{}

	for c, i := range _cache_.Style.Global___Index {
		_cache_.Index_Dispose(i)
		delete(_cache_.Style.Public___Index, c)
	}
	_cache_.Style.Global___Index = _types_.Style_ClassIndexMap{}

	index := 0
	for key, files := range _cache_.Static.TargetDir_Saved {
		Cache.Targetdir[key] = _target_.New(files, _utils_.String_EnCounter(index))
	}
}

func Target_Accumulate() _target_.Accumulator_return {
	accumulated := _target_.Accumulator_return{
		Report:        []string{},
		GlobalClasses: map[string]int{},
		PublicClasses: map[string]int{},
		FileManifests: map[string]_types_.File_LocalManifest{},
	}

	for _, target := range Cache.Targetdir {
		C := target.Accumulator()
		accumulated.Report = append(accumulated.Report, C.Report...)
		_maps_.Copy(accumulated.GlobalClasses, C.GlobalClasses)
		_maps_.Copy(accumulated.PublicClasses, C.PublicClasses)
		_maps_.Copy(accumulated.FileManifests, C.FileManifests)
	}

	return accumulated
}

func Target_GetTracks() _target_.GetTracks_return {
	classtracks := [][]int{}
	attachments := []int{}

	for _, target := range Cache.Targetdir {
		tracks_ := target.GetTracks()
		classtracks = append(classtracks, tracks_.ClassTracks...)
		attachments = append(attachments, tracks_.Attachments...)
	}

	return _target_.GetTracks_return{
		Attachments: attachments,
		ClassTracks: classtracks,
	}
}
