package cache

import (
	_fmt_ "fmt"
	_utils_ "main/utils"
	_strings_ "strings"
)

func UtilsGetUsage() string {
	chart := map[string]float64{
		"Sync":   _utils_.String_Memory(_utils_.Code_JsonBuild(Sync)),
		"Path":   _utils_.String_Memory(_utils_.Code_JsonBuild(Path)),
		"Root":   _utils_.String_Memory(_utils_.Code_JsonBuild(Root)),
		"Delta":  _utils_.String_Memory(_utils_.Code_JsonBuild(Delta)),
		"Class":  _utils_.String_Memory(_utils_.Code_JsonBuild(Style)),
		"Files":  _utils_.String_Memory(_utils_.Code_JsonBuild(Files)),
		"Static": _utils_.String_Memory(_utils_.Code_JsonBuild(Static)),
		"Proxy": func() float64 {
			total := 0.0
			for _, c := range Static.TargetDir_Saved {
				total += _utils_.String_Memory(_utils_.Code_JsonBuild(c))
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
