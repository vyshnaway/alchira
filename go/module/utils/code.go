package utils

import (
	_json_ "encoding/json"
	_regexp_ "regexp"
	_strings_ "strings"
)

func Code_Uncomment(content string, single, multi, html bool) string {
	var result _strings_.Builder

	isInString := func(input string, index int) bool {
		inSingleQuote, inDoubleQuote, inTemplateLiteral, escaped := false, false, false, false

		for i := 0; i < index && i < len(input); i++ {
			char := input[i]

			if escaped {
				escaped = false
				continue
			}

			if char == '\\' {
				escaped = true
				continue
			}

			if char == '\'' && !inDoubleQuote && !inTemplateLiteral {
				inSingleQuote = !inSingleQuote
			} else if char == '"' && !inSingleQuote && !inTemplateLiteral {
				inDoubleQuote = !inDoubleQuote
			} else if char == '`' && !inSingleQuote && !inDoubleQuote {
				inTemplateLiteral = !inTemplateLiteral
			}
		}
		return inSingleQuote || inDoubleQuote || inTemplateLiteral
	}

	i := 0
	for i < len(content) {
		char := content[i]

		if single && char == '/' && i+1 < len(content) && content[i+1] == '/' && !isInString(content, i) {
			i += 2
			for i < len(content) && content[i] != '\n' {
				i++
			}
			continue
		}

		if multi && char == '/' && i+1 < len(content) && content[i+1] == '*' && !isInString(content, i) {
			i += 2
			for i+1 < len(content) && !(content[i] == '*' && content[i+1] == '/') {
				i++
			}
			i += 2
			continue
		}

		if html && char == '<' && i+3 < len(content) && content[i:i+4] == "<!--" && !isInString(content, i) {
			i += 4
			for i+2 < len(content) && content[i:i+3] != "-->" {
				i++
			}
			i += 3
			continue
		}

		result.WriteByte(char)
		i++
	}
	
	return result.String()
}

func Code_Minify(content string) string {
	var minify_regex = _regexp_.MustCompile(`\s*([{}:;,])\s*`)
	out := minify_regex.ReplaceAllString(content, "$1")
	return _strings_.TrimSpace(out)
}

func Code_Strip(content string, single, multi, html, minify bool) string {
	if single || multi || html {
		content = Code_Uncomment(content, single, multi, html)
	}
	if minify {
		return Code_Minify(content)
	} else {
		return content
	}
}

func Code_JsonBuild(obj any, gap string) string {
	if gap == "" {
		b, _ := _json_.Marshal(obj)
		return string(b)
	} else {
		b, _ := _json_.MarshalIndent(obj, "", "  ")
		return string(b)
	}
}

func Code_JsonParse[T any](str string) (T, error) {
	var out T
	clean := Code_Uncomment(str, true, true, true)
	err := _json_.Unmarshal([]byte(clean), &out)
	return out, err
}
