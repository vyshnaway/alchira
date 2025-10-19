package style

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_script "main/internal/script"
	_model "main/models"
	"main/package/console"
	"main/package/css"
	_util "main/package/utils"
	_regexp "regexp"
	_strconv "strconv"
	_string "strings"
)

var regex_symzero = _regexp.MustCompile(`^-\$`)
var regex_locale = _regexp.MustCompile(`\.(.*?)` + string(_config.Root.CustomOperations["locale"]))

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

		stylescanned := Parse_CssSnippet(
			_util.Code_Uncomment(raw.Styles[""], true, true, false),
			_fmt.Sprint(raw.Scope, " : ", declaration, " | "),
			_fmt.Sprint(raw.SymClasses[0]),
			false,
		)

		object := stylescanned.Result

		attachments := append(attachments, stylescanned.Attachments...)
		variables := stylescanned.Variables
		for key, val := range raw.Styles {
			if key != "" {
				query := Hashrule_Render(key, declaration)
				if query.Status {
					substylescanned := Parse_CssSnippet(
						_util.Code_Uncomment(val, true, true, false),
						_fmt.Sprint(raw.Scope, " : ", declaration, " | "),
						_fmt.Sprint(raw.SymClasses[0], " // ", key),
						true,
					)
					attachments = append(attachments, substylescanned.Attachments...)
					variables.Copy(substylescanned.Variables)
					if substylescanned.Result.Len() > 0 {
						wrapperjson := _util.Code_JsonBuild(query.Wrappers, "")
						if !forArtifact && regex_locale.MatchString(wrapperjson) {
							wrapperjson = " " + regex_locale.ReplaceAllString(wrapperjson, "._"+file.Label+"_")
						}
						object.SetBlock(wrapperjson, substylescanned.Result)
					}
				} else {
					errors = append(errors, query.Errorstring)
					diagnostics = append(diagnostics, query.Diagnostic)
				}
			}
		}

		inner_style := Parse_CssSnippet(
			_util.Code_Uncomment(raw.Innertext, true, true, false),
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
			Skeleton:      object.Skeleton(),
			Declarations:  []string{declaration},
			Variables:     variables.ToMap(),
			SummonSnippet: summon,
		}

		stylesnippet := css.NewBlock()
		if ok, val := inner_style.Result.GetBlock("[]"); ok {
			stylesnippet = val
		}

		index = _action.Index_Declare(&_model.Cache_SymclassData{
			Context: file,
			SrcData: &_model.Style_ClassData{
				Attributes:            attributes,
				Index:                 0,
				Artifact:              artifact,
				Definent:              raw.SymClasses[0],
				SymClass:              symclass,
				NativeStyle:           object,
				Metadata:              &metadata,
				Attachments:           attachments,
				DebugClass:            debugclass,
				BlueprintDeclarations: []string{declaration},
				StapleSnippet:         staple,
				StyleSnippet:          stylesnippet,
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
