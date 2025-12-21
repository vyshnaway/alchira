package script

import (
	"main/package/reader"
	_string "strings"
)

type value_ClassFilter_return struct {
	OrderedClasses []string
	ScatterList    map[string]bool
	FinalList      map[string]bool
	Loadashes      map[string]bool
}

func checkOpSlash(isWatching bool, last, ch rune) bool {
	opok := op_mid == ch || ch == op_low || ch == op_top || ch == op_lodash
	if isWatching {
		return last != '\\' && opok
	}
	return last == '\\' && opok
}

func Value_ClassFilter(
	value string,
	isWatching bool,
) value_ClassFilter_return {

	loadashes := make(map[string]bool, 12)
	scatterList := make(map[string]bool, 12)
	finalList := make(map[string]bool, 12)
	orderedlist := make([]string, 0, 12)
	var entry _string.Builder

	awaitop := false
	nr := reader.New(value)
	var waitop rune = 0

	for nr.Streaming {
		ch := nr.Active.Char

		if awaitop {
			if ok := symlink_chars.Match([]byte{byte(ch)}); ok {
				entry.WriteRune(ch)
			} else {
				entryString := entry.String()

				switch waitop {
				case op_low:
					scatterList[entryString] = true
				case op_mid:
					orderedlist = append(orderedlist, entryString)
				case op_top:
					finalList[entryString] = true
				case op_lodash:
					loadashes[entryString] = true
				}

				awaitop = false
				waitop = 0
				entry.Reset()
			}
		} else if checkOpSlash(isWatching, nr.Active.Last, ch) {
			awaitop = true
			waitop = ch
		}
		nr.Increment()
	}

	return value_ClassFilter_return{
		OrderedClasses: orderedlist,
		ScatterList:    scatterList,
		FinalList:      finalList,
		Loadashes:      loadashes,
	}
}
