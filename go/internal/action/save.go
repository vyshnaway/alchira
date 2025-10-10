package action

import (
	_config "main/configs"
	// "main/package/console"
	S "main/package/console"
	_fileman "main/package/fileman"
	_util "main/package/utils"
	_regexp "regexp"
	_string "strings"
)

var import_regex = _regexp.MustCompile(`@import\s+(?:url\()?["']?(.*?)["']?\)?\s*;`)

// save_CssInlineImports recursively processes CSS imports
func save_CssInlineImports(filePath string, resolvedFiles *map[string]bool) (string, error) {

	content, err := _fileman.Read_File(filePath, false)
	if err != nil {
		return "", err
	}
	basedir := _fileman.Path_Basedir(filePath)

	content_string := string(content)
	for _, match := range import_regex.FindAllStringSubmatch(content_string, -1) {
		fullmatch := match[0]
		importpath := match[1]

		absolute_importpath, err := _fileman.Path_Resolves(_fileman.Path_Join(basedir, importpath))
		if err == nil && _fileman.Path_IfFile(absolute_importpath) && !(*resolvedFiles)[absolute_importpath] {

			replacement, err := save_CssInlineImports(absolute_importpath, resolvedFiles)
			if err != nil {
				replacement = fullmatch
			}
			content_string = _string.Replace(content_string, fullmatch, replacement, 1)
		}
		(*resolvedFiles)[absolute_importpath] = true
	}

	return content_string, nil
}

// CssImport processes CSS files and inlines @import statements
func save_CssImport(filepath_array []string) string {
	resolved_files := make(map[string]bool)
	for _, filepath := range filepath_array {
		if abspath, err := _fileman.Path_Resolves(filepath); err == nil && _fileman.Path_IfFile(abspath) {
			resolved_files[abspath] = true
		}
	}

	inlined := make([]string, 0, len(resolved_files))
	for filePath := range resolved_files {
		content, err := save_CssInlineImports(filePath, &resolved_files)
		if err == nil {
			inlined = append(inlined, content)
		}
	}
	// console.Post(_string.Join(inlined, "\n"))
	return _string.Join(inlined, "\n")
}

func Save_RootCss() {
	_config.Static.RootCSS = save_CssImport([]string{
		_config.Path_Css["atrules"].Path,
		_config.Path_Css["constants"].Path,
		_config.Path_Css["elements"].Path,
		_config.Path_Css["extends"].Path,
	})
}

func Save_Libraries() {
	_config.Static.Libraries_Saved, _ = _fileman.Read_Bulk(
		_config.Path_Folder["libraries"].Path,
		[]string{"css"},
	)
}

func Save_Artifacts() {
	_config.Static.Artifacts_Saved, _ = _fileman.Read_Bulk(
		_config.Path_Folder["artifacts"].Path,
		[]string{_config.Root.Extension, "json"},
	)
}

func Save_Targets() {
	S.TASK("Saving Proxy-folders", 1)
	_config.Static.TargetDir_Saved = Sync_ProxyMapDirs(_config.Static.ProxyMap)
}

func SaveHashrule() (Report string, Status bool) {

	S.TASK("Saving Hashrule", 1)

	status := true
	errors := []string{}
	_config.Static.Hashrule = map[string]string{}
	hashrule_path := _config.Path_Json["hashrule"].Path
	if content, err := _fileman.Read_File(hashrule_path, false); err == nil {
		if hashrules, e := _util.Code_JsonParse[map[string]string](content); e == nil {
			_config.Static.Hashrule = hashrules
		} else {
			status = false
			errors = append(errors, "Bad "+hashrule_path+" file data.")
		}
	} else {
		status = false
		errors = append(errors, "Failed to read "+hashrule_path+".")
	}

	report := S.MAKE(
		S.Tag.H4("Hashrule error: "+hashrule_path, S.Preset.Failed),
		errors,
		S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed, Styles: []string{S.Style.AS_Bold}},
	)

	return report, status
}
