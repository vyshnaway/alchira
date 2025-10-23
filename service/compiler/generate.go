package compiler

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_script "main/internal/script"
	_stash "main/internal/stash"
	_style "main/internal/style"
	_model "main/models"
	S "main/package/console"
	_css "main/package/css"
	O "main/package/object"
	_util "main/package/utils"
	_map "maps"
	_slice "slices"
	_string "strings"
)

func Generate_Files() (Files map[string]string, Report string) {
	files := map[string]string{}

	artifact_files, attachments := Organize()
	attachments = append(attachments, _config.Delta.IndexAttach...)
	_map.Copy(files, artifact_files)

	var render_action _script.E_Action
	if _config.Static.Command == "debug" {
		render_action = _script.E_Action_DebugHash
	} else if _config.Static.Command == "preview" && _config.Static.WATCH {
		render_action = _script.E_Action_WatchHash
	} else {
		render_action = _script.E_Action_BuildHash
	}
	for _, target := range _stash.Cache.Targetdir {
		target.SyncClassnames(render_action)
	}

	var attach_staples _string.Builder
	attach_styles := _css.NewBlock()
	if _config.Static.WATCH {
		attachments = _slice.Collect(_map.Keys(_config.Style.Index_to_Data))
	} else {
		attachments = _util.Array_Setback(attachments)
	}
	for _, a := range attachments {
		data := _action.Index_Fetch(a)
		attach_styles.Merge(data.SrcData.NativeAttachStyle)
		if len(data.SrcData.NativeStaple) > 0 {
			attach_staples.WriteString(data.SrcData.NativeStaple)
		}
	}
	staple_sheet := attach_staples.String()

	type t_frag struct {
		key string
		val string
	}

	attach_frag := _css.Render_Vendored(attach_styles, _config.Static.MINIFY)
	render_frags := []t_frag{
		{
			key: "Root",
			val: _config.Delta.IndexBuild,
		},
		{
			key: "Class",
			val: _css.Render_Switched(func() *_css.T_Block {
				result := _css.NewBlock()
				for _, i := range _config.Style.PublishIndexMap {
					result.SetBlock(i.ClassName, _action.Index_Fetch(i.ClassIndex).SrcData.NativeRawStyle)
				}
				return result
			}(), _config.Static.MINIFY),
		},
		{
			key: "Attach",
			val: attach_frag,
		},
		{
			key: "Appendix",
			val: _css.Render_Sequence(func() *_css.T_BlockSeq {
				appendix_styles := _css.NewBlockSeq()
				for _, cache := range _stash.Cache.Targetdir {
					scanned := _style.Cssfile_String(cache.StylesheetContent, `APPENDIX : `+cache.Stylesheet+" | ")
					appendix_styles.Append(scanned.Result.Units...)
					for _, attachment := range scanned.Attachments {
						if res := _action.Index_Find(attachment, _model.Style_ClassIndexMap{}); res.Index > 0 {
							attachments = append(attachments, res.Index)
						}
					}
				}
				return appendix_styles
			}(), _config.Static.MINIFY),
		},
	}

	style_sheet := func() string {
		frags := []string{}
		for _, i := range render_frags {
			if _config.Static.DEBUG {
				frags = append(frags, _fmt.Sprint("\r\n\r\n/* Section: ", i.key, " */\r\n", i.val))
			} else {
				frags = append(frags, i.val)
			}
		}
		return _string.Join(frags, "")
	}()

	block_style := "<style>" + style_sheet + "</style>"
	block_on := block_style + block_style
	for _, target := range _stash.Cache.Targetdir {
		_map.Copy(files, target.SummonFiles(style_sheet, block_style, block_on, staple_sheet))
	}

	if !_config.Static.WATCH && !_config.Static.DEBUG {
		memchart := O.New[string, string]()
		for _, i := range render_frags {
			memchart.Set(
				i.key,
				_fmt.Sprintf("%9s", _fmt.Sprintf("%v Kb", _util.String_Memory(i.val))),
			)
		}
		memchart.Set(
			"",
			_fmt.Sprintf("%9s", _fmt.Sprintf("%v Kb", _util.String_Memory(style_sheet))),
		)

		_config.Delta.Report.MemChart = func() string {
			var heading string
			if len(_config.Delta.Errors) > 0 {
				heading = S.Tag.H2(_config.Delta.FinalMessage, S.Preset.Failed, S.Style.AS_Bold)
			} else {
				heading = S.Tag.H2(_config.Delta.FinalMessage, S.Preset.Success, S.Style.AS_Bold)
			}
			return S.MAKE(
				heading,
				X.List_Props(
					memchart,
					append([]string{S.Style.AS_Bold}, S.Preset.Primary...),
					append([]string{S.Style.AS_Bold}, S.Preset.Tertiary...),
				),
			)
		}()
	}

	_config.Delta.Report.Constants = X.List_Catalog(
		"Root Constants",
		_slice.Collect(_map.Keys(_config.Manifest.Constants)),
	)

	var builder _string.Builder
	for _, s := range []string{
		_config.Delta.Report.Axioms,
		_config.Delta.Report.Clusters,
		_config.Delta.Report.Artifacts,
		_config.Delta.Report.TargetDir,
		_config.Delta.Report.Constants,
		_config.Delta.Report.Hashrule,
		_config.Delta.Report.Errors,
		_config.Delta.Report.MemChart,
		_config.Delta.Report.Footer,
	} {
		if len(s) > 0 {
			builder.WriteString(s)
			builder.WriteRune('\r')
			builder.WriteRune('\n')
		}
	}
	report := builder.String()

	return files, report
}
