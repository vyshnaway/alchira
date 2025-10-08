package shell

import (
	_fmt_ "fmt"
)

func list_Bullets(items []string, intent int, preset []string, styles ...string) []string {
	if intent < 0 {
		intent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		result[i] = tag_Tab(intent, Preset.None) + Format(tag_Li(item, Preset.None), preset, styles...)
	}
	return result
}

func list_Numbers(items []string, intent int, preset []string, styles ...string) []string {
	if intent < 0 {
		intent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		line := _fmt_.Sprintf("%d%s%s", i+1, tag_Tab(1, Preset.None), Format(item, preset, styles...))
		result[i] = tag_Tab(intent, Preset.None) + Format(line, preset, styles...)
	}
	return result
}

func list_Level(items []string, intent int, preset []string, styles ...string) []string {
	if intent < 0 {
		intent = 0
	}
	keyLength := 0
	for _, key := range items {
		if len(key) > keyLength {
			keyLength = len(key)
		}
	}
	result := make([]string, len(items))
	for i, key := range items {
		padded := _fmt_.Sprintf("%-*s%s", keyLength, key, tag_Tab(1, Preset.None))
		result[i] = tag_Tab(intent, Preset.None) + Format(padded, preset, styles...)
	}
	return result
}

func list_Waterfall(items []string, intent int, preset []string, styles ...string) []string {
	if intent < 0 {
		intent = 0
	}
	result := make([]string, len(items))
	for i, item := range items {
		arrow := " ├─> "
		if i == len(items)-1 {
			arrow = " └─> "
		}
		result[i] = tag_Tab(intent, Preset.None) + Format(arrow+tag_Tab(1, Preset.None)+item, preset, styles...)
	}
	return result
}

func list_Catalog(items []string, intent int, preset []string, styles ...string) []string {
	if intent < 0 {
		intent = 0
	}
	prefix := tag_Tab(intent, Preset.None)
	size := 0
	for _, i := range items {
		if len(i) > size {
			size = len(i)
		}
	}
	colWidth := Canvas.Width() - len(prefix) + len(tag_Tab(1, Preset.None))
	cols := colWidth / (size + len(tag_Tab(1, Preset.None)))
	if cols <= 0 {
		cols = 1
	}
	var result []string
	subResult := ""
	for i, item := range items {
		formatted := Format(util_PadEnd(item, size, ' '), preset, styles...)
		if (i+1)%cols == 0 {
			subResult += formatted
			result = append(result, subResult)
			subResult = ""
		} else {
			subResult += formatted + tag_Tab(1, Preset.None)
		}
	}
	if len(subResult) > 0 {
		result = append(result, subResult)
	}
	for i := range result {
		result[i] = prefix + result[i]
	}
	return result
}

var List = struct {
	Bullets   func(items []string, intent int, preset []string, styles ...string) []string
	Numbers   func(items []string, intent int, preset []string, styles ...string) []string
	Level     func(items []string, intent int, preset []string, styles ...string) []string
	Waterfall func(items []string, intent int, preset []string, styles ...string) []string
	Catalog   func(items []string, intent int, preset []string, styles ...string) []string
}{
	Bullets:   list_Bullets,
	Numbers:   list_Numbers,
	Level:     list_Level,
	Waterfall: list_Waterfall,
	Catalog:   list_Catalog,
}
