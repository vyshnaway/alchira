package stash

import (
	_config "main/configs"
	X "main/internal/console"
	_target "main/internal/target"
	_model "main/models"
	S "main/package/console"
	O "main/package/object"
	_map "maps"
)

type type_Cache struct {
	Handoffs  map[string]map[string]string
	Libraries map[string]*_model.File_Stash
	Artifacts map[string]*_model.File_Stash
	Targetdir map[string]*_target.Class
}

var Cache = type_Cache{
	Handoffs:  map[string]map[string]string{},
	Libraries: map[string]*_model.File_Stash{},
	Artifacts: map[string]*_model.File_Stash{},
	Targetdir: map[string]*_target.Class{},
}

func Cache_Reset() {
	Cache = type_Cache{
		Handoffs:  map[string]map[string]string{},
		Libraries: map[string]*_model.File_Stash{},
		Artifacts: map[string]*_model.File_Stash{},
		Targetdir: map[string]*_target.Class{},
	}
}

func SaveHandoffErrors() {
	for K, V := range Cache.Handoffs {
		temp := map[string]string{}
		_map.Copy(temp, V)

		for k := range _config.Manifest.Constants {
			delete(temp, k)
		}

		if len(temp) > 0 {
			r := X.Error_Standard(
				"Unresolved tokens: "+K,
				X.List_Props(O.FromUnorderedMap(temp), S.Preset.Primary, S.Preset.Text),
			)
			_config.Delta.Diagnostic.Handoffs = append(_config.Delta.Diagnostic.Handoffs, &r.Diagnostic)
			_config.Delta.Error.Handoffs = append(_config.Delta.Error.Handoffs, r.Errorstring)
		}
	}
}
