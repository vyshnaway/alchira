package style

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"
	_css "main/package/css"
	_util "main/package/utils"
	_map "maps"
	_regexp "regexp"
	_strconv "strconv"
	_string "strings"
)

var Lodash_tag = "<!" + Lodash_char + ">"
var Lodash_char = string(_config.Root.CustomOp["lodash"])
var IdLodash_regex = _regexp.MustCompile(`\#` + Lodash_char)
var ClassLodash_regex = _regexp.MustCompile(`\.` + Lodash_char)
var CheckLodash_regex = _regexp.MustCompile(`[#.]` + Lodash_char)

var symzero_regex = _regexp.MustCompile(`^[-_]\$`)

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
	native := _string.ReplaceAll(content, Lodash_tag, file.Label)
	nativeAttachResult := Parse_CssSnippet(
		_util.Code_Uncomment(native, true, true, false),
		selector, initial, flatten,
	)

	exportAttachResult := nativeAttachResult
	if _config.Static.EXPORT {
		export := _string.ReplaceAll(content, Lodash_tag, Lodash_tag+file.Label)
		exportAttachResult = Parse_CssSnippet(
			_util.Code_Uncomment(export, true, true, false),
			selector, initial, flatten,
		)
	}

	return nativeAttachResult, exportAttachResult
}

func Rawtag_Upload(
	raw *_model.T_RawStyle,
	file *_model.File_Stash,
	IndexMap _model.Style_ClassIndexMap,
) R_Rawtag_Upload {
	errors := make([]string, 0, 4)
	diagnostics := make([]*_model.File_Diagnostic, 0, 4)
	attachments := make(map[string]bool, 12)
	forArtifact := file.Lookup.Type == _model.File_Type_Artifact
	declaration := file.TargetPath + ":" + _strconv.Itoa(raw.Range.Start.Row) + ":" + _strconv.Itoa(raw.Range.Start.Col) +
		"::" + _strconv.Itoa(raw.Range.End.Row) + ":" + _strconv.Itoa(raw.Range.End.Col)

	symzero := ""
	if len(raw.SymClasses) > 0 {
		symzero = symzero_regex.ReplaceAllString(raw.SymClasses[0], "$")
	}
	var normalized_symclass string
	symclass := file.ClassFront
	if forArtifact {
		if !_string.Contains(symzero, "$$$") {
			symclass += "$/" + symzero
		} else {
			symclass += _string.ReplaceAll(symzero, "$$$", "$")
		}
		normalized_symclass = _util.String_Filter(symclass, []rune{}, []rune{}, []rune{'$', '/'})
	} else {
		symclass += string(symzero)
		normalized_symclass = _util.String_Filter(symclass, []rune{}, []rune{}, []rune{'$'})
	}

	found := _action.Index_Finder(symclass, IndexMap)
	index := found.Index
	if found.Index > 0 {
		classdata := _action.Index_Fetch(found.Index)
		classdata.SrcData.Metadata.Declarations = append(classdata.SrcData.Metadata.Declarations, declaration)
	} else {
		var scope _model.Style_Type
		if raw.Scope == _model.Style_Type_Artifact {
			scope = _model.Style_Type_Null
		} else {
			scope = raw.Scope
		}
		debugRapidClass := _fmt.Sprint(scope, file.DebugFront, "\\:", raw.Range.Start.Row, "\\:", raw.Range.Start.Col, "_", normalized_symclass)

		native_scanned, export_scanned := lodashstyle_process(raw.Styles[""], file, false,
			_fmt.Sprint(raw.Scope, " : ", declaration, " | "), raw.SymClasses[0],
		)
		nativeRawStyle := native_scanned.Result
		exportRawStyle := export_scanned.Result

		_map.Copy(attachments, native_scanned.Attachments)
		variables := native_scanned.Variables
		for key, val := range raw.Styles {
			if key != "" {
				query := Hashrule_Render(key, declaration)
				if query.Status {
					native_scanned, export_scanned := lodashstyle_process(val, file, true,
						_fmt.Sprint(raw.Scope, " : ", declaration, " | "),
						_fmt.Sprint(raw.SymClasses[0], " // ", key),
					)

					_map.Copy(attachments, native_scanned.Attachments)
					variables.Copy(native_scanned.Variables)

					if native_scanned.Result.Len() > 0 {
						if wrapperjson, err := _util.Code_JsoncBuild(query.Wrappers, ""); err == nil {
							if !forArtifact && CheckLodash_regex.MatchString(wrapperjson) {
								wrapperjson = ClassLodash_regex.ReplaceAllString(wrapperjson, "."+file.Label)
								wrapperjson = IdLodash_regex.ReplaceAllString(wrapperjson, "#"+file.Label)
							} else {
								exportRawStyle.SetBlock(wrapperjson, export_scanned.Result)
							}
							nativeRawStyle.SetBlock(wrapperjson, native_scanned.Result)
						}
					}
				} else {
					errors = append(errors, query.Errorstring)
					diagnostics = append(diagnostics, &query.Diagnostic)
				}
			}
		}

		artifact := _config.Archive.Name
		if forArtifact {
			artifact = file.Artifact
			attachmods := make(map[string]bool, len(attachments))
			for v := range attachments {
				if _string.Contains(v, "$$$") {
					attachmods[file.ClassFront+_string.ReplaceAll(v, "$$$", "$")] = true
				} else {
					attachmods[file.ClassFront+"$/"+v] = true
				}
			}
			attachments = attachmods
		}

		exportAttachStyle := _css.NewBlock(8, 2)
		nativeAttachStyle := _css.NewBlock(8, 2)
		if raw.Elid == _config.Root.CustomTags["style"] {
			nativeAttachResult, exportAttachResult := lodashstyle_process(raw.Innertext, file, true,
				_fmt.Sprint(raw.Scope, ":ATTACHMENT : ", file.FilePath, ":", raw.Range.Start.Row, ":", raw.Range.Start.Col, " | "),
				raw.SymClasses[0],
			)

			_map.Copy(attachments, nativeAttachResult.Attachments)
			variables.Copy(nativeAttachResult.Variables)
			nativeAttachStyle = nativeAttachResult.Result

			_map.Copy(attachments, exportAttachResult.Attachments)
			variables.Copy(exportAttachResult.Variables)
			exportAttachStyle = exportAttachResult.Result
		}

		exportStaple := ""
		nativeStaple := ""
		if raw.Elid == _config.Root.CustomTags["staple"] {
			stripped := _util.Code_Strip(raw.Innertext, false, false, false, true)
			exportStaple = _string.ReplaceAll(stripped, Lodash_tag, Lodash_tag+file.Label)
			nativeStaple = _string.ReplaceAll(stripped, Lodash_tag, file.Label)
		}

		summon := ""
		attributes := map[string]string{}
		if raw.Elid == _config.Root.CustomTags["summon"] {
			summon = _util.Code_Strip(raw.Innertext, false, false, true, true)
			attributes = raw.Attributes
		}

		comments := raw.Comments
		if len(comments) == 0 {
			comments = nil
		}
		vars := variables.ToMap()
		if len(vars) == 0 {
			vars = nil
		}
		metadata := &_model.Style_Metadata{
			Info:          comments,
			Skeleton:      nativeRawStyle.Skeleton(),
			Declarations:  []string{declaration},
			Variables:     vars,
			SummonSnippet: summon,
		}

		classdata := &_model.Style_ClassData{
			Attributes:        attributes,
			Index:             0,
			Artifact:          artifact,
			Definent:          raw.SymClasses[0],
			SymClass:          symclass,
			Metadata:          metadata,
			DebugRapidClass:   debugRapidClass,
			DebugFinalClass:   debugRapidClass + "_Final",
			Attachments:       attachments,
			ExportStaple:      exportStaple,
			NativeStaple:      nativeStaple,
			ExportRawStyle:    exportRawStyle,
			NativeRawStyle:    nativeRawStyle,
			ExportAttachStyle: exportAttachStyle,
			NativeAttachStyle: nativeAttachStyle,
			Range:             &raw.Range,
		}
		index = _action.Index_Declare(&_model.Cache_SymclassData{
			Context: file,
			SrcData: classdata,
		})
		classhash := _util.String_EnCounter(index)
		classdata.RapidClass = RapidClassPrefix + classhash
		classdata.FinalClass = FinalClassPrefix + classhash

		file.Style.UsedIn = append(file.Style.UsedIn, index)
	}

	return R_Rawtag_Upload{
		Symclass:    symclass,
		Index:       index,
		Attachments: attachments,
		Diagnostics: diagnostics,
		Errors:      errors,
	}
}

type R_Rawtag_Upload struct {
	Symclass    string
	Index       int
	Attachments map[string]bool
	Diagnostics []*_model.File_Diagnostic
	Errors      []string
}

var RapidClassPrefix = "_"
var FinalClassPrefix = "___"
