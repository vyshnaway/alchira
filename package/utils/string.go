package utils

import (
	_regexp "regexp"
	_slices "slices"
	"sort"
	_strconv "strconv"
	_strings "strings"
)

var regex_alphanumeric = _regexp.MustCompile(`[a-zA-Z0-9]`)
var regex_space = _regexp.MustCompile(`\s+`)
var regex_at = _regexp.MustCompile(`@+`)

// Replaces spaces and '@', then applies filters and replacements
func String_Filter(s string, keepChars, skipChars, addBackSlashFor []rune) string {
	var final _strings.Builder

	s = regex_space.ReplaceAllString(s, "_")
	s = regex_at.ReplaceAllString(s, "_")
	for _, ch := range s {
		if _slices.Contains(skipChars, ch) {
			continue
		} else if _slices.Contains(addBackSlashFor, ch) {
			final.WriteRune('\\')
			final.WriteRune(ch)
		} else {
			if ch == '_' {
				final.WriteRune('_')
			} else if _slices.Contains(keepChars, ch) {
				final.WriteRune(ch)
			} else if regex_alphanumeric.MatchString(string(ch)) {
				final.WriteRune(ch)
			} else {
				final.WriteRune('-')
			}
		}
	}
	return final.String()
}

// Strips repeated whitespace and trims ends
func String_Minify(s string) string {
	var result []rune
	lastCh := ' '
	for _, ch := range s {
		if ch == '\n' || ch == '\r' || ch == '\t' {
			ch = ' '
		}
		if ch == ' ' && lastCh != ' ' {
			result = append(result, ch)
		} else if ch != ' ' {
			result = append(result, ch)
		}
		lastCh = ch
	}
	if len(result) > 0 && lastCh == ' ' {
		result = result[:len(result)-1]
	}
	return string(result)
}

// Splits string into segments not containing conditions
func String_ZeroBreaks(s string, conditions []rune) []string {
	var result []string
	start := 0
	conditionSet := make(map[rune]struct{})
	for _, c := range conditions {
		conditionSet[c] = struct{}{}
	}
	for i, ch := range s {
		if _, ok := conditionSet[ch]; ok {
			if i > start {
				result = append(result, s[start:i])
			}
			start = i + 1
		}
	}
	if len(s) > start {
		result = append(result, s[start:])
	}
	return result
}

// Integer to base-62 encoding, offset by 512
func String_EnCounter(number int) string {
	digits := "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	base := len(digits)
	result := ""
	number += 512
	for number > 0 {
		reminder := number % base
		result = string(digits[reminder]) + result
		number = number / base
	}
	return result
}

// Approximates string memory size in kilobytes
func String_Memory(s string) float64 {
	// Each Go string char is 1 byte (UTF-8 already handled), so use length/1024
	sizeKB := float64(len(s)) / 1024
	f, _ := _strconv.ParseFloat(_strconv.FormatFloat(sizeKB, 'f', 2, 64), 64)
	return f
}

// Fallback if type check as string fails
func String_Fallback(values ...any) string {
	for _, val := range values {
		if s, ok := val.(string); ok && s != "" {
			return s
		}
	}
	return ""
}

// Add space padding to both sides of string till limit
func String_PadBothSides(str string, totalLength int) string {
	totalPadding := totalLength - len(str)
	if totalPadding <= 0 {
		return str
	}
	start := totalPadding / 2
	end := totalPadding - start
	return _strings.Repeat(" ", start) + str + _strings.Repeat(" ", end)
}

// Add padding to end of string till limit
func String_PadEnd(s string, width int, padChar rune) string {
	if len(s) >= width {
		return s
	}
	return s + _strings.Repeat(string(padChar), width-len(s))
}

// Add padding to start of string till limit
func String_PadStart(s string, width int, padChar rune) string {
	if len(s) >= width {
		return s
	}
	return s + _strings.Repeat(string(padChar), width-len(s))
}

func String_Unique[T comparable](input []T) []T {
	set := make(map[T]struct{})
	var result []T

	for _, val := range input {
		if _, exists := set[val]; !exists {
			set[val] = struct{}{}
			result = append(result, val)
		}
	}
	return result
}

func String_SortAlphaDesc[T ~string](slice []T) {
    sort.Slice(slice, func(i, j int) bool {
        return slice[i] > slice[j]
    })
}

func String_SortAlphaAsc[T ~string](slice []T) {
    sort.Slice(slice, func(i, j int) bool {
        return slice[i] < slice[j]
    })
}