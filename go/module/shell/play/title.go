package play

import (
	shell "main/module/shell/core"
	_math_ "math"
	_strings_ "strings"
)

func title(input string) []string {

	util_PadBothSides := func(str string, totalLength int) string {
		totalPadding := totalLength - len(str)
		if totalPadding <= 0 {
			return str
		}
		start := totalPadding / 2
		end := totalPadding - start
		return _strings_.Repeat(" ", start) + str + _strings_.Repeat(" ", end)
	}

	wrap_string := func(str string) string {
		if len(str) <= 2 {
			return str
		}
		str = str[1 : len(str)-1]
		if _strings_.HasPrefix(str, " ") {
			str = str[1 : len(str)-1]
		} else {
			str = str[:len(str)-2]
		}
		return ">" + str + "<"
	}

	framecount := int(_math_.Ceil(float64(len(input)) / 32.0))
	var preview []string
	width := shell.Canvas.Width()

	// Build frame sets
	for i := 0; i < framecount*2; i++ {
		frame := []string{"", "", shell.Divider(shell.Canvas.DivRune.Mid), ""}
		preview = append(preview, shell.Format(_strings_.Join(frame, "\n"), shell.Preset.Title, shell.Style.AS_Bold))
	}
	for range framecount {
		frame := []string{"", shell.Format(shell.Divider(shell.Canvas.DivRune.Top), shell.Preset.Title, shell.Style.AS_Underline), "", ""}
		preview = append(preview, shell.Format(_strings_.Join(frame, "\n"), shell.Preset.Title, shell.Style.AS_Bold))
	}
	for range framecount {
		line := "·" + util_PadBothSides("·", width-2) + "·"
		frame := []string{"", shell.Divider(shell.Canvas.DivRune.Btm), line, shell.Divider(shell.Canvas.DivRune.Top), ""}
		preview = append(preview, shell.Format(_strings_.Join(frame, "\n"), shell.Preset.Title, shell.Style.AS_Bold))
	}
	for range framecount {
		line := ">" + util_PadBothSides("-", width-2) + "<"
		frame := []string{"", shell.Divider(shell.Canvas.DivRune.Mid), line, shell.Divider(shell.Canvas.DivRune.Mid), ""}
		preview = append(preview, shell.Format(_strings_.Join(frame, "\n"), shell.Preset.Title, shell.Style.AS_Bold))
	}
	for range framecount {
		line := ">>" + util_PadBothSides("×", width-4) + "<<"
		frame := []string{"", shell.Divider(shell.Canvas.DivRune.Top), line, shell.Divider(shell.Canvas.DivRune.Btm), ""}
		preview = append(preview, shell.Format(_strings_.Join(frame, "\n"), shell.Preset.Title, shell.Style.AS_Bold))
	}

	rendered := []string{}
	str := "   " + input + "   "
	for len(str) > 3 {
		str = wrap_string(str)
		rendered = append([]string{shell.Format(shell.Tag.H1(str, []string{}), shell.Preset.Title, shell.Style.AS_Bold)}, rendered...)
	}

	return append(preview, rendered...)
}

func Title(str string, duration int, frames int) error {
	framesArr := title(str)
	return shell.Render.Animate(framesArr, duration, frames)
}
