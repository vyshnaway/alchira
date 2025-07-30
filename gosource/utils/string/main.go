package utils

import (
	"regexp"
	"strings"
)

var (
	alphanumeric = regexp.MustCompile("[a-z0-9]")
	space        = regexp.MustCompile("\\s+")
)

const digits = "-0123456789_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const base = len(digits)

// Util provides utility functions for string manipulation and encoding.
type Util struct{}

// Normalize processes a string by replacing spaces, handling specific characters,
// and ensuring only alphanumeric or allowed characters remain.
func (u *Util) Normalize(s string, keepChars, skipChars, addBackSlashFor []rune) string {
	if s == "" {
		return ""
	}

	s = space.ReplaceAllString(s, "_")
	var final strings.Builder

	for _, ch := range s {
		skip := false
		for _, sc := range skipChars {
			if ch == sc {
				skip = true
				break
			}
		}
		if skip {
			continue
		}

		addBackslash := false
		for _, bc := range addBackSlashFor {
			if ch == bc {
				addBackslash = true
				break
			}
		}
		if addBackslash {
			final.WriteRune('\\')
			final.WriteRune(ch)
		} else {
			if ch == '_' {
				final.WriteRune('_')
			} else {
				keep := false
				for _, kc := range keepChars {
					if ch == kc {
						keep = true
						break
					}
				}
				if keep {
					final.WriteRune(ch)
				} else if alphanumeric.MatchString(string(ch)) {
					final.WriteRune(ch)
				} else {
					final.WriteRune('-')
				}
			}
		}
	}
	return final.String()
}

// Minify reduces multiple spaces to single spaces and removes leading/trailing spaces.
// It also replaces tabs, newlines, and carriage returns with single spaces.
func (u *Util) Minify(s string) string {
	var result []rune
	lastCh := ' ' // Initialize with a space to handle leading non-spaces correctly

	for _, ch := range s {
		switch ch {
		case '\n', '\r', '\t':
			ch = ' '
		}

		if ch == ' ' {
			if lastCh != ' ' {
				result = append(result, ch)
			}
		} else {
			result = append(result, ch)
		}
		lastCh = ch
	}

	// Remove trailing space if any
	if len(result) > 0 && result[len(result)-1] == ' ' {
		result = result[:len(result)-1]
	}

	return string(result)
}

// ZeroBreaks splits a string into a slice of strings based on specified conditions (delimiters).
func (u *Util) ZeroBreaks(s string, conditions []rune) []string {
	var result []string
	start := 0

	for i, ch := range s {
		isCondition := false
		for _, cond := range conditions {
			if ch == cond {
				isCondition = true
				break
			}
		}

		if isCondition {
			if i > start {
				result = append(result, s[start:i])
			}
			start = i + 1
		}
	}

	if len(s) > start {
		result = append(result, s[start:len(s)])
	}

	return result
}

// EnCounter converts a number to a string representation using a custom base (digits).
func (u *Util) EnCounter(number int) string {
	if number == 0 {
		return string(digits[0])
	}
	var result string
	for number > 0 {
		reminder := number % base
		result = string(digits[reminder]) + result
		number = number / base
	}
	return result
}

// StringMem calculates the memory footprint of a string in kilobytes,
// rounded to two decimal places.
func (u *Util) StringMem(s string) float64 {
	return float64(len(s)) / 1024.0
}
