package shell

import (
	_math_ "math"
	_strings_ "strings"
)

func frames_Title_ModifyString(str string) string {
	if len(str) <= 2 {
		return str
	}
	str = str[1 : len(str)-1]
	if _strings_.HasPrefix(str, " ") {
		if len(str) <= 2 {
			return str
		}
		str = str[1 : len(str)-1]
	} else {
		if len(str) <= 2 {
			return str
		}
		str = str[:len(str)-2]
	}
	return ">" + str + "<"
}

func frames_Title(input string) []string {
	framecount := int(_math_.Ceil(float64(len(input)) / 16.0))
	var preview []string
	width := Canvas.Width()

	// Build frame sets
	for i := 0; i < framecount*2; i++ {
		frame := []string{"", "", Canvas.Divider.Mid, ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		frame := []string{"", Format(Canvas.Divider.Top, Preset.Title, Style.AS_Underline), "", ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		line := "·" + util_PadBothSides("·", width-2) + "·"
		frame := []string{"", Canvas.Divider.Btm, line, Canvas.Divider.Top, ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		line := ">" + util_PadBothSides("-", width-2) + "<"
		frame := []string{"", Canvas.Divider.Mid, line, Canvas.Divider.Mid, ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		line := ">>" + util_PadBothSides("×", width-4) + "<<"
		frame := []string{"", Canvas.Divider.Top, line, Canvas.Divider.Btm, ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}

	rendered := []string{}
	str := "   " + input + "   "
	for len(str) != 1 && len(str) != 2 {
		str = frames_Title_ModifyString(str)
		rendered = append([]string{Format(tag_H1(str, []string{}), Preset.Title, Style.AS_Bold)}, rendered...)
	}

	return append(preview, rendered...)
}
