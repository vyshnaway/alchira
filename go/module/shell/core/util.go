package shell

import(
	_strings_ "strings"
)

func util_PadEnd(s string, width int, padChar rune) string {
    if len(s) >= width {
        return s
    }
    return s + _strings_.Repeat(string(padChar), width-len(s))
}

func util_AbsRowShift(x int) int {
    if x < 0 {
        return -x
    }
    return x
}
