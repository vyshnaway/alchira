package style

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	_model "main/models"
	_css "main/package/css"
	_util "main/package/utils"
	_regexp "regexp"
	_strconv "strconv"
	_string "strings"
)

var lodash_rune = string(_config.Root.CustomOps["lodash"])
var regex_symzero = _regexp.MustCompile(`^[-_]\$`)
var regex_lodash = _regexp.MustCompile(`\.` + lodash_rune)

var lodash_tag = "<!--" + string(_config.Root.CustomOps["lodash"]) + "-->"

func rawtag_stylePreprocess(
	content string,
	file *_model.File_Stash,
	export0_native1 bool,
) string {
	if !export0_native1 {
		return _string.ReplaceAll(content, lodash_tag, file.Label)
	}
	return _util.Code_Uncomment(content, true, true, false)
}

func Rawtag_Upload(
	raw *_script.T_RawStyle,
	file *_model.File_Stash,
	IndexMap _model.Style_ClassIndexMap,
	metadata_map _model.File_SymclassIndexMap,
) rawtag_Upload_return {
	errors := []string{}
	diagnostics := []_model.File_Diagnostic{}
	attachments := []string{}
	forArtifact := file.Manifest.Lookup.Type == _model.File_Type_Artifact
	declaration := file.TargetPath + ":" + _strconv.Itoa(raw.RowIndex) + ":" + _strconv.Itoa(raw.ColIndex)

	symzero := ""
	if len(raw.SymClasses) > 0 {
		symzero = regex_symzero.ReplaceAllString(raw.SymClasses[0], "$")
	}
	var normalsymclass string
	symclass := file.ClassFront
	if forArtifact {
		symclass += _string.ReplaceAll(symzero, "$$$", "$")
		normalsymclass = _util.String_Filter(symclass, []rune{}, []rune{}, []rune{'$', '/'})
	} else {
		symclass += string(symzero)
		normalsymclass = _util.String_Filter(symclass, []rune{}, []rune{}, []rune{'$'})
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
		debugclass := _fmt.Sprint(scope, file.DebugFront, "\\:", raw.RowIndex, "\\:", raw.ColIndex, "_", normalsymclass)

		native_scanned := Parse_CssSnippet(
			rawtag_stylePreprocess(raw.Styles[""], file, true),
			_fmt.Sprint(raw.Scope, " : ", declaration, " | "),
			_fmt.Sprint(raw.SymClasses[0]),
			false,
		)

		export_scanned := Parse_CssSnippet(
			rawtag_stylePreprocess(raw.Styles[""], file, false),
			_fmt.Sprint(raw.Scope, " : ", declaration, " | "),
			_fmt.Sprint(raw.SymClasses[0]),
			false,
		)

		native_object := native_scanned.Result
		export_object := export_scanned.Result

		attachments := append(attachments, native_scanned.Attachments...)
		variables := native_scanned.Variables
		for key, val := range raw.Styles {
			if key != "" {
				query := Hashrule_Render(key, declaration)
				if query.Status {
					substylescanned := Parse_CssSnippet(
						rawtag_stylePreprocess(val, file, true),
						_fmt.Sprint(raw.Scope, " : ", declaration, " | "),
						_fmt.Sprint(raw.SymClasses[0], " // ", key),
						true,
					)
					attachments = append(attachments, substylescanned.Attachments...)
					variables.Copy(substylescanned.Variables)
					if substylescanned.Result.Len() > 0 {
						wrapperjson := _util.Code_JsonBuild(query.Wrappers, "")
						if !forArtifact && regex_lodash.MatchString(wrapperjson) {
							wrapperjson = " " + regex_lodash.ReplaceAllString(wrapperjson, "."+file.Label)
							_fmt.Println(wrapperjson)
						}
						native_object.SetBlock(wrapperjson, substylescanned.Result)
					}
				} else {
					errors = append(errors, query.Errorstring)
					diagnostics = append(diagnostics, query.Diagnostic)
				}
			}
		}

		inner_style := Parse_CssSnippet(
			rawtag_stylePreprocess(raw.Innertext, file, true),
			_fmt.Sprint(raw.Scope, ":ATTACHMENT : ", file.FilePath, ":", raw.RowIndex, ":", raw.ColIndex, " | "),
			raw.SymClasses[0],
			true,
		)

		attachments = append(attachments, inner_style.Attachments...)
		variables.Copy(inner_style.Variables)

		artifact := _config.Archive.Name
		if forArtifact {
			artifact = file.Artifact
			for i, v := range attachments {
				if _string.Contains(v, "$$$") {
					attachments[i] = file.ClassFront + _string.ReplaceAll(v, "$$$", "$")
				} else {
					attachments[i] = file.ClassFront + "$/" + v
				}
			}
		}

		summon := ""
		attributes := map[string]string{}
		if raw.Elid == _config.Root.CustomTags["summon"] {
			summon = _util.Code_Strip(raw.Innertext, false, false, true, true)
			attributes = raw.Attributes
		}

		staple := ""
		if raw.Elid == _config.Root.CustomTags["staple"] {
			staple = _util.Code_Strip(raw.Innertext, false, false, true, true)
		}

		metadata := _model.Style_Metadata{
			Info:          raw.Comments,
			Skeleton:      native_object.Skeleton(),
			Declarations:  []string{declaration},
			Variables:     variables.ToMap(),
			SummonSnippet: summon,
		}

		stylesnippet := _css.NewBlock()
		if ok, val := inner_style.Result.GetBlock("[]"); ok {
			stylesnippet = val
		}

		index = _action.Index_Declare(&_model.Cache_SymclassData{
			Context: file,
			SrcData: &_model.Style_ClassData{
				Attributes:        attributes,
				Index:             0,
				Artifact:          artifact,
				Definent:          raw.SymClasses[0],
				SymClass:          symclass,
				NativeRawStyle:    native_object,
				ExportRawStyle:    export_object,
				Metadata:          &metadata,
				Attachments:       attachments,
				DebugClass:        debugclass,
				NativeStaple:      staple,
				NativeAttachStyle: stylesnippet,
			},
		})
		IndexMap[symclass] = index
		file.StyleData.UsedIn = append(file.StyleData.UsedIn, index)
		metadata_map[symclass] = index
	}

	return rawtag_Upload_return{
		Symclass:    symclass,
		Index:       index,
		Attachments: attachments,
		Diagnostics: diagnostics,
		Errors:      errors,
	}
}

type rawtag_Upload_return struct {
	Symclass    string
	Index       int
	Attachments []string
	Diagnostics []_model.File_Diagnostic
	Errors      []string
}
