package list

import (
	"fmt"
	"math"
	"strings"

	"main/shell/root"
	"main/shell/tag"
)

// List represents a function that formats a list of strings with styling
type List func(items []string, indent int, preset []string, styles ...string) []string

// Bullets formats a list of items as a bulleted list
func Bullets(items []string, indent int, preset []string, styles ...string) []string {
	if indent < 0 {
		indent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		result[i] = tag.Tab(indent, nil) + root.Format(tag.Li(item, preset, styles...), append(preset, styles...)...)
	}
	return result
}

// Numbers formats a list of items as a numbered list
func Numbers(items []string, indent int, preset []string, styles ...string) []string {
	if indent < 0 {
		indent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		result[i] = tag.Tab(indent, nil) + root.Format(fmt.Sprintf("%d%s%s", i+1, tag.Tab(1, nil), item), append(preset, styles...)...)
	}
	return result
}

// Level formats a list of items with equal spacing
func Level(items []string, indent int, preset []string, styles ...string) []string {
	if indent < 0 {
		indent = 0
	}
	maxLen := 0
	for _, key := range items {
		if len(key) > maxLen {
			maxLen = len(key)
		}
	}

	result := make([]string, len(items))
	for i, key := range items {
		paddedKey := key + strings.Repeat(" ", maxLen-len(key))
		result[i] = tag.Tab(indent, nil) + root.Format(paddedKey+tag.Tab(1, nil), append(preset, styles...)...)
	}
	return result
}

// Paragraphs formats a list of items as paragraphs
func Paragraphs(items []string, indent int, preset []string, styles ...string) []string {
	if indent < 0 {
		indent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		result[i] = tag.Tab(indent, nil) + root.Format(item, append(preset, styles...)...)
	}
	return result
}

// Breaks formats a list of items with line breaks
func Breaks(items []string, indent int, preset []string, styles ...string) []string {
	if indent < 0 {
		indent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		result[i] = strings.Repeat("\n", indent) + root.Format(tag.P(item, preset, styles...), append(preset, styles...)...)
	}
	return result
}

// Waterfall formats a list of items in a tree-like structure
func Waterfall(items []string, indent int, preset []string, styles ...string) []string {
	if indent < 0 {
		indent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		prefix := "├─>"
		if i == len(items)-1 {
			prefix = "└─>"
		}
		result[i] = tag.Tab(indent, nil) + root.Format(prefix+tag.Tab(indent, nil)+item, append(preset, styles...)...)
	}
	return result
}

// Catalog formats a list of items in a grid-like structure
func Catalog(items []string, indent int, preset []string, styles ...string) []string {
	if indent < 0 {
		indent = 0
	}
	prefix := tag.Tab(indent, nil)

	maxLen := 0
	for _, item := range items {
		if len(item) > maxLen {
			maxLen = len(item)
		}
	}
	size := maxLen + len(tag.Li("", nil))
	cols := int(math.Floor(float64(root.Canvas.Width()-len(prefix)+len(tag.Tab(1, nil))) / float64(size+len(tag.Tab(1, nil)))))

	var result []string
	var subResult string

	for i, item := range items {
		paddedItem := item + strings.Repeat(" ", size-len(item))
		if (i+1)%cols == 0 {
			subResult += root.Format(tag.Li(paddedItem, preset, styles...), append(preset, styles...)...)
			result = append(result, subResult)
			subResult = ""
		} else {
			subResult += root.Format(tag.Li(paddedItem, preset, styles...), append(preset, styles...)...) + tag.Tab(1, nil)
		}
	}

	if subResult != "" {
		result = append(result, subResult)
	}

	for i := range result {
		result[i] = prefix + result[i]
	}
	return result
}
