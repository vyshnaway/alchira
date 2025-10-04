package style

import (
	_json_ "encoding/json"
	_fmt_ "fmt"
	_cache_ "main/cache"
	_types_ "main/types"
	_utils_ "main/utils"
	_maps_ "maps"
	_regexp_ "regexp"
	_strconv_ "strconv"
	"strings"
)

func Rawtag_Upload(
	raw *_types_.Script_RawStyle,
	file *_types_.File_Stash,
	IndexMap *_types_.Style_ClassIndexMap,
	verbose bool,
) rawtag_Upload_return {
	errors := []string{}
	diagnostics := []_types_.Refer_Diagnostic{}
	attachments := []string{}
	forArtifact := file.Manifest.Lookup.Type == _types_.File_Type_Artifact
	declaration := file.TargetPath + ":" + _strconv_.Itoa(raw.RowIndex) + ":" + _strconv_.Itoa(raw.ColIndex)

	re := _regexp_.MustCompile(`^-\$`)
	symzero := ""
	if len(raw.SymClasses) > 0 {
		symzero = re.ReplaceAllString(raw.SymClasses[0], "$")
	}
	var normalsymclass string
	symclass := file.ClassFront
	if forArtifact {
		symclass += strings.ReplaceAll(symzero, "$$$", "$")
		normalsymclass = _utils_.String_Filter(symclass, []rune{}, []rune{}, []rune{'$', '/'})
	} else {
		symclass += string(symzero)
		normalsymclass = _utils_.String_Filter(symclass, []rune{}, []rune{}, []rune{'$'})
	}

	found := _cache_.Index_Find(symclass, *IndexMap)
	index := found.Index
	if found.Group != _types_.Style_Type_Null {
		classdata := _cache_.Index_Fetch(found.Index)
		classdata.Metadata.Declarations = append(classdata.Metadata.Declarations, declaration)
	} else {
		var scope _types_.Style_Type
		if raw.Scope == _types_.Style_Type_Artifact {
			scope = _types_.Style_Type_Null
		} else {
			scope = raw.Scope
		}
		debugclass := _fmt_.Sprint(scope, file.DebugFront, "\\:", raw.RowIndex, "\\:", raw.ColIndex, "_", normalsymclass)

		stylescanned := parse_CssSnippet(
			_utils_.Code_Uncomment(raw.Styles[""], true, true, false),
			_fmt_.Sprint(raw.Scope, " : ", file.FilePath, " |"),
			_fmt_.Sprint(raw.SymClasses),
			false,
			verbose,
		)

		object := map[string]any{}
		for k, v := range stylescanned.Result {
			v_typed, v_ok := v.(map[string]any)
			if v_ok {
				object[k] = v_typed
			} else {
				object[""] = stylescanned.Result
			}
		}

		attachments := append(attachments, stylescanned.Attachments...)
		variables := stylescanned.Variables
		for key, val := range raw.Styles {
			if key != "" {
				query := Hashrule_Render(key, declaration)
				if query.Status {
					stylescanned = parse_CssSnippet(
						_utils_.Code_Uncomment(val, true, true, false),
						_fmt_.Sprint(raw.Scope, " : ", file.FilePath, " |"),
						_fmt_.Sprint(raw.SymClasses, " => ", key),
						true,
						verbose,
					)
					attachments = append(attachments, stylescanned.Attachments...)
					_maps_.Copy(variables, stylescanned.Variables)
					if len(stylescanned.Result) > 0 {
						res, err := _json_.Marshal(query.Wrappers)
						if err == nil {
							res_typed := string(res)
							re := _regexp_.MustCompile(`.()` + string(_cache_.Root.CustomOperations["locale"]))
							if !forArtifact {
								re.ReplaceAllString(res_typed, _fmt_.Sprintf("_%s_$1", file.Label))
							} // Untested
							object[res_typed] = stylescanned.Result
						}
					}
				} else {
					errors = append(errors, query.Errorstring)
					diagnostics = append(diagnostics, query.Diagnostic)
				}
			}
		}

		inner_style := parse_CssSnippet(
			_utils_.Code_Uncomment(raw.Innertext, true, true, false),
			_fmt_.Sprint(raw.Scope, ":ATTACHMENT : ", file.FilePath, ":", raw.RowIndex, ":", raw.ColIndex, " |"),
			raw.SymClasses[0],
			true,
			verbose,
		)

		attachments = append(attachments, inner_style.Attachments...)
		_maps_.Copy(variables, inner_style.Variables)

		artifact := _cache_.Archive.Name
		if forArtifact {
			artifact = file.Artifact
			for i, v := range attachments {
				if strings.Contains(v, "$$$") {
					attachments[i] = file.ClassFront + strings.ReplaceAll(v, "$$$", "$")
				} else {
					attachments[i] = file.ClassFront + "$/" + v
				}
			}
		}

		summon := ""
		attributes := map[string]string{}
		if raw.Elid == _cache_.Root.CustomElements["summon"] {
			summon = raw.Innertext
			attributes = raw.Attributes
		}

		staple := ""
		if raw.Elid == _cache_.Root.CustomElements["staple"] {
			staple = raw.Innertext
		}

		skeleton :=_utils_.Map_Skeleton(object)

		index = _cache_.Index_Declare(_types_.Style_ClassData{
			Index:       0,
			Artifact:    artifact,
			Definent:    raw.SymClasses[0],
			SymClass:    symclass,
			StyleObject: object,
			Metadata: _types_.Style_Metadata{
				Info:         raw.Comments,
				WatchClass:   "",
				Variables:    variables,
				Skeleton:     skeleton,
				Declarations: []string{declaration},
				Summon:       summon,
				Attributes:   attributes,
			},
			Attachments:   attachments,
			DebugClass:    debugclass,
			Declarations:  []string{declaration},
			SnippetStaple: staple,
			SnippetStyle:  inner_style.Result,
		})
		// IndexMap[symclass] = index;
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
	Diagnostics []_types_.Refer_Diagnostic
	Errors      []string
}
