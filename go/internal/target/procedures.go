package target

import (
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	_model "main/models"
	S "main/package/shell"
	_map "maps"
	_slice "slices"
	_string "strings"
)

type Accumulator_return struct {
	Report        []string
	GlobalClasses map[string]int
	PublicClasses map[string]int
	FileManifests map[string]_model.File_LocalManifest
}

func (This *Class) Accumulator() Accumulator_return {
	accumulate := Accumulator_return{
		Report:        []string{},
		GlobalClasses: map[string]int{},
		PublicClasses: map[string]int{},
		FileManifests: map[string]_model.File_LocalManifest{},
	}

	accumulate.FileManifests[This.TargetStylesheet] = _model.File_LocalManifest{
		Lookup: _model.File_Lookup{
			Id:     This.TargetStylesheet,
			Type:   _model.File_Type_Stylesheet,
			Locale: []string{},
		},
		Local:       _model.File_MetadataMap{},
		Global:      _model.File_MetadataMap{},
		Public:      _model.File_MetadataMap{},
		Errors:      []string{},
		Diagnostics: []_model.Refer_Diagnostic{},
	}

	accumulate.Report = append(
		accumulate.Report,
		S.Tag.H2("PROXY : "+This.Target+" -> "+This.Source, S.Preset.Primary, S.Style.AS_Bold),
	)

	for _, file := range This.FileCache {
		accumulate.FileManifests[file.Manifest.Lookup.Id] = file.Manifest
		_map.Copy(accumulate.GlobalClasses, file.StyleData.GlobalClasses)
		_map.Copy(accumulate.PublicClasses, file.StyleData.PublicClasses)

		symclasses := []string{}
		symclasses = append(symclasses, _slice.Collect(_map.Keys(file.StyleData.LocalClasses))...)
		symclasses = append(symclasses, _slice.Collect(_map.Keys(file.StyleData.PublicClasses))...)
		symclasses = append(symclasses, _slice.Collect(_map.Keys(file.StyleData.GlobalClasses))...)

		if counter := len(symclasses); counter > 0 {
			accumulate.Report = append(
				accumulate.Report,
				S.MAKE(
					S.Tag.H6(file.TargetPath, S.Preset.Tertiary),
					S.List.Catalog(symclasses, 0, S.Preset.Primary, S.Style.AS_Bold),
				),
			)

		}
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
					for _, i := range _action.Index_Fetch(found.Index).Attachments {
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

func (This *Class) GetExports() map[string]_model.Style_ExportStyle {
	exports := map[string]_model.Style_ExportStyle{}

	for _, file := range This.FileCache {
		for _, pubindex := range file.StyleData.PublicClasses {
			exporting := Artifact(pubindex)
			exports[exporting.SymClass] = exporting

			for _, a := range _action.Index_Fetch(pubindex).Attachments {
				if found := _action.Index_Find(a, file.StyleData.LocalClasses); found.Index > 0 {
					subexporting := Artifact(found.Index)
					exporting.Attachments = append(exporting.Attachments, subexporting.SymClass)
					exports[subexporting.SymClass] = subexporting
				}
			}
		}
	}

	return exports
}

func (This *Class) SyncClassnames(action _script.E_Action) {
	for _, file := range This.FileCache {
		watchprops := []string{}
		if props, ok := This.ExtnsProps[file.Extension]; ok && file.Extension != _config.Root.Extension {
			watchprops = props
		}
		file.Scratch = _script.Rider(
			&file,
			watchprops,
			action,
		).Scribed
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
				case _config.Root.CustomElements["staple"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + stapleBlock)
				case _config.Root.CustomElements["summon"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + summonBlock)
				case _config.Root.CustomElements["style"]:
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
