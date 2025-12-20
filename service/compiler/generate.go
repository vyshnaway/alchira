package compiler

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"

	_stash "main/internal/stash"
	S "main/package/console"
	_css "main/package/css"
	O "main/package/object"
	_util "main/package/utils"
	_map "maps"
	_string "strings"
)

func Generate_Files() (Files map[string]string, Report string) {
	files, shortlist := Organize()

	appendix_frag := _css.Render_Sequence(func() *_css.T_BlockSeq {
		result := _css.NewBlockSeq(len(_stash.Cache.Targetdir) * 8)
		for _, cache := range _stash.Cache.Targetdir {
			result.Append(cache.StylesheetBlockSeq.Units...)
		}
		return result
	}(), _config.Static.MINIFY)

	attach_frag, sketch_sheet := GetDependents(shortlist)

	scattered_block := _css.NewBlock(0, len(shortlist.LowRefs))
	for i := range shortlist.LowRefs {
		d := _action.Index_Fetch(i)
		if _config.Static.DEBUG {
			scattered_block.SetBlock(FmtClassForCss(d.SrcData.DebugLow), d.SrcData.NativeRawStyle)
		} else if _config.Static.PREVIEW {
			scattered_block.SetBlock(FmtClassForCss(d.SrcData.PreviewLow), d.SrcData.NativeRawStyle)
		} else {
			scattered_block.SetBlock(FmtClassForCss(d.SrcData.PublishLow), d.SrcData.NativeRawStyle)
		}
	}
	scattered_frag := _css.Render_Switched(scattered_block, _config.Static.MINIFY)

	final_block := _css.NewBlock(0, len(shortlist.TopRefs))
	for i := range shortlist.TopRefs {
		d := _action.Index_Fetch(i)
		if _config.Static.DEBUG {
			final_block.SetBlock(FmtClassForCss(d.SrcData.DebugTop), d.SrcData.NativeRawStyle)
		} else if _config.Static.PREVIEW {
			final_block.SetBlock(FmtClassForCss(d.SrcData.PreviewTop), d.SrcData.NativeRawStyle)
		} else {
			final_block.SetBlock(FmtClassForCss(d.SrcData.PublishTop), d.SrcData.NativeRawStyle)
		}
	}
	final_frag := _css.Render_Switched(final_block, _config.Static.MINIFY)

	report, errLen, finalMessage, index_frag := ClearUnwantedCache()
	_stash.Target_SyncClassNames()

	var class_builder _string.Builder
	for _, i := range _config.Style.Sketchpad.Mid {
		class_builder.WriteString(_css.Render_Switched(func() *_css.T_Block {
			result := _css.NewBlock(0, len(i))
			for _, j := range i {
				result.SetBlock(FmtClassForCss(j.ClassName), _action.Index_Fetch(j.ClassIndex).SrcData.NativeRawStyle)
			}
			return result
		}(), _config.Static.MINIFY))
	}
	ordered_frag := class_builder.String()

	render_frags := []struct {
		key string
		val string
	}{
		{key: "Index", val: index_frag},
		{key: "LowClass", val: scattered_frag},
		{key: "MidClass", val: ordered_frag},
		{key: "TopClass", val: final_frag},
		{key: "Sketches", val: attach_frag},
		{key: "Appendix", val: appendix_frag},
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

	style_block := _fmt.Sprint(_config.Saved.Tweaks["styles-prefix"], style_sheet, _config.Saved.Tweaks["styles-suffix"])
	for _, target := range _stash.Cache.Targetdir {
		_map.Copy(files, target.RebuildFiles(style_sheet, style_block, sketch_sheet))
	}

	if !_config.Static.WATCH {
		report += func() string {

			memchart := O.New[string, string](len(render_frags) + 2)
			for _, i := range render_frags {
				memchart.Set(
					i.key,
					_fmt.Sprintf("%9s", _fmt.Sprintf("%v Kb", _util.String_Memory(i.val))),
				)
			}

			memchart.Set(
				_string.Repeat("=", 10),
				_string.Repeat("=", 10),
			)
			memchart.Set(
				"TOTAL",
				_fmt.Sprintf("%9s", _fmt.Sprintf("%v Kb", _util.String_Memory(style_sheet))),
			)

			var heading string
			if errLen > 0 || len(_config.Delta.PublishError) > 0 {
				heading = S.Tag.H2(finalMessage, S.Preset.Failed, S.Style.AS_Bold)
			} else {
				heading = S.Tag.H2(finalMessage, S.Preset.Success, S.Style.AS_Bold)
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

	return files, report
}
