package Target

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_cache_ "main/cache"
	_script_ "main/script"
	X "main/shell/make"
	_style_ "main/style"
	_types_ "main/types"
	_utils_ "main/utils"
)

func (This *Class) Savefile(filepath string, content string, hashindex int) {
	if file, ok := This.FileCache[filepath]; ok {
		_cache_.Index_Dispose(file.StyleData.UsedIn...)
		for key := range This.FileCache[filepath].StyleData.GlobalClasses {
			delete(_cache_.Style.Global___Index, key)
		}
		for key := range This.FileCache[filepath].StyleData.GlobalClasses {
			delete(_cache_.Style.Public___Index, key)
		}
		delete(This.FileCache, filepath)
	}

	file := _action_.Store(
		_action_.Store_FileGroup_Target,
		filepath,
		content,
		This.Target,
		This.Source,
		_fmt_.Sprint(This.Label, "_", _utils_.String_EnCounter(hashindex)),
	)

	parse_response := _script_.Rider(&file, This.ExtnsProps[file.Extension], _types_.Script_Action_Read)
	file.StyleData.ClassTracks = parse_response.ClassesList
	file.StyleData.Attachments = parse_response.Attachments
	file.Midway = parse_response.Scribed

	file.StyleData.Locales = _utils_.Array_Setfront(parse_response.Locales)
	file.Manifest.Lookup = _types_.File_Lookup{
		Id:     file.TargetPath,
		Type:   _types_.File_Type_Target,
		Locale: file.StyleData.Locales,
	}

	for _, tagdata := range parse_response.StylesList {
		if len(tagdata.SymClasses) == 0 {
			E := X.Error_Write(
				"Symclass missing declaration scope.",
				[]string{_fmt_.Sprint(file.TargetPath, ":", tagdata.RowIndex, ":", tagdata.ColIndex)},
			)
			file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
			file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
		} else if len(tagdata.SymClasses) > 1 {
			E := X.Error_Write(
				"Multiple SymClasses declaration scope.",
				[]string{_fmt_.Sprint(file.TargetPath, ":", tagdata.RowIndex, ":", tagdata.ColIndex)},
			)
			file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
			file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
		} else {
			var index_map _types_.Style_ClassIndexMap
			var metadata_map _types_.File_MetadataMap
			switch tagdata.Scope {
			case _types_.Style_Type_Local:
				metadata_map = file.Manifest.Local
				index_map = file.StyleData.LocalClasses
			case _types_.Style_Type_Global:
				metadata_map = file.Manifest.Global
				index_map = file.StyleData.GlobalClasses
			case _types_.Style_Type_Public:
				metadata_map = file.Manifest.Public
				index_map = file.StyleData.PublicClasses
			default:
				index_map = _types_.Style_ClassIndexMap{}
				metadata_map = _types_.File_MetadataMap{}
			}

			response := _style_.Rawtag_Upload(tagdata, &file, index_map, metadata_map, _cache_.Static.MINIFY)

			file.Manifest.Errors = append(file.Manifest.Errors, response.Errors...)
			file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, response.Diagnostics...)
		}
	}

	This.FileCache[filepath] = file
}

func (This *Class) UpdateCache() {
	index := 1
	for filepath, filedata := range This.FileCache {
		This.Savefile(filepath, filedata.Content, index)
		index++
	}
}

func (This *Class) ClearFiles() {
	for filepath, filedata := range This.FileCache {
		_cache_.Index_Dispose(filedata.StyleData.UsedIn...)
		delete(This.FileCache, filepath)
	}
}
