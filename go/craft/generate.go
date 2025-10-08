package craft

import (
	_fmt_ "fmt"
	_cache_ "main/cache"
	_compose_ "main/compose"
	S "main/shell"
	_style_ "main/style"
	_types_ "main/types"
	_utils_ "main/utils"
	X "main/xhell"
	_maps_ "maps"
	_slices_ "slices"
	_strings_ "strings"
)

// _cache_ "main/cache"
// _Blockmap_ "main/class/Blockmap"
// _stash_ "main/stash"
// _maps_ "maps"

func Generate_Files() (Files map[string]string, Report string) {
	files := map[string]string{}
	report := ""

	if len(_cache_.Delta.Content) > 0 {
		files[_cache_.Delta.Path] = _cache_.Delta.Content
	} else {

		artifact_files, attachments := Organize()
		_maps_.Copy(files, artifact_files)

		index_scanned := _style_.Cssfile_Parse(
			_utils_.Code_Uncomment(_cache_.Static.RootCSS, false, true, false),
			"INDEX ||",
			_cache_.Static.WATCH,
		)
		_cache_.Manifest.Constants = _slices_.Collect(_maps_.Keys(index_scanned.Variables))
		_cache_.Delta.Report.Constants = X.List_Catalog("Root Constants", _cache_.Manifest.Constants)
		for _, attachment := range index_scanned.Attachments {
			if res := _cache_.Index_Find(attachment, _types_.Style_ClassIndexMap{}); res.Index > 0 {
				attachments = append(attachments, res.Index)
			}
		}
		watch_index := _compose_.Render_Prefixed(index_scanned.Result, _cache_.Static.WATCH)

		// 	var render_action _types_.Script_Action
		// 	if _cache_.Static.Command == "debug" {
		// 		render_action = _types_.Script_Action_Monitor
		// 	} else if _cache_.Static.Command == "preview" && _cache_.Static.WATCH {
		// 		render_action = _types_.Script_Action_Watch
		// 	} else {
		// 		render_action = _types_.Script_Action_Sync
		// 	}
		// 	for _, target := range _stash_.Cache.Targetdir {
		// 		target.SyncClassnames(render_action)
		// 	}

		// attach_staples := []string{}
		// attach_styles := [][2]any{}
		// attachment_list := []int{}
		// 	if _cache_.Static.WATCH {
		// 		attachment_list = _slices_.Collect(_maps_.Keys(_cache_.Style.Index_to_Data))
		// 	} else {
		// 		attachment_list = _utils_.Array_Setback(attachments)
		// 	}
		// 	for _, a := range attachment_list {
		// 		data := _cache_.Index_Fetch(a)
		// 		for k, v := range data.SnippetStyle {
		// 			attach_styles = append(attach_styles, [2]any{k, v})
		// 		}
		// 		if len(data.SnippetStaple) > 0 {
		// 			attach_staples = append(attach_staples, data.SnippetStaple)
		// 		}
		// 	}
		// staple_sheet := _utils_.Code_Minify(_utils_.Code_Uncomment(_strings_.Join(attach_staples, ""), false, false, true))

		render_frags := map[string]string{
			// "Root": watch_index,
			// 		"Class": _compose_.Switched(func() map[string]_Blockmap_.Type {
			// 			result := map[string]_Blockmap_.Type{}
			// 			for _, i := range _cache_.Style.PublishIndexMap {
			// 				result[i.ClassName] = _cache_.Index_Fetch(i.ClassIndex).StyleObject
			// 			}
			// 			return result
			// 		}(), _cache_.Static.WATCH),
			// 		"Attach": _compose_.Render(attach_styles, _cache_.Static.WATCH),
			// 		"Appendix": _compose_.Render(
			// 			func() [][2]any {
			// 				appendix_styles := [][2]any{}
			// 				for _, cache := range _stash_.Cache.Targetdir {
			// 					scanned := _style_.Cssfile_Parse(cache.StylesheetContent, `APPENDIX : ${cache.targetStylesheet} ||`, _cache_.Static.WATCH)
			// 					appendix_styles = append(appendix_styles, scanned.Result...)
			// 					for _, attachment := range scanned.Attachments {
			// 						if res := _cache_.Index_Find(attachment, _types_.Style_ClassIndexMap{}); res.Index > 0 {
			// 							attachments = append(attachments, res.Index)
			// 						}
			// 					}
			// 				}
			// 				return appendix_styles
			// 			}(),
			// 			_cache_.Static.WATCH,
			// 		),
		}

		style_sheet := func() string {
			frags := []string{}
			// 		for k, v := range render_frags {
			// 			if _cache_.Static.VERBOSE {
			// 				frags = append(frags, "\n\n/* Section: "+k+" */\n"+v+"\n")
			// 			} else {
			// 				frags = append(frags, v)
			// 			}
			// 		}

			return _strings_.Join(frags, "")
		}()

		watch_class := ""
		// 	if _cache_.Static.WATCH {
		// 		watch_class = _utils_.Code_Strip(_compose_.Switched(
		// 			func() map[string]map[string]any {
		// 				res := map[string]_Blockmap_.Type{}
		// 				for i, d := range _cache_.Style.Index_to_Data {
		// 					res["."+d.Metadata.WatchClass] = _cache_.Index_Fetch(i).StyleObject
		// 				}
		// 				return res
		// 			}(), _cache_.Static.WATCH,
		// 		)+render_frags["Attach"], true, true, false, true)
		// 	}

		// 	block_style := "<style>" + style_sheet + "</style>"
		// 	block_summon := block_style + block_style
		// 	for _, target := range _stash_.Cache.Targetdir {
		// 		_maps_.Copy(files, target.SummonFiles(style_sheet, block_style, block_summon, staple_sheet))
		// 	}

		if _cache_.Static.WATCH {
			files[_cache_.Path_Autogen["manifest"].Path] = _utils_.Code_JsonBuild(_cache_.Manifest, "")
			files[_cache_.Path_Autogen["index"].Path] = watch_index
			files[_cache_.Path_Autogen["watch"].Path] = watch_class
			// files[_cache_.Path_Autogen["staple"].Path] = staple_sheet
		} else {
			memchart := map[string]string{}
			for key, val := range render_frags {
				memchart[key] = _fmt_.Sprintf("%9s", _fmt_.Sprintf("%v Kb", _utils_.String_Memory(val)))
			}
			memchart["[***.css]"] = _fmt_.Sprintf("%9s", _fmt_.Sprintf("%v Kb", _utils_.String_Memory(style_sheet)))

			_cache_.Delta.Report.MemChart = func() string {
				var heading string
				if _cache_.Delta.ErrorCount > 0 {
					heading = S.Tag.H2(_cache_.Delta.FinalMessage, S.Preset.Failed)
				} else {
					heading = S.Tag.H2(_cache_.Delta.FinalMessage, S.Preset.Success)
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
	}

	_cache_.Delta.Path = ""
	_cache_.Delta.Content = ""

	return files, report
}
