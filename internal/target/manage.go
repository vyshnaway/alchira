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
	"maps"
)

func (This *Class) Savefile(filepath string, content string, hashindex int) {
	if file, ok := This.FileCache[filepath]; ok {
		_action.Index_Dispose(file.StyleData.UsedIn...)
		for key := range This.FileCache[filepath].StyleData.GlobalMap {
			delete(_config.Style.Global___Index, key)
		}
		for key := range This.FileCache[filepath].StyleData.GlobalMap {
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
		_fmt.Sprint(This.Label, string(_config.Lodash_rune), _util.String_EnCounter(hashindex)),
	)

	parse_response := _script.Rider(file, This.ExtnsProps[file.Extension], _script.E_Action_Read)
	file.StyleData.ClassTracks = parse_response.ClassesList
	file.StyleData.Attachments = parse_response.Attachments
	file.Midway = parse_response.Scribed

	file.Lookup = _model.File_Lookup{
		Id:   file.TargetPath,
		Type: _model.File_Type_Target,
	}

	for _, tagdata := range parse_response.StylesList {
		if len(tagdata.SymClasses) == 0 {
			E := X.Error_Standard(
				"Symclass missing declaration scope.",
				[]string{_fmt.Sprint(file.TargetPath, ":", tagdata.RowIndex, ":", tagdata.ColIndex)},
			)
			file.Errors = append(file.Errors, E.Errorstring)
			file.Diagnostics = append(file.Diagnostics, &E.Diagnostic)
		} else if len(tagdata.SymClasses) > 1 {
			E := X.Error_Standard(
				"Multiple SymClasses declaration scope.",
				[]string{_fmt.Sprint(file.TargetPath, ":", tagdata.RowIndex, ":", tagdata.ColIndex)},
			)
			file.Errors = append(file.Errors, E.Errorstring)
			file.Diagnostics = append(file.Diagnostics, &E.Diagnostic)
		} else {
			var loc_index_map _model.Style_ClassIndexMap
			var ref_index_map _model.Style_ClassIndexMap
			switch tagdata.Scope {
			case _model.Style_Type_Local:
				loc_index_map = file.StyleData.LocalMap
			case _model.Style_Type_Global:
				loc_index_map = file.StyleData.GlobalMap
				ref_index_map = _config.Style.Global___Index
			case _model.Style_Type_Public:
				loc_index_map = file.StyleData.PublicMap
				ref_index_map = _config.Style.Public___Index
			default:
				loc_index_map = _model.Style_ClassIndexMap{}
			}

			response := _style.Rawtag_Upload(tagdata, file, loc_index_map)
			loc_index_map[response.Symclass] = response.Index
			if ref_index_map != nil {
				ref_index_map[response.Symclass] = response.Index
				ref_index_map[response.Symclass] = response.Index
			}

			file.Errors = append(file.Errors, response.Errors...)
			file.Diagnostics = append(file.Diagnostics, response.Diagnostics...)
		}
	}

	maps.Copy(file.StyleData.MixedMap, file.StyleData.LocalMap)
	maps.Copy(file.StyleData.MixedMap, file.StyleData.GlobalMap)
	maps.Copy(file.StyleData.MixedMap, file.StyleData.PublicMap)

	maps.Copy(This.GlobalMap, file.StyleData.GlobalMap)
	maps.Copy(This.PublicMap, file.StyleData.PublicMap)
	maps.Copy(This.MixedMap, file.StyleData.GlobalMap)
	maps.Copy(This.MixedMap, file.StyleData.PublicMap)

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
		_action.Index_Dispose(filedata.StyleData.UsedIn...)
		delete(This.FileCache, filepath)
	}
}
