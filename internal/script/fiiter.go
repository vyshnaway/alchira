package script

import (
	_string "strings"
)

type value_ClassFilter_return struct {
	OrderedClasses []string
	ScatterList    map[string]bool
	FinalList      map[string]bool
	Loadashes      map[string]bool
}

func checkOpSlash(isWatching bool, last, ch byte) bool {
	opok := op_order == ch || ch == op_scatter || ch == op_finalize || ch == op_lodash
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
	valuelen := len(value)
	var waitop byte = 0
	var lastCh byte = 0
	for marker := range valuelen {
		ch := value[marker]
		if awaitop {
			if ok := symclass_chars.Match([]byte{ch}); ok {
				entry.WriteByte(ch)
			} else {
				entryString := entry.String()

				switch waitop {
				case op_order:
					orderedlist = append(orderedlist, entryString)
				case op_scatter:
					scatterList[entryString] = true
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
		FinalList:      finalList,
		Loadashes:      loadashes,
	}
}
