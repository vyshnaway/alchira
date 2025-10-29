package style

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	_model "main/models"
	_css "main/package/css"
	_util "main/package/utils"
	_map "maps"
	_regexp "regexp"
	_strconv "strconv"
	_string "strings"
)

var lodash_tag = "<!--" + lodash_rune + "-->"
var lodash_rune = string(_config.Root.CustomOps["lodash"])
var lodash_regex = _regexp.MustCompile(`\.` + lodash_rune)
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
	native := _string.ReplaceAll(content, lodash_tag, file.Label)
	nativeAttachResult := Parse_CssSnippet(
		_util.Code_Uncomment(native, true, true, false),
		selector, initial, flatten,
	)

	exportAttachResult := nativeAttachResult
	if _config.Static.EXPORT {
		export := _string.ReplaceAll(content, lodash_tag, lodash_tag+file.Label)
		exportAttachResult = Parse_CssSnippet(
			_util.Code_Uncomment(export, true, true, false),
			selector, initial, flatten,
		)
	}

	return nativeAttachResult, exportAttachResult
}

func Rawtag_Upload(
	raw *_script.T_RawStyle,
	file *_model.File_Stash,
	IndexMap _model.Style_ClassIndexMap,
) R_Rawtag_Upload {
	errors := make([]string, 0, 4)
	diagnostics := make([]*_model.File_Diagnostic, 0, 4)
	attachments := make(map[string]bool, 12)
	forArtifact := file.Lookup.Type == _model.File_Type_Artifact
	declaration := file.TargetPath + ":" + _strconv.Itoa(raw.RowIndex) + ":" + _strconv.Itoa(raw.ColIndex)

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

	found := _action.Index_Find(symclass, IndexMap)
	index := found.Index
	if found.Group != _model.Style_Type_Null {
		classdata := _action.Index_Fetch(found.Index)
		classdata.SrcData.Metadata.Declarations = append(classdata.SrcData.Metadata.Declarations, declaration)
	} else {
		var scope _model.Style_Type
		if raw.Scope == _model.Style_Type_Artifact {
			scope = _model.Style_Type_Null
		} else {
			scope = raw.Scope
		}
		debugclass := _fmt.Sprint(scope, file.DebugFront, "\\:", raw.RowIndex, "\\:", raw.ColIndex, "_", normalized_symclass)

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
							if !forArtifact && lodash_regex.MatchString(wrapperjson) {
								wrapperjson = " " + lodash_regex.ReplaceAllString(wrapperjson, "."+file.Label)
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
				_fmt.Sprint(raw.Scope, ":ATTACHMENT : ", file.FilePath, ":", raw.RowIndex, ":", raw.ColIndex, " | "),
				raw.SymClasses[0],
			)

			_map.Copy(attachments, nativeAttachResult.Attachments)
			variables.Copy(nativeAttachResult.Variables)
			if i, val := nativeAttachResult.Result.GetBlock("[]"); i > -1 {
				nativeAttachStyle = val
			}

			_map.Copy(attachments, exportAttachResult.Attachments)
			variables.Copy(exportAttachResult.Variables)
			if i, val := exportAttachResult.Result.GetBlock("[]"); i > -1 {
				exportAttachStyle = val
			}
		}

		exportStaple := ""
		nativeStaple := ""
		if raw.Elid == _config.Root.CustomTags["staple"] {
			stripped := _util.Code_Strip(raw.Innertext, false, false, false, true)
			exportStaple = _string.ReplaceAll(stripped, lodash_tag, lodash_tag+file.Label)
			nativeStaple = _string.ReplaceAll(stripped, lodash_tag, file.Label)
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

		index = _action.Index_Declare(&_model.Cache_SymclassData{
			Context: file,
			SrcData: &_model.Style_ClassData{
				Attributes:        attributes,
				Index:             0,
				Artifact:          artifact,
				Definent:          raw.SymClasses[0],
				SymClass:          symclass,
				Metadata:          metadata,
				Attachments:       attachments,
				DebugClass:        debugclass,
				ExportStaple:      exportStaple,
				NativeStaple:      nativeStaple,
				ExportRawStyle:    exportRawStyle,
				NativeRawStyle:    nativeRawStyle,
				ExportAttachStyle: exportAttachStyle,
				NativeAttachStyle: nativeAttachStyle,
			},
		})

		file.StyleData.UsedIn = append(file.StyleData.UsedIn, index)
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
