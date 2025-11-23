package compiler

import (
	"main/package/utils"

	_config "main/configs"

	X "main/internal/console"

	_model "main/models"

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
	newPubIn := make([][]_model.Style_ClassIndexTrace, 0, pubInLt*len(_config.Style.Publish_Ordered))
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

func FmtClassForCss(classname string) string {
	return utils.String_Filter(
		classname,
		[]rune{'_', '-'},
		[]rune{},
		[]rune{'/', '.', ':', '|', '$', op_strict, op_attach, op_assign},
	)
}

var op_strict = _config.Root.CustomOp["strict"]
var op_attach = _config.Root.CustomOp["attach"]
var op_assign = _config.Root.CustomOp["assign"]