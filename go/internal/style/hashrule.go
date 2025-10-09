package style

import (
	_config "main/configs"
	X "main/internal/shell"
	_model "main/models"
	_util "main/package/utils"
	_regexp "regexp"
	_slice "slices"
	_string "strings"
)

func Hashrule_Upload() {
	_config.Style.Hashrules = _config.Static.Hashrule
	hashrule := _config.Static.Hashrule
	errors := make([]string, len(hashrule))

	for key := range hashrule {
		var hash = "#{" + key + "}"
		response := Hashrule_Import(hash, _config.Path_Json["hashrule"].Path)
		if response.Status {
			hashrule[key] = response.Result
		} else {
			hashrule[key] = ""
			errors = append(errors, response.Errorstring)
		}
	}

	_config.Style.Hashrules = hashrule
	_config.Manifest.Hashrules = hashrule
	_config.Delta.Report.Hashrule = X.Hashrule_Report(hashrule, errors)
}

type hashrule_Import_return struct {
	Status      bool
	Result      string
	Errorstring string
	Diagnostic  _model.Refer_Diagnostic
}

func Hashrule_Import(str string, src string) hashrule_Import_return {
	primitive := str
	recursionSequence := make([]string, 0, len(_config.Style.Hashrules))
	preview := make(map[string]string, len(_config.Style.Hashrules))

	var response = func(
		result string,
		cause string,
		message string,
	) hashrule_Import_return {
		hashrule_Error_return := X.Hashrule_Error(
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

	var hashpattern = _regexp.MustCompile(`(?i)#\{[a-z0-9-]+\}`)
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
		preview["FROM "+match] = "GETS " + replacement + " FROM " + str

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
	Diagnostic  _model.Refer_Diagnostic
}

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
				wrapped = _regexp.MustCompile(`width\s*>=`).ReplaceAllString(wrapped, "min-width:")
				wrapped = _regexp.MustCompile(`width\s*<=`).ReplaceAllString(wrapped, "max-width:")
				wrapped = _regexp.MustCompile(`height\s*>=`).ReplaceAllString(wrapped, "min-height:")
				wrapped = _regexp.MustCompile(`height\s*<=`).ReplaceAllString(wrapped, "max-height:")
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
