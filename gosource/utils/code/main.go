package utils

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// isInString checks if a given index in a string is currently inside a string literal.
// It handles single quotes, double quotes, template literals, and escaped characters.
func isInString(input string, index int) bool {
	inSingleQuote := false
	inDoubleQuote := false
	inTemplateLiteral := false
	escaped := false

	// Iterate over runes (Unicode code points) to correctly handle multi-byte characters
	// and get the byte index for slicing.
	for i, r := range input {
		if i >= index {
			break // Stop at the target index
		}

		char := string(r) // Convert rune back to string for comparison

		if escaped {
			escaped = false
			continue
		}

		if char == "\\" {
			escaped = true
			continue
		}

		if char == "'" && !inDoubleQuote && !inTemplateLiteral {
			inSingleQuote = !inSingleQuote
		} else if char == "\"" && !inSingleQuote && !inTemplateLiteral {
			inDoubleQuote = !inDoubleQuote
		} else if char == "`" && !inSingleQuote && !inDoubleQuote {
			inTemplateLiteral = !inTemplateLiteral
		}
	}

	return inSingleQuote || inDoubleQuote || inTemplateLiteral
}

// stripComments removes JavaScript/JSONC-style single-line (//), multi-line (/* */),
// and HTML (<!-- -->) comments from a string, respecting string literals.
func stripComments(content string) string {
	var result strings.Builder
	i := 0
	for i < len(content) {
		char := content[i]

		// Handle single-line comments (//)
		if char == '/' && i+1 < len(content) && content[i+1] == '/' && !isInString(content, i) {
			i += 2
			for i < len(content) && content[i] != '\n' {
				i++
			}
			continue // Skip to the next character after the newline
		}

		// Handle multi-line comments (/* */)
		if char == '/' && i+1 < len(content) && content[i+1] == '*' && !isInString(content, i) {
			i += 2
			for i+1 < len(content) && !(content[i] == '*' && content[i+1] == '/') {
				i++
			}
			i += 2 // Skip '*/'
			continue
		}

		// Handle HTML comments (<!-- -->)
		if char == '<' && i+3 < len(content) && content[i:i+4] == "<!--" && !isInString(content, i) {
			i += 4
			for i+2 < len(content) && content[i:i+3] != "-->" {
				i++
			}
			i += 3 // Skip '-->'
			continue
		}

		// Add character to result and move forward
		result.WriteByte(char)
		i++
	}
	return result.String()
}

// JSONC provides methods for parsing and building JSONC (JSON with comments).
type JSONC struct{}

// Parse parses a JSONC string by first stripping comments and then unmarshaling.
func (j *JSONC) Parse(s string) (interface{}, error) {
	stripped := stripComments(s)
	var data interface{}
	err := json.Unmarshal([]byte(stripped), &data)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JSON after stripping comments: %w", err)
	}
	return data, nil
}

// Build marshals an object into a pretty-printed JSON string.
func (j *JSONC) Build(obj interface{}) (string, error) {
	bytes, err := json.MarshalIndent(obj, "", "    ") // 4 spaces for indent
	if err != nil {
		return "", fmt.Errorf("failed to marshal object to JSON: %w", err)
	}
	return string(bytes), nil
}

// Uncomment provides methods for stripping various types of comments.
type Uncomment struct{}

// Script strips JavaScript/JSONC-style and HTML comments.
func (u *Uncomment) Script(content string) string {
	return stripComments(content)
}

// Css strips CSS multi-line comments and normalizes newlines.
func (u *Uncomment) Css(content string) string {
	// Strip CSS comments /* */
	reComments := regexp.MustCompile(`/\*[\s\S]*?\*/`)
	content = reComments.ReplaceAllString(content, "")

	// Normalize newlines
	reCRLF := regexp.MustCompile(`(\s*\r\n)+`)
	content = reCRLF.ReplaceAllString(content, "\n")
	reLF := regexp.MustCompile(`(\s*\n)+`)
	content = reLF.ReplaceAllString(content, "\n")

	return strings.TrimSpace(content)
}

// Minify provides methods for minifying CSS content.
type Minify struct {
	spacingPattern      *regexp.Regexp
	valueOptimizations  *regexp.Regexp
	rgbToHexPattern     *regexp.Regexp
	hexShortenPattern   *regexp.Regexp // Helper for hex shortening in RGB conversion
	combineUnitsPattern *regexp.Regexp // Helper for combining units
	zeroUnitPattern     *regexp.Regexp // Helper for zero units
}

// NewMinify creates and initializes a new Minify struct with pre-compiled regex patterns.
func NewMinify() *Minify {
	return &Minify{
		// Combined spacing: symbols, selectors, values, !important
		spacingPattern: regexp.MustCompile(`\s*([{}:;,])\s*|\s+([{}])|(:)\s*([^;}]*)\s*([;}])|\s*!important`),
		// Value optimizations: hex, zeros, combined units
		valueOptimizations: regexp.MustCompile(`#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3|(\d+)(px|em|rem|%|vw|vh)\s+(\d+)\5|0(px|em|rem|%|vw|vh)`),
		// RGB to hex (simplified)
		rgbToHexPattern: regexp.MustCompile(`rgb\((\d+),\s*(\d+),\s*(\d+)\)`),
		// Individual patterns for valueOptimizations for easier callback logic
		hexShortenPattern:   regexp.MustCompile(`#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3`),
		combineUnitsPattern: regexp.MustCompile(`(\d+)(px|em|rem|%|vw|vh)\s+(\d+)\5`),
		zeroUnitPattern:     regexp.MustCompile(`0(px|em|rem|%|vw|vh)`),
	}
}

// minifyCssAggressive aggressively minifies CSS content.
func (m *Minify) Strict(content string) string {
	// Step 1: Optimize spacing in one pass
	content = m.spacingPattern.ReplaceAllStringFunc(content, func(match string) string {
		// This callback logic mimics the JS function's behavior
		parts := m.spacingPattern.FindStringSubmatch(match)
		if parts[1] != "" { // sym1: { } : ; ,
			return parts[1]
		}
		if parts[2] != "" { // sym2: { }
			return parts[2]
		}
		if parts[3] != "" { // colon: : value ; end
			return fmt.Sprintf("%s%s%s", parts[3], parts[4], parts[5])
		}
		// If none of the above, it's "!important"
		return "!important"
	})

	// Step 2: Optimize values (hex, units)
	content = m.valueOptimizations.ReplaceAllStringFunc(content, func(match string) string {
		// Check for hex shortening (e.g., #aabbcc -> #abc)
		if submatch := m.hexShortenPattern.FindStringSubmatch(match); len(submatch) > 0 {
			return fmt.Sprintf("#%s%s%s", submatch[1], submatch[2], submatch[3])
		}
		// Check for combining units (e.g., 10px 20px -> 10 20px)
		if submatch := m.combineUnitsPattern.FindStringSubmatch(match); len(submatch) > 0 {
			return fmt.Sprintf("%s %s%s", submatch[1], submatch[3], submatch[2])
		}
		// Check for zero units (e.g., 0px -> 0)
		if m.zeroUnitPattern.MatchString(match) {
			return "0"
		}
		return match // Should not happen if patterns are mutually exclusive and cover all cases
	})

	// Step 3: RGB to hex
	content = m.rgbToHexPattern.ReplaceAllStringFunc(content, func(match string) string {
		parts := m.rgbToHexPattern.FindStringSubmatch(match)
		r, _ := strconv.Atoi(parts[1])
		g, _ := strconv.Atoi(parts[2])
		b, _ := strconv.Atoi(parts[3])

		toHex := func(n int) string {
			n = max(0, min(255, n))
			return fmt.Sprintf("%02x", n)
		}
		hexColor := fmt.Sprintf("#%s%s%s", toHex(r), toHex(g), toHex(b))

		// Apply hex shortening again after RGB conversion
		if submatch := m.hexShortenPattern.FindStringSubmatch(hexColor); len(submatch) > 0 {
			return fmt.Sprintf("#%s%s%s", submatch[1], submatch[2], submatch[3])
		}
		return hexColor
	})

	return strings.TrimSpace(content)
}

// minifyCssLite lightly minifies CSS content by optimizing spacing only.
func (m *Minify) Lite(content string) string {
	// Step 1: Optimize spacing in one pass
	content = m.spacingPattern.ReplaceAllStringFunc(content, func(match string) string {
		parts := m.spacingPattern.FindStringSubmatch(match)
		if parts[1] != "" { // sym1: { } : ; ,
			return parts[1]
		}
		if parts[2] != "" { // sym2: { }
			return parts[2]
		}
		if parts[3] != "" { // colon: : value ; end
			return fmt.Sprintf("%s%s%s", parts[3], parts[4], parts[5])
		}
		return "!important" // !important
	})
	return strings.TrimSpace(content)
}

// Helper functions for min/max (Go 1.21+ has built-in, but for broader compatibility)
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// Global instances of the utility types
var (
	JSONCUtil     = &JSONC{}
	UncommentUtil = &Uncomment{}
	MinifyUtil    = NewMinify()
)
