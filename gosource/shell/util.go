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

func util_PadBothSides(str string, totalLength int) string {
    totalPadding := totalLength - len(str)
    if totalPadding <= 0 {
        return str
    }
    start := totalPadding / 2
    end := totalPadding - start
    return _strings_.Repeat(" ", start) + str + _strings_.Repeat(" ", end)
}