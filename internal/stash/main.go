package stash

import (
	_fmt "fmt"
	_config "main/configs"
	"main/internal/console"
	_target "main/internal/target"
	_model "main/models"
	S "main/package/console"
	O "main/package/object"
	_util "main/package/utils"
	"maps"
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

func Reset() {
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
		maps.Copy(temp, V)

		for k := range _config.Manifest.Constants {
			delete(temp, k)
		}

		if len(temp) > 0 {
			r := console.Error_Standard(
				"Unresolved tokens: "+K,
				console.List_Props(O.FromUnorderedMap(temp), S.Preset.Primary, S.Preset.Text),
			)
			_config.Delta.Diagnostic.Handoffs = append(_config.Delta.Diagnostic.Handoffs, &r.Diagnostic)
			_config.Delta.Error.Handoffs = append(_config.Delta.Error.Handoffs, r.Errorstring)
		}
	}
}

func UtilsGetUsage() string {
	measureMemory := func(data any) float64 {
		r, _ := _util.Code_JsoncBuild(data, "")
		return _util.String_Memory(r)
	}

	chart := map[string]float64{
		"Files":  measureMemory(Cache),
		"Root":   measureMemory(_config.Root),
		"Delta":  measureMemory(_config.Delta),
		"Class":  measureMemory(_config.Style),
		"Static": measureMemory(_config.Static),
		"Proxy": func() float64 {
			total := 0.0
			for _, c := range _config.Saved.TargetDir_Saved {
				total += measureMemory(c)
			}
			return total
		}(),
	}

	total := 0.0
	for _, v := range chart {
		total += v
	}
	chart["Total"] = total

	var result []string
	for k, v := range chart {
		result = append(result, _fmt.Sprintf("%s : %.2f Kb", k, float64(v)))
	}

	return S.MAKE("", result, S.MakeList{Preset: S.Preset.Tertiary, TypeFunc: S.List.Catalog})
}
