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
		accumulate.ContextMap[file.Lookup.Id] = file
	}

	return accumulate
}

type GetTracks_return struct {
	ClassTracks [][]int
	Attachments map[int]bool
}

func (This *Class) GetTracks() GetTracks_return {
	classtracks := make([][]int, 24*len(This.FileCache))
	attachments := make(map[int]bool, 8)

	sc := This.StylesheetContext.StyleData
	for i := range sc.Attachments {
		if found := _action.Index_Finder(i, sc.LocalMap); found.Index > 0 {
			attachments[found.Index] = true
		}
	}

	for _, file := range This.FileCache {
		attachstrings := make(map[string]bool, len(file.StyleData.Attachments))
		_map.Copy(attachstrings, file.StyleData.Attachments)

		for _, track := range file.StyleData.ClassTracks {
			retraces := []int{}
			for _, i := range track {
				if found := _action.Index_Finder(i, file.StyleData.LocalMap); found.Index > 0 {
					retraces = append(retraces, found.Index)
					_map.Copy(attachstrings, found.Data.SrcData.Attachments)
					if found.Group != _model.Style_Type_Library {
						attachments[found.Index] = true
					}
				}
			}

			if len(retraces) > 0 {
				classtracks = append(classtracks, retraces)
			}
		}

		for i := range attachstrings {
			if found := _action.Index_Finder(i, file.StyleData.LocalMap); found.Index > 0 {
				attachments[found.Index] = true
			}
		}
	}

	return GetTracks_return{
		ClassTracks: classtracks,
		Attachments: attachments,
	}
}

func (This *Class) SyncClassnames(action _script.E_Action) {
	for _, file := range This.FileCache {
		res := _script.Rider(file, action)

		file.Scratch = res.Scribed
		file.StyleData.TagReplacements = res.Replacements
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
			for _, m := range file.StyleData.TagReplacements {
				switch m.Elid {
				case _config.Root.CustomTags["staple"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + stapleBlock)
				case _config.Root.CustomTags["summon"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + summonBlock)
				case _config.Root.CustomTags["style"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + styleBlock)
				case _config.Root.CustomTags[string(_config.Lodash_rune)]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + file.Label)
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
