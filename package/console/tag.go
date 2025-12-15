package console

import (
	_math "math"
	_strings "strings"
)

func tag_H1(content string, preset []string, styles ...string) string {
	minWidth := 10
	width := max(Canvas.Width(), minWidth)
	words := _strings.Fields(content)
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
		leftPad := _strings.Repeat(" ", padding/2)
		rightPad := _strings.Repeat(" ", (padding+1)/2)
		paddedLines = append(paddedLines, ">>>"+leftPad+line+rightPad+"<<<")
	}
	s := "\r\n" + Divider(Canvas.DivRune.Mid) + "\r\n" + _strings.Join(paddedLines, "\r\n") + "\r\n" + Divider(Canvas.DivRune.Mid) + "\r\n\r\n"
	return Format(s, preset, styles...)
}

func tag_H2(content string, preset []string, styles ...string) string {
	s := Divider(Canvas.DivRune.Mid) + "\r\n" + content + "\r\n" + Divider(Canvas.DivRune.Mid) + "\r\n"
	return Format(s, preset, styles...)
}

func tag_H3(content string, preset []string, styles ...string) string {
	s := "\r\n" + content + "\r\n" + Divider(Canvas.DivRune.Mid)
	return Format(s, preset, styles...)
}

func tag_H4(content string, preset []string, styles ...string) string {
	s := Divider(Canvas.DivRune.Mid) + "\r\n" + content + "\r\n"
	return Format(s, preset, styles...)
}

func tag_H5(content string, preset []string, styles ...string) string {
	width := Canvas.Width()
	tabLen := len(Canvas.Tab)
	remain := width - int(_math.Remainder(float64(tabLen+len(content)), float64(width)))
	s := content + Canvas.Tab + _strings.Repeat(string(Canvas.DivRune.Mid), remain)
	return Format(s, preset, styles...)
}

func tag_H6(content string, preset []string, styles ...string) string {
	width := Canvas.Width()
	tabLen := len(Canvas.Tab)
	remain := width - int(_math.Remainder(float64(tabLen+len(content)), float64(width)))
	s := _strings.Repeat(string(Canvas.DivRune.Mid), remain) + Canvas.Tab + content
	return Format(s, preset, styles...)
}

func tag_P(content string, preset []string, styles ...string) string {
	s := Canvas.Tab + content
	return Format(s, preset, styles...) + "\r\n"
}

func tag_Span(content string, preset []string, styles ...string) string {
	return Format(content, preset, styles...)
}

func tag_Li(content string, preset []string, styles ...string) string {
	s := ">" + Canvas.Tab + content
	return Format(s, preset, styles...)
}

func tag_Hr(content string, preset []string, styles ...string) string {
	rn := Canvas.DivRune.Mid
	if len(content) > 0 {
		rn = rune(content[0])
	}

    s := "\r\n" + Divider(rn) + "\r\n"
    return Format(s, preset, styles...)
}

func tag_Br(repeat int, preset []string, styles ...string) string {
	if repeat < 0 {
		repeat = 0
	}
	return Format(_strings.Repeat("\r\n", repeat), preset, styles...)
}

func tag_Tab(repeat int, preset []string, styles ...string) string {
	if repeat < 0 {
		repeat = 0
	}
	return Format(_strings.Repeat(Canvas.Tab, repeat), preset, styles...)
}

var Tag = struct {
	H1   func(content string, preset []string, styles ...string) string
	H2   func(content string, preset []string, styles ...string) string
	H3   func(content string, preset []string, styles ...string) string
	H4   func(content string, preset []string, styles ...string) string
	H5   func(content string, preset []string, styles ...string) string
	H6   func(content string, preset []string, styles ...string) string
	P    func(content string, preset []string, styles ...string) string
	Span func(content string, preset []string, styles ...string) string
	Li   func(content string, preset []string, styles ...string) string
	Hr   func(content string, preset []string, styles ...string) string
	Br   func(repeat int,preset []string,styles ...string) string
	Tab  func(repeat int,preset []string,styles ...string) string
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
