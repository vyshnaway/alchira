package target

import (
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	_model "main/models"
	_map "maps"
	_string "strings"
)

type Accumulator_return struct {
	Report        string
	GlobalClasses map[string]int
	PublicClasses map[string]int
	FileManifests map[string]_model.File_LocalManifest
}

func (This *Class) Accumulator() Accumulator_return {
	accumulate := Accumulator_return{
		GlobalClasses: map[string]int{},
		PublicClasses: map[string]int{},
		FileManifests: map[string]_model.File_LocalManifest{},
	}

	accumulate.FileManifests[This.TargetStylesheet] = _model.File_LocalManifest{
		Lookup: _model.File_Lookup{
			Id:     This.TargetStylesheet,
			Type:   _model.File_Type_Stylesheet,
			Lodash: []string{},
		},
		Local:       _model.File_SymclassIndexMap{},
		Global:      _model.File_SymclassIndexMap{},
		Public:      _model.File_SymclassIndexMap{},
		Errors:      []string{},
		Diagnostics: []_model.File_Diagnostic{},
	}

	for _, file := range This.FileCache {
		accumulate.FileManifests[file.Manifest.Lookup.Id] = file.Manifest
		_map.Copy(accumulate.GlobalClasses, file.StyleData.GlobalClasses)
		_map.Copy(accumulate.PublicClasses, file.StyleData.PublicClasses)
	}

	return accumulate
}

type GetTracks_return struct {
	ClassTracks [][]int
	Attachments []int
}

func (This *Class) GetTracks() GetTracks_return {
	classtracks := [][]int{}
	attachments := []int{}

	for _, file := range This.FileCache {
		for _, i := range file.StyleData.Attachments {
			if found := _action.Index_Find(i, file.StyleData.LocalClasses); found.Index > 0 {
				attachments = append(attachments, found.Index)
			}
		}

		for _, track := range file.StyleData.ClassTracks {
			retraces := []int{}
			for _, i := range track {
				if found := _action.Index_Find(i, file.StyleData.LocalClasses); found.Index > 0 {
					retraces = append(retraces, found.Index)
					attachments = append(attachments, found.Index)
					for _, i := range _action.Index_Fetch(found.Index).SrcData.Attachments {
						if found := _action.Index_Find(i, file.StyleData.LocalClasses); found.Index > 0 {
							attachments = append(attachments, found.Index)
						}
					}
				}
			}

			if len(retraces) > 0 {
				classtracks = append(classtracks, retraces)
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
		watchprops := []string{}
		if props, ok := This.ExtnsProps[file.Extension]; ok && file.Extension != _config.Root.Extension {
			watchprops = props
		}
		res := _script.Rider(
			file,
			watchprops,
			action,
		)

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
	savefiles := map[string]string{This.SourceStylesheet: stylesheet}

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
