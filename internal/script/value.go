package script

import (
	_json_ "encoding/json"
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"
	_reader "main/package/reader"
	_util "main/package/utils"
	_slice "slices"
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
				classname := _fmt.Sprintf("%s%s", metaFront, classdata.SrcData.DebugSwiftClass)
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

var op_attach = byte(_config.Root.CustomOp["attach"])
var op_assign = byte(_config.Root.CustomOp["assign"])
var op_import = byte(_config.Root.CustomOp["import"])
var op_lodash = byte(_config.Root.CustomOp["lodash"])

type value_Parse_retype struct {
	OrderedClasses []string
	SwiftClasses   map[string]bool
	ForceClasses   map[string]bool
	Scribed        string
}

func value_Parse(
	value string,
	action E_Method,
	fileData *_model.File_Stash,
	FileCursor *_reader.T_Reader,
) value_Parse_retype {

	activeQuote := ' '
	scribed := value
	inQuote := false
	valuelen := len(value)
	quotes := []rune{'\'', '`', '"'}

	swiftClasses := make(map[string]bool, 12)
	forceClasses := make(map[string]bool, 12)
	orderedlist := make([]string, 0, 12)
	var entry _string.Builder

	var lastCh rune = 0
	for marker := range valuelen {
		ch := rune(value[marker])

		if inQuote {
			if entry.Len() > 0 && lastCh != '\\' && (ch == ' ' || ch == activeQuote) {
				entrystring := entry.String()
				switch entrystring[0] {
				case op_attach:
					swiftClasses[entrystring[1:]] = true
				case op_import:
					forceClasses[entrystring[1:]] = true
				case op_assign:
					orderedlist = append(orderedlist, entrystring[1:])
				}
				entry.Reset()
			} else {
				entry.WriteRune(ch)
			}
			if ch == activeQuote {
				inQuote = false
				activeQuote = ' '
			}
		} else if _slice.Contains(quotes, ch) {
			inQuote = true
			activeQuote = ch
		}

		lastCh = ch
	}

	if action != E_Method_Read {
		var scriber _string.Builder

		entry.Reset()
		activeQuote = ' '
		inQuote = false

		metafront := ""
		if action == E_Method_DebugHash {
			metafront = _fmt.Sprintf(
				"TAG%s\\:%d\\:%d__",
				fileData.DebugFront,
				FileCursor.Active.Row,
				FileCursor.Active.Col,
			)
		}

		orderedMapping := value_EvaluateIndexTraces(action, metafront, orderedlist, fileData.Style.LocalMap)

		var lastCh rune = 0
		for marker := range valuelen {
			ch := rune(value[marker])

			if inQuote {
				if lastCh != '\\' && (ch == ' ' || ch == activeQuote) {

          if entry.Len() > 0 {
            entrystring := entry.String()
						
            switch entrystring[0] {

						case op_lodash:
							scriber.WriteString(_fmt.Sprintf("%s%s", fileData.Label, entrystring[1:]))

						case op_assign:
							entrystring := entrystring[1:]
							found_Entry, found_Status := orderedMapping[entrystring]
							if found_Status {
								scriber.WriteString(found_Entry)
							} else {
								scriber.WriteString(entrystring)
							}

						case op_attach:
							entrystring := entrystring[1:]
							if res := _action.Index_Finder(entrystring, fileData.Style.LocalMap); res.Index > 0 {
								if action == E_Method_DebugHash {
									scriber.WriteString(_util.String_Filter(
										res.Data.SrcData.DebugSwiftClass,
										[]rune{'/', '.', ':', '|', '$'},
										[]rune{'\\'},
										[]rune{},
									))
								} else {
									scriber.WriteString(res.Data.SrcData.SwiftClass)
								}
							} else {
								scriber.WriteString(entrystring)
							}

						case op_import:
							entrystring := entrystring[1:]
							if res := _action.Index_Finder(entrystring, fileData.Style.LocalMap); res.Index > 0 {
								if action == E_Method_DebugHash {
									scriber.WriteString(_util.String_Filter(
										res.Data.SrcData.DebugForceClass,
										[]rune{'/', '.', ':', '|', '$'},
										[]rune{'\\'},
										[]rune{},
									))
								} else {
									scriber.WriteString(res.Data.SrcData.ForceClass)
								}
							} else {
								scriber.WriteString(entrystring)
							}

						default:
							scriber.WriteString(entrystring)

						}
					}
					scriber.WriteRune(ch)
					entry.Reset()
				} else {
					entry.WriteRune(ch)
				}
				if ch == activeQuote {
					inQuote = false
					activeQuote = ' '
				}
			} else {
				scriber.WriteRune(ch)
				if _slice.Contains(quotes, ch) {
					inQuote = true
					activeQuote = ch
				}
			}
			lastCh = ch
		}

		scribed = scriber.String()
	}

	return value_Parse_retype{
		OrderedClasses: orderedlist,
		SwiftClasses:   swiftClasses,
		ForceClasses:   forceClasses,
		Scribed:        scribed,
	}
}
