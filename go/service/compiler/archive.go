package compiler

import (
	_config "main/configs"
	_stash "main/internal/stash"
	_style "main/internal/style"
	_models "main/models"
	_fileman "main/package/fileman"
	_util "main/package/utils"
	_map "maps"
	_slice "slices"
	_sort "sort"
	_string "strings"
)

func archive_Build() _models.Config_Archive {
	archive := _config.Archive
	archive.Constants = map[string]string{}
	_style.Parse_CssSnippet(_config.Static.RootCSS, "", "", false, false).Variables.Range(func(k, v string) {
		archive.Constants[k] = v
	})
	archive.ExportClasses = []string{}

	exportdata := map[string]_models.Style_ExportStyle{}
	for _, val := range _stash.Cache.Targetdir {
		_map.Copy(exportdata, val.GetArtifacts())
	}

	var exportsheet _string.Builder
	for _, data := range exportdata {
		if _string.Contains(data.SymClass, "$$$") {
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
					v = string(_config.Root.CustomOperations["attach"]) + " " + _string.Join(data.Attachments, " ") + ";"
				}
				v += val

				if len(v) > 0 {
					exportsheet.WriteString("=" + v)
				}
			} else if key[0] == ' ' {
				if arr, err := _util.Code_JsonParse[[]string](key); err == nil {
					exportsheet.WriteString("{")
					exportsheet.WriteString(_string.Join(arr, "}&{"))
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

func archive_Files() map[string]string {

	latestverfile := "latest.json"
	currentverfile := archive_Build().Version + ".json"
	availableversions := []string{}
	if items, err := _fileman.Path_ListFiles(_config.Path_Folder["arcversion"].Path, []string{}); err == nil {
		availableversions = append(availableversions, items...)
	}
	if _slice.Contains(availableversions, latestverfile) {
		availableversions = append(availableversions, latestverfile)
	}
	if _slice.Contains(availableversions, currentverfile) {
		availableversions = append(availableversions, currentverfile)
	}
	_sort.Strings(availableversions)

	indexexport := _config.Archive
	indexexport.ExportSheet = ""
	indexexport.Versions = availableversions
	indexexport.Constants = _style.Cssfile_String(
		_util.Code_Uncomment(_config.Static.RootCSS, false, true, false),
		"", false).Variables.ToMap()

	indexexportjson := _util.Code_JsonBuild(indexexport, "")
	exportjson := _util.Code_JsonBuild(_config.Archive, "")
	latestpath := _fileman.Path_Join(_config.Path_Folder["arcversion"].Path, latestverfile)
	currentpath := _fileman.Path_Join(_config.Path_Folder["arcversion"].Path, currentverfile)
	artifact_files := map[string]string{
		latestpath:                        string(exportjson),
		currentpath:                       string(exportjson),
		_config.Path_Json["archive"].Path: string(indexexportjson),
	}

	return artifact_files
}
