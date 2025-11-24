package script

import (
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"
	_reader "main/package/reader"
	_string "strings"
)

type value_Parse_retype struct {
	OrderedClasses []string
	ScatterList    map[string]bool
	FinalList      map[string]bool
	Loadashes      map[string]bool
	Scribed        string
}

func Value_Parse(
	value string,
	action E_Method,
	fileData *_model.File_Stash,
	FileCursor *_reader.T_Reader,
	isWatching bool,
) value_Parse_retype {
	checkOp := func(last, ch byte) bool {
		opok := op_order == ch || ch == op_scatter || ch == op_finalize || ch == op_lodash
		if isWatching {
			return last != '\\' && opok
		}
		return last == '\\' && opok
	}

	loadashes := make(map[string]bool, 12)
	scatterList := make(map[string]bool, 12)
	finalList := make(map[string]bool, 12)
	orderedlist := make([]string, 0, 12)
	var entry _string.Builder

	awaitop := false
	streamed := value
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
		} else if checkOp(lastCh, ch) {
			awaitop = true
			waitop = ch
		}
		lastCh = ch
	}

	if action != E_Method_Read && action != E_Method_StripTag {
		var stream _string.Builder
		entry.Reset()
		waitop = 0
		lastCh = 0
		awaitop = false
		metafront := ""

		if action == E_Method_DebugHash {
			metafront = _fmt.Sprintf(
				"TAG%s:%d:%d__", fileData.DebugFront,
				FileCursor.Active.Row, FileCursor.Active.Col,
			)
		}
		orderedMapping := value_EvaluateIndexTraces(action, metafront, orderedlist, fileData.Cache.LocalMap)

		for marker := range valuelen {
			ch := value[marker]
			if awaitop {
				if ok := symclass_chars.Match([]byte{ch}); ok {
					entry.WriteByte(ch)
				} else {
					entrystring := entry.String()

					switch waitop {
					case op_lodash:
						if fileData.Cache.Loadashes[entrystring] {
							stream.WriteString(_fmt.Sprintf("%s%s", fileData.Label, entrystring))
							awaitop = false
						}
					case op_order:
						if action != E_Method_LoadHash {
							if found_Entry, found_Status := orderedMapping[entrystring]; found_Status {
								stream.WriteString(found_Entry)
								awaitop = false
							}
						}

					case op_scatter:
						if action != E_Method_LoadHash {
							if res := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); res.Index > 0 {
								if action == E_Method_DebugHash {
									classname := res.Data.SrcData.DebugScatterClass
									stream.WriteString(classname)
									_config.Style.Sandbox_Scattered[classname] = res.Index
								} else if _config.Static.PREVIEW {
									stream.WriteString(res.Data.SrcData.PreviewScatterClass)
								} else {
									stream.WriteString(res.Data.SrcData.PublishScatterClass)
								}
								awaitop = false
							}
						}
					case op_finalize:
						if action != E_Method_LoadHash {
							if res := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); res.Index > 0 {
								if action == E_Method_DebugHash {
									classname := res.Data.SrcData.DebugFinalClass
									stream.WriteString(classname)
									_config.Style.Sandbox_Final[classname] = res.Index
								} else if _config.Static.PREVIEW {
									stream.WriteString(res.Data.SrcData.PreviewFinalClass)
								} else {
									stream.WriteString(res.Data.SrcData.PublishFinalClass)
								}
								awaitop = false
							}
						}
					}

					if awaitop {
						stream.WriteByte(waitop)
						stream.WriteString(entrystring)
					}
					stream.WriteByte(ch)
					entry.Reset()
					waitop = 0
					awaitop = false
				}
			} else if checkOp(lastCh, ch) {
				awaitop = true
				waitop = ch
			} else {
				stream.WriteByte(ch)
			}
			lastCh = ch
		}

		streamed = stream.String()
	}

	return value_Parse_retype{
		OrderedClasses: orderedlist,
		ScatterList:    scatterList,
		FinalList:      finalList,
		Loadashes:      loadashes,
		Scribed:        streamed,
	}
}
