package target

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_script "main/internal/script"
	_style "main/internal/style"
	_model "main/models"
	_util "main/package/utils"
)

func (This *Class) Savefile(filepath string, content string, hashindex int) {
	if file, ok := This.FileCache[filepath]; ok {
		_action.Index_Dispose(file.StyleData.UsedIn...)
		for key := range This.FileCache[filepath].StyleData.GlobalClasses {
			delete(_config.Style.Global___Index, key)
		}
		for key := range This.FileCache[filepath].StyleData.GlobalClasses {
			delete(_config.Style.Public___Index, key)
		}
		delete(This.FileCache, filepath)
	}

	file := _action.Store(
		_action.Store_FileGroup_Target,
		filepath,
		content,
		This.Target,
		This.Source,
		_fmt.Sprint(This.Label, "_", _util.String_EnCounter(hashindex)),
	)

	parse_response := _script.Rider(&file, This.ExtnsProps[file.Extension], _script.E_Action_Read)
	file.StyleData.ClassTracks = parse_response.ClassesList
	file.StyleData.Attachments = parse_response.Attachments
	file.Midway = parse_response.Scribed

	file.StyleData.Locales = _util.Array_Setfront(parse_response.Locales)
	file.Manifest.Lookup = _model.File_Lookup{
		Id:     file.TargetPath,
		Type:   _model.File_Type_Target,
		Locale: file.StyleData.Locales,
	}

	for _, tagdata := range parse_response.StylesList {
		if len(tagdata.SymClasses) == 0 {
			E := X.Error_Standard(
				"Symclass missing declaration scope.",
				[]string{_fmt.Sprint(file.TargetPath, ":", tagdata.RowIndex, ":", tagdata.ColIndex)},
			)
			file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
			file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
		} else if len(tagdata.SymClasses) > 1 {
			E := X.Error_Standard(
				"Multiple SymClasses declaration scope.",
				[]string{_fmt.Sprint(file.TargetPath, ":", tagdata.RowIndex, ":", tagdata.ColIndex)},
			)
			file.Manifest.Errors = append(file.Manifest.Errors, E.Errorstring)
			file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, E.Diagnostic)
		} else {
			var index_map _model.Style_ClassIndexMap
			var metadata_map _model.File_MetadataMap
			switch tagdata.Scope {
			case _model.Style_Type_Local:
				metadata_map = file.Manifest.Local
				index_map = file.StyleData.LocalClasses
			case _model.Style_Type_Global:
				metadata_map = file.Manifest.Global
				index_map = file.StyleData.GlobalClasses
			case _model.Style_Type_Public:
				metadata_map = file.Manifest.Public
				index_map = file.StyleData.PublicClasses
			default:
				index_map = _model.Style_ClassIndexMap{}
				metadata_map = _model.File_MetadataMap{}
			}

			response := _style.Rawtag_Upload(tagdata, &file, index_map, metadata_map)

			file.Manifest.Errors = append(file.Manifest.Errors, response.Errors...)
			file.Manifest.Diagnostics = append(file.Manifest.Diagnostics, response.Diagnostics...)
		}
	}

	This.FileCache[filepath] = &file
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
		_action.Index_Dispose(filedata.StyleData.UsedIn...)
		delete(This.FileCache, filepath)
	}
}
