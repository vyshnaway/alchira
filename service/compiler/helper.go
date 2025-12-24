package compiler

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	X "main/internal/console"
	"main/internal/script"
	"main/internal/style"
	"main/internal/target"
	_model "main/models"
	_css "main/package/css"
	"main/package/utils"
	_map "maps"
	_slice "slices"
	"sort"
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
		for _, i := range _config.Style.Sketchpad.Mid {
			for _, j := range i {
				indexes[j.ClassIndex] = true
			}
		}

		for i := range _config.Style.Sketchpad.Mid {
			if _, k := indexes[i]; !k {
				delete(_config.Style.Index_to_Styledata, i)
			}
		}
	}

	pubInLt := 24
	newPubIn := make([][]_model.Style_ClassIndexTrace, 0, pubInLt*len(_config.Style.Sketchpad.Mid))
	for _, A := range _config.Style.Sketchpad.Mid {
		for i := 0; i < len(A); i += pubInLt {
			end := min(i+pubInLt, len(A))
			newPubIn = append(newPubIn, A[i:end])
		}
	}
	_config.Style.Sketchpad.Mid = newPubIn
	consts := _slice.Collect(_map.Keys(_config.Manifest.Constants))
	sort.Strings(consts)
	_config.Delta.Report.Constants = X.List_Catalog(
		"Root Constants",
		consts,
	)

	var reportBlocks []string
	if _config.Static.WATCH || _config.Static.DEBUG {
		reportBlocks = []string{
			_config.Delta.Report.Axioms,
			_config.Delta.Report.Clusters,
			_config.Delta.Report.Artifacts,
			_config.Delta.Report.TargetDir,
			_config.Delta.Report.Constants,
			_config.Delta.Report.Hashrule,
			_config.Delta.Report.Errors,
		}
	} else {
		reportBlocks = []string{
			_config.Delta.Report.Errors,
			_config.Delta.Report.MemChart,
		}
	}

	var builder _string.Builder
	for _, s := range reportBlocks {
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

func FmtClassForCss(classname string) string {
	return "." + utils.String_Filter(
		classname,
		[]rune{'_', '-'},
		[]rune{},
		[]rune{'/', '.', ':', '|', '$', op_strict, op_attach, op_assign},
	)
}

var op_strict = _config.Root.CustomOp["apply"]
var op_attach = _config.Root.CustomOp["attach"]
var op_assign = _config.Root.CustomOp["assign"]

func GetDependents(tr target.GetTracks_return) (stylesheet, sketchsheet string) {
	directDeps := map[int]bool{}
	_map.Copy(directDeps, tr.MacRefs)
	_map.Copy(directDeps, tr.TopRefs)
	_map.Copy(directDeps, tr.LowRefs)
	for _, i := range tr.MidRefs {
		for _, ii := range i {
			directDeps[ii] = true
		}
	}

	indirDeps := map[int]bool{}
	for i := range directDeps {
		data := _action.Index_Fetch(i)
		_map.Copy(indirDeps, style.ResolveDependints(data))
	}
	for i := range tr.MacRefs {
		indirDeps[i] = false
	}
	for i := range directDeps {
		indirDeps[i] = false
	}

	dependmap := map[int]bool{}
	for i, unbound := range indirDeps {
		data := _action.Index_Fetch(i)
		if unbound && data.SrcData.NativeRawStyle.Len() > 0 {
			dependmap[i] = true
		}
	}

	attach_styles := _css.NewBlock(0, len(dependmap))

	var attach_sketchs _string.Builder
	for i := range dependmap {
		if data := _action.Index_Fetch(i); data != nil {
			attach_styles.Merge(data.SrcData.NativeAttachStyle)
			if _config.Static.PREVIEW {
				attach_sketchs.WriteString(script.SketchCompiler(i, script.E_Method_PreviewHash, map[int]bool{i: true}))
			} else {
				attach_sketchs.WriteString(script.SketchCompiler(i, script.E_Method_DebugHash, map[int]bool{i: true}))
			}
		}
	}

	stylesheet = _css.Render_Vendored(attach_styles, _config.Static.MINIFY)
	sketchsheet = _fmt.Sprint(_config.Saved.Tweaks["sketch-prefix"], attach_sketchs.String(), _config.Saved.Tweaks["sketch-suffix"])

	return stylesheet, sketchsheet
}

func GetDependentsForSketchpad() (stylesheet, sketchsheet string) {
	SP := _config.Style.Sketchpad

	LowRefs := map[int]bool{}
	MidRefs := [][]int{}
	TopRefs := map[int]bool{}
	MacRefs := map[int]bool{}

	for _, i := range SP.Low {
		LowRefs[i] = true
	}
	for _, i := range SP.Top {
		TopRefs[i] = true
	}
	for _, i := range SP.Mac {
		MacRefs[i] = true
	}

	for _, i := range SP.Mid {
		tmp := make([]int, len(i))
		for ii, iii := range i {
			tmp[ii] = iii.ClassIndex
		}
		MidRefs = append(MidRefs, tmp)
	}
	use := target.GetTracks_return{
		LowRefs: LowRefs,
		MidRefs: MidRefs,
		TopRefs: TopRefs,
		MacRefs: MacRefs,
	}
	// console.Render.Raw(use)
	// _fmt.Println(LowRefs)
	// _fmt.Println(MidRefs)
	// _fmt.Println(TopRefs)
	// _fmt.Println(MacRefs)
	return GetDependents(use)
}
