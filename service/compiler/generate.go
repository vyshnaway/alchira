package compiler

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	_stash "main/internal/stash"
	"main/models"
	S "main/package/console"
	_css "main/package/css"
	O "main/package/object"
	_util "main/package/utils"
	_map "maps"
	_slice "slices"
	_string "strings"
)

func ClearUnwantedCache() (
	Report string,
	ErrLen int,
	FinalMessage string,
	IndexFrag string,
) {

	if !_config.Static.IAMAI {
		indexes := make(map[int]bool, 64)
		for _, i := range _config.Style.Publish_Ordered {
			for _, j := range i {
				indexes[j.ClassIndex] = true
			}
		}

		for i := range _config.Style.Publish_Ordered {
			if _, k := indexes[i]; !k {
				delete(_config.Style.Index_to_Styledata, i)
			}
		}
	}

	pubInLt := 24
	newPubIn := make([][]models.Style_ClassIndexTrace, 0, pubInLt*len(_config.Style.Publish_Ordered))
	for _, A := range _config.Style.Publish_Ordered {
		for i := 0; i < len(A); i += pubInLt {
			end := min(i+pubInLt, len(A))
			newPubIn = append(newPubIn, A[i:end])
		}
	}
	_config.Style.Publish_Ordered = newPubIn

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
	} {
		if len(s) > 0 {
			builder.WriteString(s)
			builder.WriteRune('\r')
			builder.WriteRune('\n')
		}
	}
	report := builder.String()
	errLen := len(_config.Delta.Errors)
	index_frag := _config.Delta.IndexBuild
	finalMessage := _config.Delta.FinalMessage

	if !_config.Static.IAMAI {
		_config.Delta_Reset()
		_config.Archive_Reset()
		_config.Manifest_Reset()
	}

	return report, errLen, finalMessage, index_frag
}

func Generate_Files() (Files map[string]string, Report string) {

	files, attachments, scatteredMap, finalMap := Organize()
	_stash.Target_SyncClassNames()

	appendix_frag := _css.Render_Sequence(func() *_css.T_BlockSeq {
		result := _css.NewBlockSeq(len(_stash.Cache.Targetdir) * 8)
		for _, cache := range _stash.Cache.Targetdir {
			result.Append(cache.StylesheetBlockSeq.Units...)
		}
		return result
	}(), _config.Static.MINIFY)

	attach_frag, staple_sheet := func() (string, string) {
		attach_styles := _css.NewBlock(len(attachments), len(attachments))
		var attach_staples _string.Builder
		for a := range attachments {
			if data := _action.Index_Fetch(a); data != nil {
				attach_styles.Merge(data.SrcData.NativeAttachStyle)
				attach_staples.WriteString(data.SrcData.NativeStaple)
			}
		}
		attach_frag := _css.Render_Vendored(attach_styles, _config.Static.MINIFY)
		staple_sheet := attach_staples.String()
		return attach_frag, staple_sheet
	}()

	scattered_block := _css.NewBlock(0, len(scatteredMap))
	for i := range scatteredMap {
		d := _action.Index_Fetch(i)
		if _config.Static.DEBUG {
			scattered_block.SetBlock("."+d.SrcData.DebugScatterClass, d.SrcData.NativeRawStyle)
		} else {
			scattered_block.SetBlock("."+d.SrcData.ScatterClass, d.SrcData.NativeRawStyle)
		}
	}
	scattered_frag := _css.Render_Switched(scattered_block, _config.Static.MINIFY)

	final_block := _css.NewBlock(0, len(finalMap))
	for i := range finalMap {
		d := _action.Index_Fetch(i)
		if _config.Static.DEBUG {
			final_block.SetBlock("."+d.SrcData.DebugFinalClass, d.SrcData.NativeRawStyle)
		} else {
			final_block.SetBlock("."+d.SrcData.FinalClass, d.SrcData.NativeRawStyle)
		}
	}
	final_frag := _css.Render_Switched(final_block, _config.Static.MINIFY)

	report, errLen, finalMessage, index_frag := ClearUnwantedCache()
	var class_builder _string.Builder
	for _, i := range _config.Style.Publish_Ordered {
		class_builder.WriteString(_css.Render_Switched(func() *_css.T_Block {
			result := _css.NewBlock(0, len(i))
			for _, j := range i {
				result.SetBlock(j.ClassName, _action.Index_Fetch(j.ClassIndex).SrcData.NativeRawStyle)
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
		{key: "Scattered", val: scattered_frag},
		{key: "Ordered", val: ordered_frag},
		{key: "Final", val: final_frag},
		{key: "Attach", val: attach_frag},
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

	staple_block := _fmt.Sprint(_config.Saved.Tweaks["staple-prefix"], staple_sheet, _config.Saved.Tweaks["staple-suffix"])
	style_block := _fmt.Sprint(_config.Saved.Tweaks["styles-prefix"], style_sheet, _config.Saved.Tweaks["styles-suffix"])
	summon_block := style_block + staple_block
	for _, target := range _stash.Cache.Targetdir {
		_map.Copy(files, target.SummonFiles(style_sheet, style_block, summon_block, staple_block))
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
