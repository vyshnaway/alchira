package service

import (
	_fmt "fmt"
	_config "main/configs"
	X "main/internal/shell"
	_model "main/models"
	_fileman "main/package/fileman"
	S "main/package/shell"
	_map "maps"
	_string "strings"
	_sync "sync"
)

func artifact_Fetch(identifier string, source string) (Files map[string]string, Status bool) {
	files := map[string]string{}
	artifactspath := _config.Path_Folder["artifacts"].Path

	status, fetched := func() (Ok bool, result _model.Config_Archive) {
		var res_nil _model.Config_Archive

		if res, err := _fileman.Read_Json(source, true); err == nil {
			if r, ok := res.(_model.Config_Archive); ok {
				return true, r
			}
			return false, res_nil
		}

		parts := _string.Split(source, "@")
		name := parts[0]
		var version string
		if len(parts) > 1 {
			version = parts[1]
		} else {
			version = "latest"
		}
		official_src := _config.Root.Url.Artifacts + name + "/" + version

		if res, err := _fileman.Read_Json(official_src, true); err == nil {
			if r, ok := res.(_model.Config_Archive); ok {
				return ok, r
			}
		}

		return false, res_nil
	}()

	if status {
		// if fetched.Artifacts != nil {
		// 	for lib, str := range fetched.Artifacts {
		// 		files[_fileman_.Path_Join(artifactspath, identifier, lib+"."+identifier+"."+"css")] = str
		// 	}
		// 	fetched.Artifacts = nil
		// }

		if fetched.Readme != "" {
			files[_fileman.Path_Join(artifactspath, identifier, `readme.md`)] = fetched.Readme
			fetched.Readme = ""
		}

		if fetched.Licence != "" {
			files[_fileman.Path_Join(artifactspath, identifier, `licence.md`)] = fetched.Licence
			fetched.Licence = ""
		}

		if fetched.ExportSheet != "" {
			lines := []string{
				_fmt.Sprintf("# %s@%s : Available SymClasses", fetched.Name, fetched.Version),
				"",
			}

			// If there are ExportClasses, map to lines
			if len(fetched.ExportClasses) > 0 {
				for _, i := range fetched.ExportClasses {
					if _string.Contains(i, "$$$") {
						lines = append(lines, _fmt.Sprintf("> /%s/%s", identifier, _string.Replace(i, "$$$", "$", 1)))
					} else {
						lines = append(lines, _fmt.Sprintf("> /%s/%s", identifier, i))
					}
				}
			}

			lines = append(lines, "")
			lines = append(lines, "")
			lines = append(lines, "# Declarations")
			lines = append(lines, "")
			lines = append(lines, fetched.ExportSheet)

			files[_fileman.Path_Join(artifactspath, identifier, identifier+"."+_config.Root.Extension)] = _string.Join(lines, "\n")
			fetched.ExportSheet = ""
		}
	}

	return files, status
}

func Artifact_Update() (Status bool, Report string, Files map[string]string) {
	files := map[string]string{}
	responses := map[string]string{}
	status := false
	report := ""

	if _config.Static.Artifacts_Sources != nil {
		var wg _sync.WaitGroup

		for identifier, source := range _config.Static.Artifacts_Sources {
			wg.Add(1)

			func() {
				defer wg.Done()
				if f, s := artifact_Fetch(identifier, source); s {
					_map.Copy(files, f)
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
	return status, report, files
}
