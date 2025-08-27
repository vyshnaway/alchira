package tag

import (
	root "main/shell/root"
	"math"
	"strings"
)

func H1(content string, presets []string, styles ...string) string {
	minWidth := 10
	width := int(math.Max(float64(root.Canvas.Width()), float64(minWidth)))
	var lines []string
	currentLine := ""
	words := strings.Split(content, " ")

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
		leftPad := strings.Repeat(" ", int(math.Max(0, math.Floor(float64(padding)/2))))
		rightPad := strings.Repeat(" ", int(math.Max(0, math.Ceil(float64(padding)/2))))
		paddedLines = append(paddedLines, ">>>"+leftPad+line+rightPad+"<<<")
	}

	allPresets := append(presets, styles...)
	return root.Format(strings.Join([]string{"", root.Canvas.Divider.Mid, strings.Join(paddedLines, "\n"), root.Canvas.Divider.Mid, ""}, "\n"), allPresets...)
}

func H2(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(strings.Join([]string{root.Canvas.Divider.Mid, content, root.Canvas.Divider.Mid, ""}, "\n"), allPresets...)
}

func H3(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(strings.Join([]string{"", content, root.Canvas.Divider.Mid, ""}, "\n"), allPresets...)
}

func H4(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(strings.Join([]string{root.Canvas.Divider.Mid, content, ""}, "\n"), allPresets...)
}

func H5(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(strings.Join([]string{content, ""}, "\n"), allPresets...)
}

func H6(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(content+root.Canvas.Tab+strings.Repeat(string(root.Canvas.Divider.Mid[0]), root.Canvas.Width()-len(root.Canvas.Tab)-len(content))+"\n", allPresets...)
}

func P(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(root.Canvas.Tab+content, allPresets...) + "\n"
}

func Span(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(content, allPresets...) + "\n"
}

func Li(content string, presets []string, styles ...string) string {
	allPresets := append(presets, styles...)
	return root.Format(">"+root.Canvas.Tab+content, allPresets...)
}

func Hr(content string, presets []string, styles ...string) string {
	if content == "" {
		content = string(root.Canvas.Divider.Mid[0])
	}
	allPresets := append(presets, styles...)
	repeated := strings.Repeat(string(content[0]), int(math.Ceil(float64(root.Canvas.Width())/float64(len(content)))))
	return root.Format("\n"+repeated[:root.Canvas.Width()], allPresets...)
}

func Br(repeat int, presets []string, styles ...string) string {
	if repeat < 0 {
		repeat = 0
	}
	allPresets := append(presets, styles...)
	return root.Format(strings.Repeat("\n", repeat), allPresets...)
}

func Tab(repeat int, presets []string, styles ...string) string {
	if repeat < 0 {
		repeat = 0
	}
	allPresets := append(presets, styles...)
	return root.Format(strings.Repeat(root.Canvas.Tab, repeat), allPresets...)
}
