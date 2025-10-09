package play

import (
	_shell "main/package/shell"
	_utils "main/package/utils"
	_math "math"
	_strings "strings"
)

func title(input string) []string {

	wrap_string := func(str string) string {
		if len(str) <= 2 {
			return str
		}
		str = str[1 : len(str)-1]
		if _strings.HasPrefix(str, " ") {
			str = str[1 : len(str)-1]
		} else {
			str = str[:len(str)-2]
		}
		return ">" + str + "<"
	}

	framecount := int(_math.Ceil(float64(len(input)) / 32.0))
	var preview []string
	width := _shell.Canvas.Width()

	for i := 0; i < framecount*2; i++ {
		frame := []string{"", "", _shell.Divider(_shell.Canvas.DivRune.Mid), ""}
		preview = append(preview, _shell.Format(_strings.Join(frame, "\n"), _shell.Preset.Title, _shell.Style.AS_Bold))
	}
	for range framecount {
		frame := []string{"", _shell.Format(_shell.Divider(_shell.Canvas.DivRune.Top), _shell.Preset.Title, _shell.Style.AS_Underline), "", ""}
		preview = append(preview, _shell.Format(_strings.Join(frame, "\n"), _shell.Preset.Title, _shell.Style.AS_Bold))
	}
	for range framecount {
		line := "·" + _utils.String_PadBothSides("·", width-2) + "·"
		frame := []string{"", _shell.Divider(_shell.Canvas.DivRune.Btm), line, _shell.Divider(_shell.Canvas.DivRune.Top), ""}
		preview = append(preview, _shell.Format(_strings.Join(frame, "\n"), _shell.Preset.Title, _shell.Style.AS_Bold))
	}
	for range framecount {
		line := ">" + _utils.String_PadBothSides("-", width-2) + "<"
		frame := []string{"", _shell.Divider(_shell.Canvas.DivRune.Mid), line, _shell.Divider(_shell.Canvas.DivRune.Mid), ""}
		preview = append(preview, _shell.Format(_strings.Join(frame, "\n"), _shell.Preset.Title, _shell.Style.AS_Bold))
	}
	for range framecount {
		line := ">>" + _utils.String_PadBothSides("×", width-4) + "<<"
		frame := []string{"", _shell.Divider(_shell.Canvas.DivRune.Top), line, _shell.Divider(_shell.Canvas.DivRune.Btm), ""}
		preview = append(preview, _shell.Format(_strings.Join(frame, "\n"), _shell.Preset.Title, _shell.Style.AS_Bold))
	}

	rendered := []string{}
	str := "   " + input + "   "
	for len(str) > 3 {
		str = wrap_string(str)
		rendered = append([]string{_shell.Format(_shell.Tag.H1(str, []string{}), _shell.Preset.Title, _shell.Style.AS_Bold)}, rendered...)
	}

	return append(preview, rendered...)
}

func Title(str string, duration int, frames int) error {
	framesArr := title(str)
	return _shell.Render.Animate(framesArr, duration, frames)
}
