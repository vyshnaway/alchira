package utils

import (
	_json "encoding/json"
	"strings"
)

func Code_Uncomment(content string, single, multi, html bool) string {
	var result strings.Builder

	inSingleQuote := false
	inDoubleQuote := false
	inTemplateLiteral := false
	escaped := false

	i := 0
	length := len(content)

	for i < length {
		char := content[i]

		// Handle escaping inside strings
		if escaped {
			result.WriteByte(char)
			escaped = false
			i++
			continue
		}

		if char == '\\' && (inSingleQuote || inDoubleQuote || inTemplateLiteral) {
			escaped = true
			result.WriteByte(char)
			i++
			continue
		}

		// Update string state: enter/exit strings
		if char == '\'' && !inDoubleQuote && !inTemplateLiteral {
			inSingleQuote = !inSingleQuote
			result.WriteByte(char)
			i++
			continue
		}

		if char == '"' && !inSingleQuote && !inTemplateLiteral {
			inDoubleQuote = !inDoubleQuote
			result.WriteByte(char)
			i++
			continue
		}

		if char == '`' && !inSingleQuote && !inDoubleQuote {
			inTemplateLiteral = !inTemplateLiteral
			result.WriteByte(char)
			i++
			continue
		}

		// If inside any string, just copy character
		if inSingleQuote || inDoubleQuote || inTemplateLiteral {
			result.WriteByte(char)
			i++
			continue
		}

		// Outside strings - handle comments

		// Single line comment //
		if single && char == '/' && i+1 < length && content[i+1] == '/' {
			i += 2
			for i < length && content[i] != '\n' {
				i++
			}
			// skip newline char too but keep newline in output to preserve lines
			if i < length && content[i] == '\n' {
				result.WriteByte('\n')
				i++
			}
			continue
		}

		// Multi-line comment /* ... */
		if multi && char == '/' && i+1 < length && content[i+1] == '*' {
			i += 2
			for i+1 < length && !(content[i] == '*' && content[i+1] == '/') {
				i++
			}
			if i+1 < length {
				i += 2 // Skip closing */
			}
			continue
		}

		// HTML Comment <!-- ... -->
		if html && char == '<' && i+3 < length && content[i:i+4] == "<!--" {
			i += 4
			for i+2 < length && content[i:i+3] != "-->" {
				i++
			}
			if i+2 < length {
				i += 3 // Skip closing -->
			}
			continue
		}

		// Normal character outside comments and strings
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
