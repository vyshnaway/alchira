package utils

import (
	_json "encoding/json"
	"strings"
)

func Code_Uncomment(content string, single, multi, html bool) string {
	var result strings.Builder

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

func Code_Minify(content string) string {
	var builder strings.Builder
	symbols := map[rune]struct{}{
		'{': {}, '}': {}, ':': {}, ';': {}, ',': {},
	}

	var prevSpace bool

	for _, r := range content {
		_, isSym := symbols[r]

		if isSym {
			if builder.Len() > 0 && prevSpace {
				// Remove the previous space before symbol
				s := builder.String()
				builder.Reset()
				builder.WriteString(strings.TrimRight(s, " "))
			}
			builder.WriteRune(r)
			prevSpace = false
			continue
		}

		if r == ' ' {
			if !prevSpace {
				builder.WriteRune(' ')
				prevSpace = true
			}
			// skip if previous was space (collapse spaces)
		} else {
			builder.WriteRune(r)
			prevSpace = false
		}
	}

	return builder.String()
}

func Code_StripWhitespace(s string) string {
	var out strings.Builder
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
			out.WriteRune(r)
			lastWasSpace = false
			continue
		}
		if !insideQuote && (r == ' ' || r == '\t' || r == '\n' || r == '\r') {
			if !lastWasSpace {
				out.WriteRune(' ')
				lastWasSpace = true
			}
			continue
		}
		out.WriteRune(r)
		lastWasSpace = false
	}
	return out.String()
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

func Code_JsoncBuild(obj any, gap string) (string, error) {
	if gap == "" {
		s, e := _json.Marshal(obj)
		return string(s), e
	} else {
		s, e := _json.MarshalIndent(obj, "", "  ")
		return string(s), e
	}
}

func Code_JsoncParse[T any](str string) (T, error) {
	var out T
	clean := Code_Uncomment(str, true, true, false)
	err := _json.Unmarshal([]byte(clean), &out)
	return out, err
}
