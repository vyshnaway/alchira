package utils

import (
	_regexp_ "regexp"
	_strings_ "strings"
	_json_ "encoding/json"
)

func code_IsInString(input string, index int) bool {
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

func Code_Uncomment(content string, single, multi, html bool) string {
	var result _strings_.Builder
	i := 0
	for i < len(content) {
		char := content[i]

		// Single-line (//)
		if single && char == '/' && i+1 < len(content) && content[i+1] == '/' && !code_IsInString(content, i) {
			i += 2
			for i < len(content) && content[i] != '\n' {
				i++
			}
			continue
		}

		// Multi-line (/* */)
		if multi && char == '/' && i+1 < len(content) && content[i+1] == '*' && !code_IsInString(content, i) {
			i += 2
			for i+1 < len(content) && !(content[i] == '*' && content[i+1] == '/') {
				i++
			}
			i += 2 // Skip '*/'
			continue
		}

		// HTML comments (<!-- -->)
		if html && char == '<' && i+3 < len(content) && content[i:i+4] == "<!--" && !code_IsInString(content, i) {
			i += 4
			for i+2 < len(content) && content[i:i+3] != "-->" {
				i++
			}
			i += 3 // Skip '-->'
			continue
		}

		result.WriteByte(char)
		i++
	}
	return result.String()
}


// Example: very basic spacings
var code_Minify_Regex = _regexp_.MustCompile(`\s*([{}:;,])\s*`)

func Code_Minify(content string) string {
	out := code_Minify_Regex.ReplaceAllString(content, "$1")
	return _strings_.TrimSpace(out)
}

func Code_JsonBuild(obj any) string {
	b, _ := _json_.MarshalIndent(obj, "", "    ")
	return string(b)
}

func Code_JsonParse(str string) (map[string]any, error) {
	clean := Code_Uncomment(str, true, true, true)
	var m map[string]any
	err := _json_.Unmarshal([]byte(clean), &m)
	return m, err
}