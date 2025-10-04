package action

import (
	_cache_ "main/cache"
	_types_ "main/types"
	_fileman_ "main/fileman"
	_maps_ "maps"
	_reflect_ "reflect"
	_strings_ "strings"
)

func Setup_Environment(rootpath string, workpath string) {

	_cache_.Static.RootPath = rootpath
	_cache_.Static.WorkPath = workpath

	for id, source := range _cache_.Sync_Blueprint {
		source.Path = _fileman_.Path_Join(append([]string{rootpath}, source.Frags...)...)
		_cache_.Sync_Blueprint[id] = source
	}

	for _, group := range []map[string]_types_.File_Source{
		_cache_.Path_Autogen,
		_cache_.Path_Css,
		_cache_.Path_Files,
		_cache_.Path_Folder,
		_cache_.Path_Json,
	} {
		for id, source := range group {
			source.Path = _fileman_.Path_Join(append([]string{workpath}, source.Frags...)...)
			group[id] = source
		}
	}

	cdn := _cache_.Root.Url.Docs + "version/" + _strings_.Split(_cache_.Root.Version, ".")[0] + "/"
	for id, source := range _cache_.Sync_Agreements {
		source.Url = cdn + source.Url
		source.Path = _fileman_.Path_Join(append([]string{rootpath}, source.Frags...)...)
		_cache_.Sync_Agreements[id] = source
	}
	for id, source := range _cache_.Sync_References {
		source.Url = cdn + source.Url
		source.Path = _fileman_.Path_Join(append([]string{rootpath}, source.Frags...)...)
		_cache_.Sync_Agreements[id] = source
	}
}

func Setup_Tweaks(tweaks map[string]any) {
	_maps_.Copy(_cache_.Static.Tweaks, _cache_.Root.Tweaks)

	for key, val := range _cache_.Root.Tweaks {
		if _reflect_.TypeOf(tweaks[key]) == _reflect_.TypeOf(val) {
			_cache_.Static.Tweaks[key] = tweaks[key]
		}
	}
}
