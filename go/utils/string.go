package utils

import (
	_regexp_ "regexp"
	_slices_ "slices"
	_strconv_ "strconv"
	_strings_ "strings"
)

// Normalize: replaces spaces and '@', then applies filters and replacements
func String_Filter(s string, keepChars, skipChars, addBackSlashFor []rune) string {
	final := _strings_.Builder{}
	regex_alphanumeric := _regexp_.MustCompile(`[a-zA-Z0-9]`)
	regex_space := _regexp_.MustCompile(`\s+`)
	regex_at := _regexp_.MustCompile(`@+`)

	s = regex_space.ReplaceAllString(s, "_")
	s = regex_at.ReplaceAllString(s, "_")
	for _, ch := range s {
		if _slices_.Contains(skipChars, ch) {
			continue
		} else if _slices_.Contains(addBackSlashFor, ch) {
			final.WriteRune('\\')
			final.WriteRune(ch)
		} else {
			if ch == '_' {
				final.WriteRune('_')
			} else if _slices_.Contains(keepChars, ch) {
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

// Minify: strips repeated whitespace and trims ends
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

// ZeroBreaks: splits string into segments not containing conditions
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

// EnCounter: integer to base-62 encoding, offset by 512
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

// StringMem: approximates string memory size in kilobytes
func String_Memory(s string) float64 {
	// Each Go string char is 1 byte (UTF-8 already handled), so use length/1024
	sizeKB := float64(len(s)) / 1024
	f, _ := _strconv_.ParseFloat(_strconv_.FormatFloat(sizeKB, 'f', 2, 64), 64)
	return f
}

func String_Fallback(val any, fallback string) string {
	if s, ok := val.(string); ok && s != "" {
		return s
	}
	return fallback
}