package action

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
	"main/utils"
	_regexp_ "regexp"
	_strings_ "strings"
)

// save_CssInlineImports recursively processes CSS imports
func save_CssInlineImports(filePath string, resolvedFiles *map[string]bool) (string, error) {

	content, err := _fileman_.Read_File(filePath, false)
	if err != nil {
		return "", err
	}
	basedir := _fileman_.Path_Basedir(filePath)

	content_string := string(content)
	import_regex := _regexp_.MustCompile(`@import\s+(?:url\()?["']?(.*?)["']?\)?\s*;`)
	for _, match := range import_regex.FindAllStringSubmatch(content_string, -1) {
		fullmatch := match[0]
		importpath := match[1]

		absolute_importpath, err := _fileman_.Path_Resolves(_fileman_.Path_Join(basedir, importpath))
		if err == nil && _fileman_.Path_IfFile(absolute_importpath) && !(*resolvedFiles)[absolute_importpath] {

			replacement, err := save_CssInlineImports(absolute_importpath, resolvedFiles)
			if err != nil {
				replacement = fullmatch
			}
			content_string = _strings_.Replace(content_string, fullmatch, replacement, 1)
		}
		(*resolvedFiles)[absolute_importpath] = true
	}

	return content_string, nil
}

// CssImport processes CSS files and inlines @import statements
func save_CssImport(filepath_array []string) string {
	resolved_files := make(map[string]bool)
	for _, filepath := range filepath_array {
		if abspath, err := _fileman_.Path_Resolves(filepath); err == nil && _fileman_.Path_IfFile(abspath) {
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

	return _strings_.Join(inlined, "\n")
}

func Save_RootCss() {
	_cache_.Static.RootCSS = save_CssImport([]string{
		_cache_.Path_Css["atrules"].Path,
		_cache_.Path_Css["constants"].Path,
		_cache_.Path_Css["elements"].Path,
		_cache_.Path_Css["extends"].Path,
	})
}

func Save_Libraries() {
	_cache_.Static.Libraries_Saved, _ = _fileman_.Read_Bulk(
		_cache_.Path_Folder["libraries"].Path,
		[]string{"css"},
	)
}

func Save_Artifacts() {
	_cache_.Static.Artifacts_Saved, _ = _fileman_.Read_Bulk(
		_cache_.Path_Folder["artifacts"].Path,
		[]string{_cache_.Root.Extension, "json"},
	)
}

func Save_Targets() {
	S.TASK("Saving Proxy-folders", 1)
	_cache_.Static.TargetDir_Saved = Sync_ProxyMapDirs(_cache_.Static.ProxyMap)
}

func SaveHashrule() (Report string, Status bool) {

	S.TASK("Saving Hashrule", 1)

	status := true
	errors := []string{}
	_cache_.Static.Hashrule = map[string]string{}
	hashrule_path := _cache_.Path_Json["hashrule"].Path
	if content, err := _fileman_.Read_File(hashrule_path, false); err == nil {
		if hashrules, e := utils.Code_JsonParse[map[string]string](content); e == nil {
			_cache_.Static.Hashrule = hashrules
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
