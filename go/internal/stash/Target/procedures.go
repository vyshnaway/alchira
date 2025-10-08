package Target

import (
	_cache_ "main/cache"
	_compose_ "main/compose"
	_script_ "main/script"
	S "main/shell/core"
	_types_ "main/types"
	_maps_ "maps"
	_slices_ "slices"
	_strings_ "strings"
)

type Accumulator_return struct {
	Report        []string
	GlobalClasses map[string]int
	PublicClasses map[string]int
	FileManifests map[string]_types_.File_LocalManifest
}

func (This *Class) Accumulator() Accumulator_return {
	accumulate := Accumulator_return{
		Report:        []string{},
		GlobalClasses: map[string]int{},
		PublicClasses: map[string]int{},
		FileManifests: map[string]_types_.File_LocalManifest{},
	}

	accumulate.FileManifests[This.TargetStylesheet] = _types_.File_LocalManifest{
		Lookup: _types_.File_Lookup{
			Id:     This.TargetStylesheet,
			Type:   _types_.File_Type_Stylesheet,
			Locale: []string{},
		},
		Local:       _types_.File_MetadataMap{},
		Global:      _types_.File_MetadataMap{},
		Public:      _types_.File_MetadataMap{},
		Errors:      []string{},
		Diagnostics: []_types_.Refer_Diagnostic{},
	}

	accumulate.Report = append(
		accumulate.Report,
		S.Tag.H2("PROXY : "+This.Target+" -> "+This.Source, S.Preset.Primary, S.Style.AS_Bold),
	)

	for _, file := range This.FileCache {
		accumulate.FileManifests[file.Manifest.Lookup.Id] = file.Manifest
		_maps_.Copy(accumulate.GlobalClasses, file.StyleData.GlobalClasses)
		_maps_.Copy(accumulate.PublicClasses, file.StyleData.PublicClasses)

		symclasses := []string{}
		symclasses = append(symclasses, _slices_.Collect(_maps_.Keys(file.StyleData.LocalClasses))...)
		symclasses = append(symclasses, _slices_.Collect(_maps_.Keys(file.StyleData.PublicClasses))...)
		symclasses = append(symclasses, _slices_.Collect(_maps_.Keys(file.StyleData.GlobalClasses))...)

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
			if found := _cache_.Index_Find(i, file.StyleData.LocalClasses); found.Index > 0 {
				attachments = append(attachments, found.Index)
			}
		}

		for _, track := range file.StyleData.ClassTracks {
			retraces := []int{}
			for _, i := range track {
				if found := _cache_.Index_Find(i, file.StyleData.LocalClasses); found.Index > 0 {
					retraces = append(retraces, found.Index)
					attachments = append(attachments, found.Index)
					for _, i := range _cache_.Index_Fetch(found.Index).Attachments {
						if found := _cache_.Index_Find(i, file.StyleData.LocalClasses); found.Index > 0 {
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

func (This *Class) GetExports() map[string]_types_.Style_ExportStyle {
	exports := map[string]_types_.Style_ExportStyle{}

	for _, file := range This.FileCache {
		for _, pubindex := range file.StyleData.PublicClasses {
			exporting := _compose_.Artifact(pubindex)
			exports[exporting.SymClass] = exporting

			for _, a := range _cache_.Index_Fetch(pubindex).Attachments {
				if found := _cache_.Index_Find(a, file.StyleData.LocalClasses); found.Index > 0 {
					subexporting := _compose_.Artifact(found.Index)
					exporting.Attachments = append(exporting.Attachments, subexporting.SymClass)
					exports[subexporting.SymClass] = subexporting
				}
			}
		}
	}

	return exports
}

func (This *Class) SyncClassnames(action _types_.Script_Action) {
	for _, file := range This.FileCache {
		watchprops := []string{}
		if props, ok := This.ExtnsProps[file.Extension]; ok && file.Extension != _cache_.Root.Extension {
			watchprops = props
		}
		file.Scratch = _script_.Rider(
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
		if file.Extension != _cache_.Root.Extension {
			fromPos := 0
			var out _strings_.Builder
			for _, m := range file.StyleData.TagReplacements {
				switch m.Elid {
				case _cache_.Root.CustomElements["staple"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + stapleBlock)
				case _cache_.Root.CustomElements["summon"]:
					out.WriteString(file.Scratch[fromPos:m.Loc] + summonBlock)
				case _cache_.Root.CustomElements["style"]:
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
