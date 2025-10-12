package stash

import (
	_fmt "fmt"
	_config "main/configs"
	_target "main/internal/target"
	_model "main/models"
	_util "main/package/utils"
	_string "strings"
)

type type_Cache struct {
	Libraries map[string]_model.File_Stash
	Artifacts map[string]_model.File_Stash
	Targetdir map[string]_target.Class
}

var Cache = type_Cache{
	Libraries: map[string]_model.File_Stash{},
	Artifacts: map[string]_model.File_Stash{},
	Targetdir: map[string]_target.Class{},
}

func Reset() {
	Cache = type_Cache{
		Libraries: map[string]_model.File_Stash{},
		Artifacts: map[string]_model.File_Stash{},
		Targetdir: map[string]_target.Class{},
	}
}

func UtilsGetUsage() string {
	chart := map[string]float64{
		"Files":  _util.String_Memory(_util.Code_JsonBuild(Cache, "")),
		"Root":   _util.String_Memory(_util.Code_JsonBuild(_config.Root, "")),
		"Delta":  _util.String_Memory(_util.Code_JsonBuild(_config.Delta, "")),
		"Class":  _util.String_Memory(_util.Code_JsonBuild(_config.Style, "")),
		"Static": _util.String_Memory(_util.Code_JsonBuild(_config.Static, "")),
		"Proxy": func() float64 {
			total := 0.0
			for _, c := range _config.Static.TargetDir_Saved {
				total += _util.String_Memory(_util.Code_JsonBuild(c, ""))
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
	return _string.Join(result, "\r\n")
}
