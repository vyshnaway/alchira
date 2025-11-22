package script

import (
	_json_ "encoding/json"
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"
	_reader "main/package/reader"
	_util "main/package/utils"
	_string "strings"
)

func value_EvaluateIndexTraces(
	action E_Method,
	metaFront string,
	classList []string,
	localClassMap _model.Style_ClassIndexMap,
) (ClassMap map[string]string) {
	indexArray := make([]int, 0, len(classList))
	classTrace := make([]_model.Style_ClassIndexTrace, 0, len(classList))

	for _, entry := range classList {
		found := _action.Index_Finder(entry, localClassMap)
		if found.Index > 0 {
			classTrace = append(classTrace, _model.Style_ClassIndexTrace{ClassName: entry, ClassIndex: found.Index})
			indexArray = append(indexArray, found.Index)
		}
	}

	classMap := make(map[string]string, len(classTrace))

	indexSetback := _util.Array_Setback(indexArray)
	if action == E_Method_BuildHash {
		json_Return, json_Error := _json_.Marshal(indexSetback)
		if json_Error == nil {
			dict_Return, dict_Status := _config.Style.ClassDictionary[string(json_Return)]
			if dict_Status {
				for _, trace := range classTrace {
					classMap[trace.ClassName] = dict_Return[trace.ClassIndex]
				}
			}
		}
	} else {
		temp_map := make([]_model.Style_ClassIndexTrace, 0, len(classTrace))

		if action == E_Method_DebugHash {
			for _, item := range classTrace {
				classdata := _action.Index_Fetch(item.ClassIndex)
				classname := _fmt.Sprintf("%s%s", metaFront, classdata.SrcData.DebugRapidClass)
				temp_map = append(temp_map, _model.Style_ClassIndexTrace{
					ClassName:  "." + classname,
					ClassIndex: item.ClassIndex,
				})
				classMap[item.ClassName] = _util.String_Filter(
					classname,
					[]rune{'/', '.', ':', '|', '$'},
					[]rune{'\\'},
					[]rune{},
				)
			}
		}

		if len(temp_map) > 0 {
			_config.Style.Publish_RigidTracks = append(_config.Style.Publish_RigidTracks, temp_map)
		}
	}

	return classMap
}

var op_order = byte(_config.Root.CustomOp["strict"])
var op_scatter = byte(_config.Root.CustomOp["attach"])
var op_finalize = byte(_config.Root.CustomOp["assign"])
var op_lodash = byte(_config.Root.CustomOp["lodash"])

type value_Parse_retype struct {
	OrderedClasses []string
	RapidClasses   map[string]bool
	FinalClasses   map[string]bool
	Loadashes      map[string]bool
	Scribed        string
}

func value_Parse(
	value string,
	action E_Method,
	fileData *_model.File_Stash,
	FileCursor *_reader.T_Reader,
	needsEscape bool,
) value_Parse_retype {
	checkEscape := func(char byte) bool {
		if needsEscape {
			return char == '\\'
		}
		return char != '\\'
	}

	loadashes := make(map[string]bool, 12)
	rapidClasses := make(map[string]bool, 12)
	finalClasses := make(map[string]bool, 12)
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
					rapidClasses[entryString] = true
				case op_finalize:
					finalClasses[entryString] = true
				case op_lodash:
					loadashes[entryString] = true
				}

				awaitop = false
				waitop = 0
				entry.Reset()
			}
		} else if checkEscape(lastCh) && ((!needsEscape && op_order == ch) ||
			ch == op_scatter || ch == op_finalize || ch == op_lodash) {
			awaitop = true
			waitop = ch
		}
		lastCh = ch
	}

	if action != E_Method_Read {
		var stream _string.Builder
		entry.Reset()
		waitop = 0
		lastCh = 0
		awaitop = false
		metafront := ""

		if action == E_Method_DebugHash {
			metafront = _fmt.Sprintf(
				"TAG%s\\:%d\\:%d__", fileData.DebugFront,
				FileCursor.Active.Row, FileCursor.Active.Col,
			)
		}
		orderedMapping := value_EvaluateIndexTraces(action, metafront, orderedlist, fileData.Style.LocalMap)

		for marker := range valuelen {
			ch := value[marker]
			if awaitop {
				if ok := symclass_chars.Match([]byte{ch}); ok {
					entry.WriteByte(ch)
				} else {
					entrystring := entry.String()

					switch waitop {
					case op_lodash:
						if fileData.Style.Loadashes[entrystring] {
							stream.WriteString(_fmt.Sprintf("%s%s", fileData.Label, entrystring))
							awaitop = false
						}
					case op_order:
						if action != E_Method_OnlyHash {
							if found_Entry, found_Status := orderedMapping[entrystring]; found_Status {
								stream.WriteString(found_Entry)
								awaitop = false
							}
						}

					case op_scatter:
						if action != E_Method_OnlyHash {
							if res := _action.Index_Finder(entrystring, fileData.Style.LocalMap); res.Index > 0 {
								if action == E_Method_DebugHash {
									stream.WriteString(_util.String_Filter(
										res.Data.SrcData.DebugRapidClass,
										[]rune{'/', '.', ':', '|', '$'},
										[]rune{'\\'},
										[]rune{},
									))
								} else {
									stream.WriteString(res.Data.SrcData.RapidClass)
								}
								awaitop = false
							}
						}
					case op_finalize:
						if action != E_Method_OnlyHash {
							if res := _action.Index_Finder(entrystring, fileData.Style.LocalMap); res.Index > 0 {
								if action == E_Method_DebugHash {
									stream.WriteString(_util.String_Filter(
										res.Data.SrcData.DebugFinalClass,
										[]rune{'/', '.', ':', '|', '$'},
										[]rune{'\\'},
										[]rune{},
									))
								} else {
									stream.WriteString(res.Data.SrcData.FinalClass)
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
				}
			} else if checkEscape(lastCh) && ((!needsEscape && op_order == ch) ||
				ch == op_scatter || ch == op_finalize || ch == op_lodash) {
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
		RapidClasses:   rapidClasses,
		FinalClasses:   finalClasses,
		Loadashes:      loadashes,
		Scribed:        streamed,
	}
}
