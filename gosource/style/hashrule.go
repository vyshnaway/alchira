package style

import (
	X "main/xhell"
	_cache_ "main/cache"
	_types_ "main/types"
	_utils_ "main/utils"
	_regexp_ "regexp"
	_slices_ "slices"
	_strings_ "strings"
)

func Hashrule_Upload() {
	_cache_.Class.Hashrule = _cache_.Static.Hashrule
	hashrule := _cache_.Static.Hashrule
	errors := make([]string, len(hashrule))

	for key := range hashrule {
		var hash = "#{" + key + "}"
		response := Hashrule_Import(hash, _cache_.Path["json"]["hashrule"].Path)
		if response.Status {
			hashrule[key] = response.Result
		} else {
			hashrule[key] = ""
			errors = append(errors, response.Errorstring)
		}
	}

	_cache_.Class.Hashrule = hashrule
	_cache_.Manifest.Hashrule = hashrule
	_cache_.Delta.Report.Hashrule = X.Hashrule_Report(hashrule, errors)
}

type tHashrule_Import_return struct {
	Status      bool
	Result      string
	Errorstring string
	Diagnostic  _types_.Support_Diagnostic
}

func Hashrule_Import(rule string, source string) tHashrule_Import_return {
	primitive := rule
	recursionSequence := make([]string, 0, len(_cache_.Class.Hashrule))
	preview := make(map[string]string, len(_cache_.Class.Hashrule))

	var response = func(
		result string,
		cause string,
		message string,
	) tHashrule_Import_return {
		errorstring, diagnostic := X.Hashrule_Error(
			primitive,
			cause,
			source,
			message,
			preview,
		)

		status := len(message) == 0
		return tHashrule_Import_return{
			Status:      status,
			Result:      result,
			Errorstring: errorstring,
			Diagnostic:  diagnostic,
		}
	}

	var hashpattern = _regexp_.MustCompile(`(?i)#\{[a-z0-9-]+\}`)
	for {
		loc := hashpattern.FindStringIndex(rule)
		if loc == nil {
			break
		}
		match := rule[loc[0]:loc[1]]
		key := match[2 : len(match)-1]
		replacement, found := _cache_.Class.Hashrule[key]
		if !found {
			replacement = match
		}
		preview["FROM "+match] = "GETS " + replacement + " FROM " + rule

		if !found {
			return response("", match, "Undefined Hashrule.")
		}
		if _slices_.Contains(recursionSequence, match) {
			return response("", match, "Hashrule recursion loop.")
		}

		rule = hashpattern.ReplaceAllString(rule, replacement)
		recursionSequence = append(recursionSequence, match)
	}

	return response(rule, "", "")
}

type tHashrule_Render_return struct {
	Wrappers    []string
	Status      bool
	Errorstring string
	Diagnostic  _types_.Support_Diagnostic
}

func Hashrule_Render(
	str string,
	src string,
) tHashrule_Render_return {
	const wrapperlimit = 12
	extended := Hashrule_Import(str, src)
	snippets := _utils_.String_ZeroBreaks(extended.Result, []rune{'&'})[:wrapperlimit]
	wrappers := make([]string, 0, wrapperlimit)

	for _, snippet := range snippets {
		var wrapper _strings_.Builder

		snippet = _strings_.TrimSpace(snippet)
		length := len(snippet)
		deviance := 0
		splAtrule := false
		holdAtRune := false

		for i := 0; i < length; i++ {
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
				wrapped = _regexp_.MustCompile(`width\s*>=`).ReplaceAllString(wrapped, "min-width:")
				wrapped = _regexp_.MustCompile(`width\s*<=`).ReplaceAllString(wrapped, "max-width:")
				wrapped = _regexp_.MustCompile(`height\s*>=`).ReplaceAllString(wrapped, "min-height:")
				wrapped = _regexp_.MustCompile(`height\s*<=`).ReplaceAllString(wrapped, "max-height:")
			}
			wrapped = _utils_.String_Minify(wrapped)
			wrappers = append(wrappers, wrapped)
		}
	}

	return tHashrule_Render_return{
		Wrappers:    wrappers,
		Status:      extended.Status,
		Errorstring: extended.Errorstring,
		Diagnostic:  extended.Diagnostic,
	}
}

func Hashrule_Wrapper(parentObject map[string]any, keys []string, childObject any) {
	if len(keys) == 0 {
		return
	}

	activeKey := keys[0]
	keys = keys[1:]

	if len(keys) > 0 {
		sub, ok := parentObject[activeKey]
		if !ok {
			sub = make(map[string]any)
			parentObject[activeKey] = sub
		}

		if m, ok := sub.(map[string]any); ok {
			Hashrule_Wrapper(m, keys, childObject)
		}
	} else {
		parentObject[activeKey] = childObject
	}
}
