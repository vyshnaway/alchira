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
	archive := &_config.Archive
	archive.Constants = map[string]string{}
	_style.Parse_CssSnippet(_config.Static.RootCSS, "", "", false).Variables.Range(func(k, v string) {
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

		exportsheet.WriteString("\r\n\r\n")

		exportsheet.WriteString("<")
		exportsheet.WriteString(data.Element)
		exportsheet.WriteString(" ")
		if data.SymClass[0] == '$' {
			exportsheet.WriteString("-")
		}
		exportsheet.WriteString(data.SymClass)

		v := data.Stylesheet["[]"]
		if len(data.Attachments) > 0 {
			v = string(_config.Root.CustomOperations["attach"]) + " " + _string.Join(data.Attachments, " ") + ";" + v
		}
		if len(v) > 0 {
			exportsheet.WriteString("=\"" + v + "\"")
		}

		for key, val := range data.Stylesheet {
			if key != "[]" && key[0] != ' ' {
				if arr, err := _util.Code_JsonParse[[]string](key); err == nil {
					exportsheet.WriteString("{")
					exportsheet.WriteString(_string.Join(arr, "}&{"))
					exportsheet.WriteString("}&=")
					exportsheet.WriteString("{" + val + "}")
				}
			}
		}

		for k, v := range data.Attributes {
			exportsheet.WriteString(" ")
			exportsheet.WriteString(k)
			if len(v) > 0 {
				exportsheet.WriteString("=")
				exportsheet.WriteString(v)
			}
		}
		exportsheet.WriteString(">")

		exportsheet.WriteString(data.InnerText)

		exportsheet.WriteString("</" + data.Element + ">")
	}

	archive.ExportSheet = exportsheet.String()
	return *archive
}

func archive_Files() map[string]string {

	latestverfile := "latest.json"
	currentverfile := archive_Build().Version + ".json"
	availableversions := []string{}
	if items, err := _fileman.Path_ListFiles(_config.Path_Folder["arcversion"].Path, []string{}); err == nil {
		availableversions = items
	}
	if _slice.Contains(availableversions, latestverfile) {
		availableversions = append(availableversions, latestverfile)
	}
	if _slice.Contains(availableversions, currentverfile) {
		availableversions = append(availableversions, currentverfile)
	}
	_sort.Strings(availableversions)
	for i, v := range availableversions {
		availableversions[i] = _fileman.Path_BaseName(v)
	}

	indexexport := _config.Archive
	indexexport.ExportSheet = ""
	indexexport.Version = ""
	indexexport.Constants = map[string]string{}
	indexexport.ExportClasses = []string{}
	indexexport.Versions = availableversions

	indexjson := _util.Code_JsonBuild(indexexport, "")
	artifactjson := _util.Code_JsonBuild(_config.Archive, "")
	artifact_files := map[string]string{
		_fileman.Path_Join(_config.Path_Folder["arcversion"].Path, latestverfile):  string(artifactjson),
		_fileman.Path_Join(_config.Path_Folder["arcversion"].Path, currentverfile): string(artifactjson),
		_config.Path_Json["archive"].Path:                                          string(indexjson),
	}

	return artifact_files
}
