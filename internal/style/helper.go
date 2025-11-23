package style

import (
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	_model "main/models"
	_util "main/package/utils"
	_regexp "regexp"
)

var PublishScatterPrefix = "_"
var PublishFinalPrefix = "___"
var PreviewScatterPrefix = string([]rune{_config.Root.CustomOp["attach"]})
var PreviewFinalPrefix = string([]rune{_config.Root.CustomOp["assign"]})

var symzero_regex = _regexp.MustCompile(`^[-_]\$`)

var Lodash_char = string(_config.Root.CustomOp["lodash"])
var Lodash_frag = "\\" + Lodash_char

func lodashstyle_process(
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
		_util.Code_Uncomment(native, true, true, false),
		selector, initial, flatten,
	)
	exportAttachResult := nativeAttachResult
	if _config.Static.EXPORT {
		export := importLodash(file, content, Lodash_frag+file.Label)
		exportAttachResult = Parse_CssSnippet(
			_util.Code_Uncomment(export, true, true, false),
			selector, initial, flatten,
		)
	}

	return nativeAttachResult, exportAttachResult
}

func DeclareClass(
	file *_model.File_Stash,
	classdata *_model.Style_ClassData,
	debugClass string,
) int {
	index := _action.Index_Declare(&_model.Cache_SymclassData{
		Context: file,
		SrcData: classdata,
	})
	
	classhash := _util.String_EnCounter(index)
	classdata.DebugScatterClass = debugClass
	classdata.DebugFinalClass = debugClass + "_Final"
	classdata.PreviewScatterClass = PreviewScatterPrefix + classdata.SymClass
	classdata.PreviewFinalClass = PreviewFinalPrefix + classdata.SymClass
	classdata.PublishScatterClass = PublishScatterPrefix + classhash
	classdata.PublishFinalClass = PublishFinalPrefix + classhash

	return index
}

func importLodash(ref *_model.File_Stash, str, lbl string) string {
	file := *ref
	file.Label = lbl
	file.Midway = str
	file.Content = str
	out := _script.Rider(&file, _script.E_Method_LoadHash).Scribed
	return out
}

func stripCustomTags(ref *_model.File_Stash, str string) string {
	file := *ref
	file.Midway = str
	file.Content = str
	out := _script.Rider(&file, _script.E_Method_StripTag).Scribed
	return out
}
