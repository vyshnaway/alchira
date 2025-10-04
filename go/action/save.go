package action

import (
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
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

	return _strings_.Join(inlined, "")
}

func Save_RootCss() {
	S.TASK("Updating Index", 0)
	_cache_.Static.RootCSS = save_CssImport([]string{
		_cache_.Path_Css["atrules"].Path,
		_cache_.Path_Css["constants"].Path,
		_cache_.Path_Css["elements"].Path,
		_cache_.Path_Css["extends"].Path,
	})
}

func Save_Libraries() {
	S.TASK("Updating Library", 0)
	_cache_.Static.Libraries_Saved, _ = _fileman_.Read_Bulk(
		_cache_.Path_Folder["libraries"].Path,
		[]string{"css"},
	)
}

func Save_Externals() {
	S.TASK("Updating External Artifacts", 0)
	_cache_.Static.Artifacts_Saved, _ = _fileman_.Read_Bulk(
		_cache_.Path_Folder["artifacts"].Path,
		[]string{_cache_.Root.Extension},
	)
}

func Save_Targets() {
	S.TASK("Syncing proxy folders", 0)
	_cache_.Static.TargetDir_Saved = Sync_ProxyMapDirs(_cache_.Static.ProxyMap)
}

func SaveHashrule() (Report string, Ok bool) {
	hashrule_path := _cache_.Path_Json["hashrule"].Path

	S.TASK("Updating Hashrule", 0)
	S.STEP("PATH : "+hashrule_path, 0)

	content, err := _fileman_.Read_Json(hashrule_path, false)
	errors := []string{}
	_cache_.Static.Hashrule = map[string]string{}
	if err == nil {
		if content_, ok := content.(map[string]string); ok {
			_cache_.Static.Hashrule = content_
		} else {
			errors = append(errors, hashrule_path)
		}
	} else {
		errors = append(errors, err.Error())
	}

	ok := len(errors) == 0
	report := S.MAKE(
		S.Tag.H4("Hashrule error: "+hashrule_path, S.Preset.Failed),
		errors,
		S.MakeList{TypeFunc: S.List.Bullets, Intent: 0, Preset: S.Preset.Failed, Styles: []string{S.Style.AS_Bold}},
	)

	return report, ok
}
