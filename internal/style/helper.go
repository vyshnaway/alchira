package style

import (
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	_model "main/models"
	"main/package/reader"
	_util "main/package/utils"
	"maps"
	_regexp "regexp"
	"strings"
)

var symzero_regex = _regexp.MustCompile(`^[-_]\$`)

var PublishLow = "_"
var PublishMid = "__"
var PublishTop = "___"
var PreviewLow = string([]rune{_config.Root.CustomOp["attach"]})
var PreviewMid = string([]rune{_config.Root.CustomOp["apply"]})
var PreviewTop = string([]rune{_config.Root.CustomOp["assign"]})

func DeclareClass(
	file *_model.File_Stash,
	classdata *_model.Style_ClassData,
	debugClass string,
) int {
	index := _action.Index_Declare(&_model.Cache_SymlinkData{
		Context: file,
		SrcData: classdata,
	})

	classhash := _util.String_EnCounter(index)
	classdata.Classhash = classhash

	classdata.DebugLow = debugClass + "_Low"
	classdata.DebugLow = debugClass + "_Mid"
	classdata.DebugTop = debugClass + "_Top"

	classdata.PreviewLow = PreviewLow + classdata.Symlink
	classdata.PreviewMid = PreviewMid + classdata.Symlink
	classdata.PreviewTop = PreviewTop + classdata.Symlink

	if !strings.Contains(classdata.Symlink, "$$") {
		classdata.PreviewLow = classdata.PreviewLow + "_" + classhash
		classdata.PreviewMid = classdata.PreviewMid + "_" + classhash
		classdata.PreviewTop = classdata.PreviewTop + "_" + classhash
	}

	classdata.PublishLow = PublishLow + classhash
	classdata.PublishMid = PublishMid + classhash
	classdata.PublishTop = PublishTop + classhash

	return index
}

var Lodash_char = string(_config.Root.CustomOp["lodash"])
var Lodash_frag = "\\" + Lodash_char

func stylesnippet_process(
	content string,
	file *_model.File_Stash,
	flatten bool,
	initial string,
	selector string,
) (
	NativeResult R_Parse,
	AttachResult R_Parse,
) {
	native := importLodash(file, content, file.Label)
	nativeAttachResult := Parse_CssSnippet(
		_util.Code_Uncomment(native, true, true, true),
		selector, initial, flatten,
	)
	exportAttachResult := nativeAttachResult
	export := importLodash(file, content, Lodash_frag+file.Label)
	exportAttachResult = Parse_CssSnippet(
		_util.Code_Uncomment(export, true, true, true),
		selector, initial, flatten,
	)

	return nativeAttachResult, exportAttachResult
}

func importLodash(context *_model.File_Stash, str, lbl string) string {
	file := *context
	file.Label = lbl
	file.Midway = str
	file.Content = str

	out := _script.Value_Builder(
		str, _script.E_Method_LoadHash,
		&file, reader.New(str),
		false, map[string]string{},
	)
	return out
}

func stripCustomTags(context *_model.File_Stash, str string) string {
	file := *context
	file.Midway = str
	file.Content = str
	out := _script.Rider(&file, _script.E_Method_LoadHash, map[int]bool{}).Scribed
	return out
}

func ResolveDependints(data *_model.Cache_SymlinkData) map[int]bool {
	if data != nil && data.Dependint == nil {
		data.Dependint = map[int]bool{}
		for as := range data.SrcData.Attachments {
			if found := _action.Index_Finder(as, data.Context.Cache.LocalMap); found.Index > 0 {
				r := ResolveDependints(found.Data)
				data.Dependint[found.Index] = true
				maps.Copy(data.Dependint, r)
			}
		}
	}
	return data.Dependint
}
