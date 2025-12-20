package target

import (
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"

	_model "main/models"
	_map "maps"
	_slice "slices"
	_string "strings"
)

type Accumulator_return struct {
	GlobalClasses []string
	PublicClasses []string
	ContextMap    map[string]*_model.File_Stash
}

func (This *Class) Accumulator() Accumulator_return {
	accumulate := Accumulator_return{
		GlobalClasses: _slice.Collect(_map.Keys(This.GlobalMap)),
		PublicClasses: _slice.Collect(_map.Keys(This.PublicMap)),
		ContextMap:    map[string]*_model.File_Stash{},
	}

	accumulate.ContextMap[This.TargetStylesheet] = This.StylesheetContext
	for _, file := range This.FileCache {
		accumulate.ContextMap[file.Cache.Id] = file
	}

	return accumulate
}

type GetTracks_return struct {
	MidRefs [][]int
	LowRefs map[int]bool
	TopRefs map[int]bool
	MacRefs map[int]bool
}

func (This *Class) GetTracks() GetTracks_return {
	macroMap := make(map[int]bool, 8)
	midClassMap := make([][]int, 0, 24*len(This.FileCache))
	topClassMap := make(map[int]bool, 8)
	lowClassMap := make(map[int]bool, 8)

	sc := This.StylesheetContext.Cache
	for i := range sc.LowClass {
		if found := _action.Index_Finder(i, sc.LocalMap); found.Index > 0 {
			macroMap[found.Index] = true
		}
	}

	for _, file := range This.FileCache {
		for s := range file.Cache.MacroStyles {
			if found := _action.Index_Finder(s, file.Cache.LocalMap); found.Index > 0 {
				macroMap[found.Index] = true
			}
		}

		for s := range file.Cache.LowClass {
			if found := _action.Index_Finder(s, file.Cache.LocalMap); found.Index > 0 {
				lowClassMap[found.Index] = true
			}
		}

		for _, track := range file.Cache.MidClass {
			retraces := []int{}
			for _, i := range track {
				if found := _action.Index_Finder(i, file.Cache.LocalMap); found.Index > 0 {
					retraces = append(retraces, found.Index)
				}
			}

			if len(retraces) > 0 {
				midClassMap = append(midClassMap, retraces)
			}
		}

		for s := range file.Cache.TopClass {
			if found := _action.Index_Finder(s, file.Cache.LocalMap); found.Index > 0 {
				topClassMap[found.Index] = true
			}
		}
	}

	return GetTracks_return{
		LowRefs: lowClassMap,
		MidRefs: midClassMap,
		TopRefs: topClassMap,
		MacRefs: macroMap,
	}
}

func (This *Class) SyncClassnames(action _script.E_Method) {
	for _, file := range This.FileCache {
		res := _script.Rider(file, action, map[int]bool{})
		file.Scratch = res.Scribed
		file.Cache.TagReplacements = res.Replacements
	}
}

func (This *Class) RebuildFiles(
	stylesheet string,
	styleBlock string,
	sketchBlock string,
) map[string]string {
	savefiles := make(map[string]string, len(This.FileCache)+1)
	savefiles[This.SourceStylesheet] = stylesheet

	for _, file := range This.FileCache {
		if file.Extension != _config.Root.Extension {
			fromPos := 0
			var out _string.Builder
			for _, m := range file.Cache.TagReplacements {
				switch m.Elid {
				case _config.Root.CustomTags["sketch"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + sketchBlock)
				case _config.Root.CustomTags["style"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + styleBlock)
				default:
					out.WriteString(file.Scratch[fromPos:])
				}
				fromPos = m.Loc
			}

			savefiles[file.SourcePath] = out.String()
			file.Scratch = ""
		}
	}
	return savefiles
}
