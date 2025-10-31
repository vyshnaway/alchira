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

	indexes := make(map[int]bool, 64)
	for _, i := range _config.Style.PublishIndexMap {
		for _, j := range i {
			indexes[j.ClassIndex] = true
		}
	}

	for i := range _config.Style.PublishIndexMap {
		if _, k := indexes[i]; !k {
			delete(_config.Style.Index_to_Styledata, i)
		}
	}

	pubInLt := 24
	newPubIn := make([][]models.Style_ClassIndexTrace, 0, pubInLt*len(_config.Style.PublishIndexMap))
	for _, A := range _config.Style.PublishIndexMap {
		for i := 0; i < len(A); i += pubInLt {
			end := min(i+pubInLt, len(A))
			newPubIn = append(newPubIn, A[i:end])
		}
	}
	_config.Style.PublishIndexMap = newPubIn

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

	_config.Delta_Reset()
	_config.Archive_Reset()
	_config.Manifest_Reset()

	return report, errLen, finalMessage, index_frag
}

func Generate_Files() (Files map[string]string, Report string) {

	files, attachments := Organize()
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

	report, errLen, finalMessage, index_frag := ClearUnwantedCache()
	var class_builder _string.Builder

	for _, i := range _config.Style.PublishIndexMap {
		class_builder.WriteString(_css.Render_Switched(func() *_css.T_Block {
			result := _css.NewBlock(0, len(i))
			for _, j := range i {
				result.SetBlock(j.ClassName, _action.Index_Fetch(j.ClassIndex).SrcData.NativeRawStyle)
			}
			return result
		}(), _config.Static.MINIFY))
	}
	class_frag := class_builder.String()

	render_frags := []struct {
		key string
		val string
	}{
		{key: "Root", val: index_frag},
		{key: "Class", val: class_frag},
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

	block_style := _fmt.Sprint("<style>", style_sheet, "</style>")
	block_on := block_style + block_style
	for _, target := range _stash.Cache.Targetdir {
		_map.Copy(files, target.SummonFiles(style_sheet, block_style, block_on, staple_sheet))
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
			if errLen > 0 {
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
