package utils

import (
	_json "encoding/json"
	_string "strings"
)

func Code_Uncomment(content string, single, multi, html bool) string {
	var result _string.Builder

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
			for i+1 < len(content) && (content[i] != '*' || content[i+1] != '/') {
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

func Code_StripWhitespace(s string) string {
	var out []rune
	insideQuote := false
	quoteChar := rune(0)
	lastWasSpace := false
	for _, r := range s {
		if r == '"' || r == '\'' || r == '`' {
			if insideQuote && r == quoteChar {
				insideQuote = false
			} else if !insideQuote {
				insideQuote = true
				quoteChar = r
			}
			out = append(out, r)
			lastWasSpace = false
			continue
		}
		if !insideQuote && (r == ' ' || r == '\t' || r == '\n' || r == '\r') {
			if !lastWasSpace {
				out = append(out, ' ')
				lastWasSpace = true
			}
			continue
		}
		out = append(out, r)
		lastWasSpace = false
	}
	return string(out)
}

func Code_Minify(content string) string {
	out := make([]rune, 0, len(content))
	var prev rune
	symbols := map[rune]struct{}{
		'{': {}, '}': {}, ':': {}, ';': {}, ',': {},
	}
	for _, r := range content {
		if _, isSym := symbols[r]; isSym {
			if len(out) > 0 && out[len(out)-1] == ' ' {
				out = out[:len(out)-1]
			}
			out = append(out, r)
			prev = r
			continue
		}
		if r != ' ' || prev != ' ' {
			out = append(out, r)
		}
		prev = r
	}
	return _string.TrimSpace(string(out))
}

func Code_Strip(content string, single, multi, html, minify bool) string {
	if single || multi || html {
		content = Code_Uncomment(content, single, multi, html)
	}
	if minify {
		return Code_StripWhitespace(Code_Minify(content))
	} else {
		return content
	}
}

func Code_JsonBuild(obj any, gap string) string {
	if gap == "" {
		b, _ := _json.Marshal(obj)
		return string(b)
	} else {
		b, _ := _json.MarshalIndent(obj, "", "  ")
		return string(b)
	}
}

func Code_JsonParse[T any](str string) (T, error) {
	var out T
	clean := Code_Uncomment(str, true, true, false)
	err := _json.Unmarshal([]byte(clean), &out)
	return out, err
}
