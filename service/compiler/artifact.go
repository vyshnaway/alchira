package compiler

import (
	"encoding/json"
	_fmt "fmt"
	_config "main/configs"
	X "main/internal/console"
	_model "main/models"
	S "main/package/console"
	_fileman "main/package/fileman"
	_object "main/package/object"
	_util "main/package/utils"
	_map "maps"
	_slice "slices"
	_sort "sort"
	_string "strings"
	_sync "sync"
)

func artifact_Fetch(identifier string, source string) (Files map[string]string, Status bool) {
	files := make(map[string]string, 4)
	artifactspath := _config.Path_Folder["artifacts"].Path

	status, artifact := func() (Ok bool, result _model.Config_Archive) {
		var r _model.Config_Archive

		if str, err := _fileman.Read_File(source, true); err == nil {
			if e := json.Unmarshal([]byte(str), &r); e != nil {
				return false, r
			}
			return true, r
		} else {

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

			return false, r
		}
	}()

	if status {

		if artifact.Readme != "" {
			files[_fileman.Path_Join(artifactspath, identifier, `readme.md`)] = artifact.Readme
			artifact.Readme = ""
		}

		if artifact.Licence != "" {
			files[_fileman.Path_Join(artifactspath, identifier, `licence.md`)] = artifact.Licence
			artifact.Licence = ""
		}

		if artifact.ExportSheet != "" {
			lines := []string{
				_fmt.Sprintf("# %s@%s : Available SymClasses", artifact.Name, artifact.Version),
				"",
			}

			// If there are ExportClasses, map to lines
			if len(artifact.ExportClasses) > 0 {
				for _, i := range artifact.ExportClasses {
					if _string.Contains(i, "$$$") {
						lines = append(lines, _fmt.Sprintf("> /%s/%s", identifier, _string.Replace(i, "$$$", "$", 1)))
					} else {
						lines = append(lines, _fmt.Sprintf("> /%s/%s", identifier, i))
					}
				}
			}

			lines = append(lines, "")
			lines = append(lines, "")
			lines = append(lines, "# Design Tokens")
			lines = append(lines, "")
			lines = append(lines, "```css")
			lines = append(lines, "")
			lines = append(lines, ":root {")
			c := _slice.Collect(_map.Keys(artifact.Constants))
			_sort.Strings(c)
			for _, k := range c {
				v := artifact.Constants[k]
				lines = append(lines, _fmt.Sprint("  ", k, ": ", v, ";"))
			}
			lines = append(lines, "}")
			lines = append(lines, "")
			lines = append(lines, "```")

			lines = append(lines, "")
			lines = append(lines, "")
			lines = append(lines, "# Declarations")
			lines = append(lines, "")
			lines = append(lines, "```html")
			lines = append(lines, artifact.ExportSheet)
			lines = append(lines, "```")

			files[_fileman.Path_Join(artifactspath, identifier, identifier+"."+_config.Root.Extension)] = _string.Join(lines, "\r\n")
			artifact.ExportSheet = ""
		}

		artifact.Source = source
		files[_fileman.Path_Join(artifactspath, identifier, identifier+".json")], _ = _util.Code_JsoncBuild(artifact, "  ")
	}

	return files, status
}

func Artifact_Install() (Status bool, Report string, Files map[string]string) {
	files := map[string]string{}
	responses := map[string]string{}
	status := true
	report := ""

	if _config.Saved.Artifacts_Sources != nil {
		var wg _sync.WaitGroup

		for identifier, source := range _config.Saved.Artifacts_Sources {
			wg.Add(1)

			func() {
				defer wg.Done()
				if f, s := artifact_Fetch(identifier, source); s {
					_map.Copy(files, f)
					responses[identifier] = S.Tag.Span("Successfull", S.Preset.Success)
				} else {
					responses[identifier] = S.Tag.Span("Unavailable", S.Preset.Failed)
					status = false
				}
			}()
		}

		wg.Wait()
	}

	report = S.MAKE(
		"",
		X.List_Props(_object.FromUnorderedMap(responses), S.Preset.None, S.Preset.None),
		S.MakeList{Intent: 0, TypeFunc: S.List.Bullets, Preset: S.Preset.Text},
	)

	return status, report, files
}
