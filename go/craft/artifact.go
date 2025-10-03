package craft

import (
	_fmt_ "fmt"
	_cache_ "main/cache"
	_fileman_ "main/fileman"
	S "main/shell"
	_types_ "main/types"
	X "main/xhell"
	_maps_ "maps"
	_strings_ "strings"
	_sync_ "sync"
)

func artifact_Fetch(identifier string, source string) (Files map[string]string, Status bool) {
	files := map[string]string{}
	artifactspath := _cache_.Path["folder"]["artifacts"].Path

	status, fetched := func() (Ok bool, result _types_.Config_Archive) {
		var res_nil _types_.Config_Archive

		if res, err := _fileman_.Read_Json(source, true); err == nil {
			if r, ok := res.(_types_.Config_Archive); ok {
				return true, r
			}
			return false, res_nil
		}

		parts := _strings_.Split(source, "@")
		name := parts[0]
		var version string
		if len(parts) > 1 {
			version = parts[1]
		} else {
			version = "latest"
		}
		official_src := _cache_.Root.Url.Artifacts + name + "/" + version

		if res, err := _fileman_.Read_Json(official_src, true); err == nil {
			if r, ok := res.(_types_.Config_Archive); ok {
				return ok, r
			}
		}

		return false, res_nil
	}()

	if status {
		if fetched.Artifacts != nil {
			for lib, str := range fetched.Artifacts {
				files[_fileman_.Path_Join(artifactspath, identifier, lib+"."+identifier+"."+"css")] = str
			}
			fetched.Artifacts = nil
		}

		if fetched.Readme != "" {
			files[_fileman_.Path_Join(artifactspath, identifier, `readme.md`)] = fetched.Readme
			fetched.Readme = ""
		}

		if fetched.Licence != "" {
			files[_fileman_.Path_Join(artifactspath, identifier, `licence.md`)] = fetched.Licence
			fetched.Licence = ""
		}

		if fetched.ExportSheet != "" {
			lines := []string{
				_fmt_.Sprintf("# %s@%s : Available SymClasses", fetched.Name, fetched.Version),
				"",
			}

			// If there are ExportClasses, map to lines
			if len(fetched.ExportClasses) > 0 {
				for _, i := range fetched.ExportClasses {
					if _strings_.Contains(i, "$$$") {
						lines = append(lines, _fmt_.Sprintf("> /%s/%s", identifier, _strings_.Replace(i, "$$$", "$", 1)))
					} else {
						lines = append(lines, _fmt_.Sprintf("> /%s/%s", identifier, i))
					}
				}
			}

			lines = append(lines, "")
			lines = append(lines, "")
			lines = append(lines, "# Declarations")
			lines = append(lines, "")
			lines = append(lines, fetched.ExportSheet)

			files[_fileman_.Path_Join(artifactspath, identifier, identifier+"."+_cache_.Root.Extension)] = _strings_.Join(lines, "\n")
			fetched.ExportSheet = ""
		}
	}

	return files, status
}

func artifact_Update() (Files map[string]string, Report string, Status bool) {
	files := map[string]string{}
	responses := map[string]string{}
	status := false
	report := ""

	if _cache_.Static.Archive.Artifacts != nil {
		var wg _sync_.WaitGroup

		for identifier, source := range _cache_.Static.Archive.Artifacts {
			wg.Add(1)

			func() {
				defer wg.Done()
				if f, s := artifact_Fetch(identifier, source); s {
					_maps_.Copy(files, f)
					responses[identifier] = S.Tag.Span("Successfull", S.Preset.Success)
				} else {
					responses[identifier] = S.Tag.Span("Unavailable", S.Preset.Failed)
				}
			}()
		}

		wg.Wait()
	}

	report = S.MAKE(
		"",
		X.List_Props(responses, S.Preset.None, S.Preset.None),
		S.MakeList{Intent: 0, TypeFunc: S.List.Bullets, Preset: S.Preset.Text},
	)
	return files, report, status
}
