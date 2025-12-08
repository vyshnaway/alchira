package script

import (
	_string "strings"
)

type value_ClassFilter_return struct {
	OrderedClasses []string
	ScatterList    map[string]bool
	AppendsList    map[string]bool
	FinalList      map[string]bool
	Loadashes      map[string]bool
}

func checkOpSlash(isWatching bool, last, ch rune) bool {
	opok := op_order == ch || ch == op_scatter || ch == op_finalize || ch == op_lodash || ch == op_append
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
	appendsList := make(map[string]bool, 12)
	scatterList := make(map[string]bool, 12)
	finalList := make(map[string]bool, 12)
	orderedlist := make([]string, 0, 12)
	var entry _string.Builder

	awaitop := false
	runes := []rune(value)
	valuelen := len(value)
	var waitop rune = 0
	var lastCh rune = 0
	for marker := range valuelen {
		ch := runes[marker]
		if awaitop {
			if ok := symclass_chars.Match([]byte{byte(ch)}); ok {
				entry.WriteRune(ch)
			} else {
				entryString := entry.String()

				switch waitop {
				case op_append:
					appendsList[entryString] = true
				case op_scatter:
					scatterList[entryString] = true
				case op_order:
					orderedlist = append(orderedlist, entryString)
				case op_finalize:
					finalList[entryString] = true
				case op_lodash:
					loadashes[entryString] = true
				}

				awaitop = false
				waitop = 0
				entry.Reset()
			}
		} else if checkOpSlash(isWatching, lastCh, ch) {
			awaitop = true
			waitop = ch
		}
		lastCh = ch
	}

	return value_ClassFilter_return{
		OrderedClasses: orderedlist,
		ScatterList:    scatterList,
		AppendsList:    appendsList,
		FinalList:      finalList,
		Loadashes:      loadashes,
	}
}
