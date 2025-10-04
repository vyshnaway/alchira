package craft

import (
	_json_ "encoding/json"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	_stash_ "main/stash"
	_style_ "main/style"
	_types_ "main/types"
	_utils_ "main/utils"
	_maps_ "maps"
	_slices_ "slices"
	_sort_ "sort"
	_strings_ "strings"
)

func archive_Build() _types_.Config_Archive {
	archive := _cache_.Archive
	archive.ExportClasses = []string{}

	exportdata := map[string]_types_.Style_ExportStyle{}
	for _, val := range _stash_.Cache.Targetdir {
		_maps_.Copy(exportdata, val.GetExports())
	}

	var exportsheet _strings_.Builder
	for _, data := range exportdata {
		if _strings_.Contains(data.SymClass, "$$$") {
			archive.ExportClasses = append(archive.ExportClasses, data.SymClass)
		}

		exportsheet.WriteString("\n\n")

		exportsheet.WriteString("<")
		exportsheet.WriteString(data.Element)
		for _, pair := range data.Stylesheet {
			key := pair[0]
			val := pair[1]

			if key == "" {
				var symclass string
				if symclass[0] == '$' {
					exportsheet.WriteString("-")
				}
				exportsheet.WriteString(data.SymClass)

				var v string
				if len(data.Attachments) > 0 {
					v = string(_cache_.Root.CustomOperations["attach"]) + " " + _strings_.Join(data.Attachments, " ") + ";"
				}
				v += val

				if len(v) > 0 {
					exportsheet.WriteString("=" + v)
				}
			} else if key[0] == ' ' {
				var arr []string
				if err := _json_.Unmarshal([]byte(key), &arr); err == nil {
					exportsheet.WriteString("{")
					exportsheet.WriteString(_strings_.Join(arr, "}&{"))
					exportsheet.WriteString("}&=")
					exportsheet.WriteString("{" + val + "}")
				}
			}
		}
		for _, v := range data.Attributes {
			exportsheet.WriteString(" " + v[0] + "=" + v[1])
		}
		exportsheet.WriteString(">")

		exportsheet.WriteString(data.InnerText)
		exportsheet.WriteString("</" + data.Element + ">")
	}

	archive.ExportSheet = exportsheet.String()
	return archive
}

func archive_Deploy() map[string]string {

	latestverfile := "latest.json"
	currentverfile := archive_Build().Version + ".json"
	availableversions := []string{}
	if items, err := _fileman_.Path_ListFiles(_cache_.Path_Folder["arcversion"].Path, []string{}); err == nil {
		for _, item := range items {
			availableversions = append(availableversions, item)
		}
	}
	if _slices_.Contains(availableversions, latestverfile) {
		availableversions = append(availableversions, latestverfile)
	}
	if _slices_.Contains(availableversions, currentverfile) {
		availableversions = append(availableversions, currentverfile)
	}
	_sort_.Strings(availableversions)

	indexexport := _cache_.Archive
	indexexport.ExportSheet = ""
	indexexport.Versions = availableversions
	indexexport.Constants = _style_.Cssfile_Parse(
		_utils_.Code_Uncomment(_cache_.Static.RootCSS, false, true, false),
		"", false).Variables

	indexexportjson, _ := _json_.Marshal(indexexport)
	exportjson, _ := _json_.Marshal(_cache_.Archive)
	latestpath := _fileman_.Path_Join(_cache_.Path_Folder["arcversion"].Path, latestverfile)
	currentpath := _fileman_.Path_Join(_cache_.Path_Folder["arcversion"].Path, currentverfile)
	artifact_files := map[string]string{
		latestpath:                        string(exportjson),
		currentpath:                       string(exportjson),
		_cache_.Path_Json["archive"].Path: string(indexexportjson),
	}

	return artifact_files
}
