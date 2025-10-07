package shell

import (
	_math_ "math"
	_strings_ "strings"
)

func tag_H1(content string, preset []string, styles ...string) string {
	minWidth := 10
	width := max(Canvas.Width(), minWidth)
	words := _strings_.Fields(content)
	var lines []string
	var currentLine string
	for _, word := range words {
		if len(currentLine)+len(word)+1 <= width-6 {
			if currentLine != "" {
				currentLine += " "
			}
			currentLine += word
		} else {
			lines = append(lines, currentLine)
			currentLine = word
		}
	}
	lines = append(lines, currentLine)

	var paddedLines []string
	for _, line := range lines {
		padding := width - 6 - len(line)
		leftPad := _strings_.Repeat(" ", padding/2)
		rightPad := _strings_.Repeat(" ", (padding+1)/2)
		paddedLines = append(paddedLines, ">>>"+leftPad+line+rightPad+"<<<")
	}
	s := "\n" + Divider(Canvas.DivRune.Mid) + "\n" + _strings_.Join(paddedLines, "\n") + "\n" + Divider(Canvas.DivRune.Mid) + "\n"
	return Format(s, preset, styles...)
}

func tag_H2(content string, preset []string, styles ...string) string {
	s := Divider(Canvas.DivRune.Mid) + "\n" + content + "\n" + Divider(Canvas.DivRune.Mid) + "\n"
	return Format(s, preset, styles...)
}

func tag_H3(content string, preset []string, styles ...string) string {
	s := "\n" + content + "\n" + Divider(Canvas.DivRune.Mid)
	return Format(s, preset, styles...)
}

func tag_H4(content string, preset []string, styles ...string) string {
	s := Divider(Canvas.DivRune.Mid) + "\n" + content + "\n"
	return Format(s, preset, styles...)
}

func tag_H5(content string, preset []string, styles ...string) string {
	width := Canvas.Width()
	tabLen := len(Canvas.Tab)
	remain := width - tabLen - len(content)
	s := content + Canvas.Tab + Divider(Canvas.DivRune.Mid)[:remain] + "\n"
	return Format(s, preset, styles...)
}

func tag_H6(content string, preset []string, styles ...string) string {
	width := Canvas.Width()
	tabLen := len(Canvas.Tab)
	remain := width - tabLen - len(content)
	s := _strings_.Repeat(string(Canvas.DivRune.Mid), remain) + Canvas.Tab + content
	return Format(s, preset, styles...)
}

func tag_P(content string, preset []string, styles ...string) string {
	s := Canvas.Tab + content
	return Format(s, preset, styles...) + "\n"
}

func tag_Span(content string, preset []string, styles ...string) string {
	return Format(content, preset, styles...)
}

func tag_Li(content string, preset []string, styles ...string) string {
	s := ">" + Canvas.Tab + content
	return Format(s, preset, styles...)
}

func tag_Hr(content string, preset []string, styles ...string) string {
	width := Canvas.Width()
	n := int(_math_.Ceil(float64(width) / float64(len(content))))
	repeated := _strings_.Repeat(content, n)
	if len(repeated) > width {
		repeated = repeated[:width]
	}
	s := "\n" + repeated + "\n"
	return Format(s, preset, styles...)
}

func tag_Br(repeat int, preset []string, styles ...string) string {
	if repeat < 0 {
		repeat = 0
	}
	return Format(_strings_.Repeat("\n", repeat), preset, styles...)
}

func tag_Tab(repeat int, preset []string, styles ...string) string {
	if repeat < 0 {
		repeat = 0
	}
	return Format(_strings_.Repeat(Canvas.Tab, repeat), preset, styles...)
}

var Tag = struct {
	H1   func(string, []string, ...string) string
	H2   func(string, []string, ...string) string
	H3   func(string, []string, ...string) string
	H4   func(string, []string, ...string) string
	H5   func(string, []string, ...string) string
	H6   func(string, []string, ...string) string
	P    func(string, []string, ...string) string
	Span func(string, []string, ...string) string
	Li   func(string, []string, ...string) string
	Hr   func(string, []string, ...string) string
	Br   func(int, []string, ...string) string
	Tab  func(int, []string, ...string) string
}{
	H1:   tag_H1,
	H2:   tag_H2,
	H3:   tag_H3,
	H4:   tag_H4,
	H5:   tag_H5,
	H6:   tag_H6,
	P:    tag_P,
	Span: tag_Span,
	Li:   tag_Li,
	Hr:   tag_Hr,
	Br:   tag_Br,
	Tab:  tag_Tab,
}
