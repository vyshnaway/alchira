package style

import (
	_config "main/configs"
	X "main/internal/console"
	_model "main/models"
	O "main/package/object"
	_util "main/package/utils"
	_regexp "regexp"
	_slice "slices"
	"sort"
	_string "strings"
)

func Hashrule_Upload() {
	_config.Style.Hashrules = _config.Saved.Hashrule
	hashrule := _config.Saved.Hashrule
	errors := []string{}
	diagnostics := []*_model.File_Diagnostic{}

	for key := range hashrule {
		var hash = "#{" + key + "}"
		response := Hashrule_Import(hash, _config.Path_Json["hashrule"].Path)
		if response.Status {
			hashrule[key] = response.Result
		} else {
			delete(hashrule, key)
			errors = append(errors, response.Errorstring)
			diagnostics = append(diagnostics, &response.Diagnostic)
		}
	}

	filtered := map[string]string{}
	printmap := O.New[string, string](len(_config.Saved.Hashrule))
	for k, v := range hashrule {
		if len(k) > 0 && k[0] != '-' {
			filtered[k] = v
			printmap.Set(k, v)
		}
	}
	printmap.Sort(func(s []string) []string {
		temp := printmap.Keys()
		sort.Strings(temp)
		return temp
	})

	_config.Delta.Error.Hashrules = errors
	_config.Delta.Diagnostic.Hashrules = diagnostics
	_config.Style.Hashrules = filtered
	_config.Delta.Report.Hashrule = X.List_Record("Active Hashrule", printmap)
}

type hashrule_Import_return struct {
	Status      bool
	Result      string
	Errorstring string
	Diagnostic  _model.File_Diagnostic
}

var hashpattern = _regexp.MustCompile(`(?i)#\{[a-z0-9-]+\}`)

func Hashrule_Import(str string, src string) hashrule_Import_return {
	primitive := str
	recursionSequence := make([]string, 0, len(_config.Style.Hashrules))
	preview := O.New[string, string](4)

	var response = func(
		result string,
		cause string,
		message string,
	) hashrule_Import_return {
		hashrule_Error_return := X.Error_Hashrule(
			primitive,
			cause,
			src,
			message,
			preview,
		)

		return hashrule_Import_return{
			Status:      len(message) == 0,
			Result:      result,
			Errorstring: hashrule_Error_return.Errorstring,
			Diagnostic:  hashrule_Error_return.Diagnostic,
		}
	}

	for {
		loc := hashpattern.FindStringIndex(str)
		if loc == nil {
			break
		}
		match := str[loc[0]:loc[1]]
		key := match[2 : len(match)-1]
		replacement, found := _config.Style.Hashrules[key]
		if !found {
			replacement = match
		}
		preview.Set("FROM "+match, "GETS "+replacement+" FROM "+str)

		if !found {
			return response("", match, "Undefined Hashrule.")
		}
		if _slice.Contains(recursionSequence, match) {
			return response("", match, "Hashrule recursion loop.")
		}

		str = hashpattern.ReplaceAllString(str, replacement)
		recursionSequence = append(recursionSequence, match)
	}

	return response(str, "", "")
}

type hashrule_Render_return struct {
	Wrappers    []string
	Status      bool
	Errorstring string
	Diagnostic  _model.File_Diagnostic
}

var regex_max_width = _regexp.MustCompile(`width\s*<=`)
var regex_min_width = _regexp.MustCompile(`width\s*>=`)
var regex_min_height = _regexp.MustCompile(`height\s*>=`)
var regex_max_height = _regexp.MustCompile(`height\s*<=`)

func Hashrule_Render(str string, src string) hashrule_Render_return {
	extended := Hashrule_Import(str, src)
	snippets := _util.String_ZeroBreaks(extended.Result, []rune{'&'})
	wrappers := []string{}

	for _, snippet := range snippets {
		var wrapper _string.Builder

		snippet = _string.TrimSpace(snippet)
		length := len(snippet)
		deviance := 0
		splAtrule := false
		holdAtRune := false

		for i := range length {
			ch := rune(snippet[i])
			if ch == ')' || ch == '}' || ch == ']' {
				deviance--
			}

			if deviance > 0 {
				wrapper.WriteRune(ch)
			} else {
				switch ch {
				case '{':
				case '}':
				case '@':
					if wrapper.Len() > 0 {
						wrapper.WriteRune(' ')
						splAtrule = true
					}
					holdAtRune = true
				default:
					wrapper.WriteRune(ch)
				}
			}
			if ch == '(' || ch == '{' || ch == '[' {
				deviance++
			}
		}

		if wrapper.Len() > 0 {
			wrapped := wrapper.String()
			if holdAtRune {
				wrapped = "@" + wrapped
			}
			if splAtrule {
				wrapped = regex_max_width.ReplaceAllString(wrapped, "max-width:")
				wrapped = regex_min_width.ReplaceAllString(wrapped, "min-width:")
				wrapped = regex_min_height.ReplaceAllString(wrapped, "min-height:")
				wrapped = regex_max_height.ReplaceAllString(wrapped, "max-height:")
			}
			wrapped = _util.String_Minify(wrapped)
			wrappers = append(wrappers, wrapped)
		}
	}

	return hashrule_Render_return{
		Wrappers:    wrappers,
		Status:      extended.Status,
		Errorstring: extended.Errorstring,
		Diagnostic:  extended.Diagnostic,
	}
}
