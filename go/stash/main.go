package stash

import (
	_fmt_ "fmt"
	_cache_ "main/cache"
	_target_ "main/class/Target"
	_types_ "main/types"
	_utils_ "main/utils"
	_strings_ "strings"
)

type type_Cache struct {
	Libraries map[string]_types_.File_Stash
	Artifacts map[string]_types_.File_Stash
	Targetdir map[string]_target_.Class
}

var Cache = type_Cache{
	Libraries: map[string]_types_.File_Stash{},
	Artifacts: map[string]_types_.File_Stash{},
	Targetdir: map[string]_target_.Class{},
}

func Reset() {
	Cache = type_Cache{
		Libraries: map[string]_types_.File_Stash{},
		Artifacts: map[string]_types_.File_Stash{},
		Targetdir: map[string]_target_.Class{},
	}
}

func UtilsGetUsage() string {
	chart := map[string]float64{
		"Files":  _utils_.String_Memory(_utils_.Code_JsonBuild(Cache,"")),
		"Root":   _utils_.String_Memory(_utils_.Code_JsonBuild(_cache_.Root,"")),
		"Delta":  _utils_.String_Memory(_utils_.Code_JsonBuild(_cache_.Delta,"")),
		"Class":  _utils_.String_Memory(_utils_.Code_JsonBuild(_cache_.Style,"")),
		"Static": _utils_.String_Memory(_utils_.Code_JsonBuild(_cache_.Static,"")),
		"Proxy": func() float64 {
			total := 0.0
			for _, c := range _cache_.Static.TargetDir_Saved {
				total += _utils_.String_Memory(_utils_.Code_JsonBuild(c, ""))
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
		result = append(result, _fmt_.Sprintf("%s : %.2f Kb", k, float64(v)))
	}
	return _strings_.Join(result, "\n")
}
