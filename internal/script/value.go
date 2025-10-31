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
	action E_Action,
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
	if action == E_Action_BuildHash {
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

		if action == E_Action_DebugHash {
			for _, item := range classTrace {
				classdata := _action.Index_Fetch(item.ClassIndex)
				classname := _fmt.Sprintf("%s%s", metaFront, classdata.SrcData.DebugClass)
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
			_config.Style.PublishIndexMap = append(_config.Style.PublishIndexMap, temp_map)
		}
	}

	return classMap
}

var op_attach = _config.Root.CustomOps["attach"]
var op_assign = _config.Root.CustomOps["assign"]
var op_lodash = _config.Root.CustomOps["lodash"]

type value_Parse_retype struct {
	Classlist   []string
	Attachments []string
	Scribed     string
}

func value_Parse(
	value string,
	action E_Action,
	fileData *_model.File_Stash,
	FileCursor _reader.Type,
) value_Parse_retype {

	value += " "
	activeQuote := ' '
	scribed := value
	inQuote := false
	valuelen := len(value)
	quotes := []rune{'\'', '`', '"'}

	classlist := make([]string, 0, 12)
	attachments := make([]string, 0, 8)
	var entry _string.Builder

	for marker := range valuelen {
		ch := rune(value[marker])

		if inQuote {
			if (ch == ' ' || ch == activeQuote) && entry.Len() > 0 {
				entrystring := entry.String()
				if rune(entrystring[0]) == op_attach {
					attachments = append(attachments, entrystring[1:])
				} else if rune(entrystring[0]) == op_assign {
					classlist = append(classlist, entrystring[1:])
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
	}

	if action != E_Action_Read {
		var scriber _string.Builder

		entry.Reset()
		activeQuote = ' '
		inQuote = false

		metafront := ""
		if action == E_Action_DebugHash {
			metafront = _fmt.Sprintf(
				"TAG%s\\:%d\\:%d__",
				fileData.DebugFront,
				FileCursor.Active.RowMarker,
				FileCursor.Active.ColMarker,
			)
		}

		classMap := value_EvaluateIndexTraces(action, metafront, classlist, fileData.StyleData.LocalMap)

		for marker := range valuelen {
			ch := rune(value[marker])

			if inQuote {
				if ch == ' ' || ch == activeQuote {
					entrystring := entry.String()
					if entry.Len() > 0 && rune(entrystring[0]) != op_attach {
						if rune(entrystring[0]) == op_lodash {
							scriber.WriteString(_fmt.Sprintf("%s%s", fileData.Label, entrystring[1:]))
						} else if rune(entrystring[0]) == op_assign {
							entrystring := entrystring[1:]
							found_Entry, found_Status := classMap[entrystring]
							if found_Status {
								scriber.WriteString(found_Entry)
							} else {
								scriber.WriteString(entrystring)
							}
						} else {
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
		}

		scribed = scriber.String()
	}

	return value_Parse_retype{
		Classlist:   classlist,
		Attachments: attachments,
		Scribed:     scribed,
	}
}
