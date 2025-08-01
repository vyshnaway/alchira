package shell

import (
	"fmt"
	"math"
	"strings"
)

func h1(heading string) string {
	minWidth := 10
	width := int(math.Max(float64(Canvas.Settings.Width), float64(minWidth)))
	lines := []string{}
	currentLine := ""
	words := strings.Fields(heading)

	for _, word := range words {
		if len(currentLine)+len(word)+1 <= width-6 || currentLine == "" {
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

	paddedLines := []string{}
	for _, line := range lines {
		padding := width - 6 - len(line)
		leftPad := strings.Repeat(" ", int(math.Max(0, math.Floor(float64(padding)/2))))
		rightPad := strings.Repeat(" ", int(math.Max(0, math.Ceil(float64(padding)/2))))
		paddedLines = append(paddedLines, fmt.Sprintf(">>>%s%s%s<<<", leftPad, line, rightPad))
	}

	return strings.Join(
		[]string{"", Canvas.Divider.Mid, strings.Join(paddedLines, "\n"), Canvas.Divider.Mid, ""},
		"\n",
	) + Canvas.Unstyle
}

func h2(heading string) string {
	return strings.Join(
		[]string{Canvas.Divider.Mid,
			heading, Canvas.Divider.Mid,
			""},
		"\n",
	) + Canvas.Unstyle
}

func h3(heading string) string {
	return strings.Join([]string{Canvas.Divider.Mid, heading, ""}, "\n") + Canvas.Unstyle
}

func h4(heading string) string {
	return strings.Join([]string{heading, Canvas.Divider.Mid}, "\n") + Canvas.Unstyle
}

func h5(heading string) string {
	return strings.Join([]string{heading, ""}, "\n") + Canvas.Unstyle
}

func h6(heading string) string {
	return heading + Canvas.Unstyle
}

func p(content string) string {
	return Canvas.Tab + content + Canvas.Unstyle + "\n"
}

func li(str string) string {
	return Style.Bold[Canvas.Settings.Tertiary](">" + Canvas.Tab + str + Canvas.Unstyle)
}

func hr(character string) string {
	charToRepeat := "─"
	if len(character) > 0 {
		charToRepeat = string(character[0])
	}
	return "\n" + strings.Repeat(charToRepeat, Canvas.Settings.Width) + Canvas.Unstyle
}

func div(content string) string {
	return content + Canvas.Unstyle
}

func br(repeat int) string {
	if repeat < 0 {
		repeat = 0
	}
	return strings.Repeat("\n", repeat) + Canvas.Unstyle
}

func tab(count int) string {
	if count < 0 {
		count = 0
	}
	return strings.Repeat(Canvas.Tab, count) + Canvas.Unstyle
}


type t_Tag struct {
	H1  func(string) string
	H2  func(string) string
	H3  func(string) string
	H4  func(string) string
	H5  func(string) string
	H6  func(string) string
	P   func(string) string
	Li  func(string) string
	Br  func(int) string
	Hr  func(string) string
	Tab func(int) string
	Div func(string) string
}

var Tag = t_Tag{
	H1:  h1,
	H2:  h2,
	H3:  h3,
	H4:  h4,
	H5:  h5,
	H6:  h6,
	P:   p,
	Li:  li,
	Br:  br,
	Hr:  hr,
	Tab: tab,
	Div: div,
}