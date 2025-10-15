package play

import (
	_console "main/package/console"
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
	width := _console.Canvas.Width()

	for i := 0; i < framecount*2; i++ {
		frame := []string{"", "", _console.Divider(_console.Canvas.DivRune.Mid), ""}
		preview = append(preview, _console.Format(_strings.Join(frame, "\r\n"), _console.Preset.Title, _console.Style.AS_Bold))
	}
	for range framecount {
		frame := []string{"", _console.Format(_console.Divider(_console.Canvas.DivRune.Top), _console.Preset.Title, _console.Style.AS_Underline), "", ""}
		preview = append(preview, _console.Format(_strings.Join(frame, "\r\n"), _console.Preset.Title, _console.Style.AS_Bold))
	}
	for range framecount {
		line := "·" + _utils.String_PadBothSides("·", width-2) + "·"
		frame := []string{"", _console.Divider(_console.Canvas.DivRune.Btm), line, _console.Divider(_console.Canvas.DivRune.Top), ""}
		preview = append(preview, _console.Format(_strings.Join(frame, "\r\n"), _console.Preset.Title, _console.Style.AS_Bold))
	}
	for range framecount {
		line := ">" + _utils.String_PadBothSides("-", width-2) + "<"
		frame := []string{"", _console.Divider(_console.Canvas.DivRune.Mid), line, _console.Divider(_console.Canvas.DivRune.Mid), ""}
		preview = append(preview, _console.Format(_strings.Join(frame, "\r\n"), _console.Preset.Title, _console.Style.AS_Bold))
	}
	for range framecount {
		line := ">>" + _utils.String_PadBothSides("×", width-4) + "<<"
		frame := []string{"", _console.Divider(_console.Canvas.DivRune.Top), line, _console.Divider(_console.Canvas.DivRune.Btm), ""}
		preview = append(preview, _console.Format(_strings.Join(frame, "\r\n"), _console.Preset.Title, _console.Style.AS_Bold))
	}

	rendered := []string{}
	str := "   " + input + "   "
	for len(str) > 3 {
		str = wrap_string(str)
		rendered = append([]string{_console.Format(_console.Tag.H1(str, []string{}), _console.Preset.Title, _console.Style.AS_Bold)}, rendered...)
	}

	return append(preview, rendered...)
}

func Title(str string, duration int, frames int) error {
	framesArr := title(str)
	return _console.Render.Animate(framesArr, duration, frames)
}
