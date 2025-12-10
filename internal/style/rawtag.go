package style

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"
	_css "main/package/css"
	_util "main/package/utils"
	_map "maps"
	_strconv "strconv"
	_string "strings"
)

type R_Rawtag_Upload struct {
	Symclass    string
	Index       int
	Attachments map[string]bool
	Diagnostics []*_model.File_Diagnostic
	Errors      []string
}

func Rawtag_Upload(
	raw *_model.T_RawStyle,
	file *_model.File_Stash,
	IndexMap _model.Style_ClassIndexMap,
) R_Rawtag_Upload {
	errors := make([]string, 0, 4)
	diagnostics := make([]*_model.File_Diagnostic, 0, 4)
	attachments := make(map[string]bool, 12)
	forArtifact := file.Cache.Type == _model.File_Type_Artifact
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
		normalized_symclass = _util.String_Filter(symclass, []rune{'$', '/'}, []rune{}, []rune{})
	} else {
		symclass += string(symzero)
		normalized_symclass = _util.String_Filter(symclass, []rune{'$'}, []rune{}, []rune{})
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
		debugClass := _fmt.Sprint(scope, file.DebugFront, ":", raw.Range.Start.Row, ":", raw.Range.Start.Col, "_", normalized_symclass)

		native_scanned, export_scanned := stylesnippet_process(raw.Styles[""], file, false,
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
					native_scanned, export_scanned := stylesnippet_process(val, file, true,
						_fmt.Sprint(raw.Scope, " : ", declaration, " | "),
						_fmt.Sprint(raw.SymClasses[0], " // ", key),
					)

					_map.Copy(attachments, native_scanned.Attachments)
					variables.Copy(native_scanned.Variables)

					if native_scanned.Result.Len() > 0 {
						if wrapperjson, err := _util.Code_JsoncBuild(query.Wrappers, ""); err == nil {
							if res := importLodash(file, wrapperjson, file.Label); !forArtifact {
								wrapperjson = res
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
			nativeAttachResult, exportAttachResult := stylesnippet_process(raw.Innertext, file, true,
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
			stripped := _util.Code_Strip(raw.Innertext, false, false, false, false)
			exportStaple = importLodash(file, stripped, Lodash_frag+file.Label)
			nativeStaple = importLodash(file, stripped, file.Label)
		}

		summon := ""
		attributes := map[string]string{}
		if raw.Elid == _config.Root.CustomTags["summon"] {
			summon = stripCustomTags(file, raw.Innertext)
			summon = _util.Code_Strip(summon, false, false, false, false)
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

		index = DeclareClass(file, &_model.Style_ClassData{
			Attributes:        attributes,
			Artifact:          artifact,
			Definent:          raw.SymClasses[0],
			SymClass:          symclass,
			Metadata:          metadata,
			Attachments:       attachments,
			ExportStaple:      exportStaple,
			NativeStaple:      nativeStaple,
			ExportRawStyle:    exportRawStyle,
			NativeRawStyle:    nativeRawStyle,
			ExportAttachStyle: exportAttachStyle,
			NativeAttachStyle: nativeAttachStyle,
			Range:             &raw.Range,
		}, debugClass)

		file.Cache.UsedIn = append(file.Cache.UsedIn, index)
	}

	return R_Rawtag_Upload{
		Symclass:    symclass,
		Index:       index,
		Attachments: attachments,
		Diagnostics: diagnostics,
		Errors:      errors,
	}
}
