package utils

import (
	"slices"
	"regexp"
	"strconv"
	"strings"
)

// Regular expressions equivalent
var (
	alphanumeric = regexp.MustCompile(`[a-zA-Z0-9]`)
	space        = regexp.MustCompile(`\s+`)
	at           = regexp.MustCompile(`@+`)
)

func String_Pointer(s string) *string { return &s }

func String_HasRune(slice []rune, r rune) bool {
	return slices.Contains(slice, r)
}

// Normalize: replaces spaces and '@', then applies filters and replacements
func String_Filter(s string, keepChars, skipChars, addBackSlashFor []rune) string {
	final := strings.Builder{}
	s = space.ReplaceAllString(s, "_")
	s = at.ReplaceAllString(s, "_")
	for _, ch := range s {
		if String_HasRune(skipChars, ch) {
			continue
		} else if String_HasRune(addBackSlashFor, ch) {
			final.WriteRune('\\')
			final.WriteRune(ch)
		} else {
			if ch == '_' {
				final.WriteRune('_')
			} else if String_HasRune(keepChars, ch) {
				final.WriteRune(ch)
			} else if alphanumeric.MatchString(string(ch)) {
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
	f, _ := strconv.ParseFloat(strconv.FormatFloat(sizeKB, 'f', 2, 64), 64)
	return f
}
