package stash

import (
	_fmt_ "fmt"
	_action_ "main/action"
	_cache_ "main/cache"
	_script_ "main/script"
	_style_ "main/style"
	_types_ "main/types"
	_utils_ "main/utils"
	X "main/xhell"
	_slices_ "slices"
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

	watchprops := []string{}
	if props, ok := This.ExtnsProps[file.Extension]; ok && file.Extension != _cache_.Root.Extension {
		watchprops = props
	}
	parse_response := _script_.Rider(&file, watchprops, _types_.Script_Action_Read)
	file.Midway = parse_response.Scribed
	locales := []string{}
	for _, locale := range parse_response.Locales {
		if _slices_.Contains(locales, locale) {
			locales = append(locales, locale)
		}
	}
	file.StyleData.Locales = locales
	file.Manifest.Lookup = _types_.File_Lookup{
		Id:     file.TargetPath,
		Type:   _types_.File_Type_Target,
		Locale: locales,
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
			var index_map *_types_.Style_ClassIndexMap
			var medatata_map *_types_.File_MetadataMap
			switch tagdata.Scope {
			case _types_.Style_Type_Local:
				medatata_map = &file.Manifest.Local
				index_map = &file.StyleData.LocalClasses
			case _types_.Style_Type_Global:
				medatata_map = &file.Manifest.Global
				index_map = &file.StyleData.GlobalClasses
			case _types_.Style_Type_Public:
				medatata_map = &file.Manifest.Public
				index_map = &file.StyleData.PublicClasses
			default:
				index_map = &_types_.Style_ClassIndexMap{}
				medatata_map = &_types_.File_MetadataMap{}
			}

			response := _style_.Rawtag_Upload(tagdata, &file, index_map, _cache_.Static.MINIFY)
			classdata := _cache_.Index_Fetch(response.Index)

			if len(classdata.Metadata.Declarations) == 1 {
				file.StyleData.UsedIn = append(file.StyleData.UsedIn, response.Index)
				(*medatata_map)[response.Symclass] = &classdata.Metadata
			}

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
