package target

import (
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	"main/internal/style"
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
	ClassTracks [][]int
	Attachments map[int]bool
	ScatterMap  map[int]bool
	FinalMap    map[int]bool
}

func (This *Class) GetTracks() GetTracks_return {
	classtracks := make([][]int, 0, 24*len(This.FileCache))
	finalIntMap := make(map[int]bool, 8)
	attachIntMap := make(map[int]bool, 8)
	scatterIntMap := make(map[int]bool, 8)

	sc := This.StylesheetContext.Cache
	for i := range sc.ScatteredStyles {
		if found := _action.Index_Finder(i, sc.LocalMap); found.Index > 0 {
			attachIntMap[found.Index] = true
		}
	}

	for _, file := range This.FileCache {
		for s := range file.Cache.AppendsStyles {
			if found := _action.Index_Finder(s, file.Cache.LocalMap); found.Index > 0 {
				scatterIntMap[found.Index] = true
				_map.Copy(attachIntMap, style.ResolveDependints(found.Data))
			}
		}

		for s := range file.Cache.ScatteredStyles {
			if found := _action.Index_Finder(s, file.Cache.LocalMap); found.Index > 0 {
				scatterIntMap[found.Index] = true
				_map.Copy(attachIntMap, style.ResolveDependints(found.Data))
				if found.Group != _model.Style_Type_Library {
					attachIntMap[found.Index] = true
				}
			}
		}

		for _, track := range file.Cache.RigidTracks {
			retraces := []int{}
			for _, i := range track {
				if found := _action.Index_Finder(i, file.Cache.LocalMap); found.Index > 0 {
					retraces = append(retraces, found.Index)
					_map.Copy(attachIntMap, style.ResolveDependints(found.Data))
					if found.Group != _model.Style_Type_Library {
						attachIntMap[found.Index] = true
					}
				}
			}

			if len(retraces) > 0 {
				classtracks = append(classtracks, retraces)
			}
		}

		for s := range file.Cache.FinalStyles {
			if found := _action.Index_Finder(s, file.Cache.LocalMap); found.Index > 0 {
				finalIntMap[found.Index] = true
				_map.Copy(attachIntMap, style.ResolveDependints(found.Data))
				if found.Group != _model.Style_Type_Library {
					attachIntMap[found.Index] = true
				}
			}
		}
	}
	return GetTracks_return{
		ClassTracks: classtracks,
		Attachments: attachIntMap,
		ScatterMap:  scatterIntMap,
		FinalMap:    finalIntMap,
	}
}

func (This *Class) SyncClassnames(action _script.E_Method) {
	for _, file := range This.FileCache {
		res := _script.Rider(file, action)

		file.Scratch = res.Scribed
		file.Cache.TagReplacements = res.Replacements
	}
}

func (This *Class) SummonFiles(
	stylesheet string,
	styleBlock string,
	summonBlock string,
	stapleBlock string,
) map[string]string {
	savefiles := make(map[string]string, len(This.FileCache)+1)
	savefiles[This.SourceStylesheet] = stylesheet

	for _, file := range This.FileCache {
		if file.Extension != _config.Root.Extension {
			fromPos := 0
			var out _string.Builder
			for _, m := range file.Cache.TagReplacements {
				switch m.Elid {
				case _config.Root.CustomTags["staple"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + stapleBlock)
				case _config.Root.CustomTags["summon"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + summonBlock)
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
