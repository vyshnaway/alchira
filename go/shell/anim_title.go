package shell

import (
	_math_ "math"
	_strings_ "strings"
)

func anim_Title_frames(input string) []string {

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
	width := Canvas.Width()

	// Build frame sets
	for i := 0; i < framecount*2; i++ {
		frame := []string{"", "", Divider(Canvas.DivRune.Mid), ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		frame := []string{"", Format(Divider(Canvas.DivRune.Top), Preset.Title, Style.AS_Underline), "", ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		line := "·" + util_PadBothSides("·", width-2) + "·"
		frame := []string{"", Divider(Canvas.DivRune.Btm), line, Divider(Canvas.DivRune.Top), ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		line := ">" + util_PadBothSides("-", width-2) + "<"
		frame := []string{"", Divider(Canvas.DivRune.Mid), line, Divider(Canvas.DivRune.Mid), ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}
	for range framecount {
		line := ">>" + util_PadBothSides("×", width-4) + "<<"
		frame := []string{"", Divider(Canvas.DivRune.Top), line, Divider(Canvas.DivRune.Btm), ""}
		preview = append(preview, Format(_strings_.Join(frame, "\n"), Preset.Title, Style.AS_Bold))
	}

	rendered := []string{}
	str := "   " + input + "   "
	for len(str) > 3 {
		str = wrap_string(str)
		rendered = append([]string{Format(tag_H1(str, []string{}), Preset.Title, Style.AS_Bold)}, rendered...)
	}

	return append(preview, rendered...)
}
