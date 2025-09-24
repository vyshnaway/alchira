package script

import (
	_json_ "encoding/json"
	_fmt_ "fmt"
	_cache_ "main/cache"
	_type_ "main/types"
	_util_ "main/util"
	_slices_ "slices"
	_strings_ "strings"
)

func value_EvaluateIndexTraces(
	action _type_.Script_Action,
	metaFront string,
	classList []string,
	localClassMap _type_.Style_ClassIndexMap,
) (ClassMap map[string]string) {
	classMap := make(map[string]string)
	indexArray := []int{}
	classTrace := []_type_.Style_ClassIndexTrace{}

	for _, entry := range classList {
		foundIndex, foundGroup := _cache_.Index_Find(entry, localClassMap)
		if foundGroup != _type_.Style_Type_Null {
			classTrace = append(classTrace, _type_.Style_ClassIndexTrace{ClassName: entry, ClassIndex: foundIndex})
			indexArray = append(indexArray, foundIndex)
		}
	}

	indexSetback := _util_.Array_Setback(indexArray)
	if action == _type_.Script_Action_Sync {
		json_Return, json_Error := _json_.Marshal(indexSetback)
		if json_Error == nil {
			dict_Return, dict_Status := _cache_.Class.ClassDictionary[string(json_Return)]
			if dict_Status {
				for _, trace := range classTrace {
					classMap[trace.ClassName] = dict_Return[trace.ClassIndex]
				}
			}
		}
	} else {
		if action == _type_.Script_Action_Watch {
			for index, item := range classTrace {
				classname := _fmt_.Sprintf("%s%d", metaFront, index)
				_cache_.Class.PublishIndexMap = append(_cache_.Class.PublishIndexMap, _type_.Style_ClassIndexTrace{
					ClassName:  "." + classname,
					ClassIndex: item.ClassIndex,
				})
				classMap[item.ClassName] = classname
			}
		}

		if action == _type_.Script_Action_Monitor {
			for _, item := range classTrace {
				classdata := _cache_.Index_Fetch(item.ClassIndex)
				classname := _fmt_.Sprintf("%s%s", metaFront, classdata.DebugClass)
				_cache_.Class.PublishIndexMap = append(_cache_.Class.PublishIndexMap, _type_.Style_ClassIndexTrace{
					ClassName:  "." + classname,
					ClassIndex: item.ClassIndex,
				})
				classMap[item.ClassName] = _util_.String_Filter(
					classname,
					[]rune{'/', '.', ':', '|', '$'},
					[]rune{'\\'},
					[]rune{},
				)
			}
		}
	}

	return classMap
}

type value_Parse_retype struct {
	Classlist   []string
	Attachments []string
	Scribed     string
}

func value_Parse(
	value string,
	action _type_.Script_Action,
	fileData _type_.File_Storage,
	FileCursor _type_.File_Position,
) value_Parse_retype {
	classlist := []string{}
	quotes := []rune{'\'', '`', '"'}
	attachments := []string{}

	var entry _strings_.Builder
	scribed := value
	activeQuote := ' '
	inQuote := false

	value += " "
	valuelen := len(value)
	for marker := 0; marker < valuelen; marker++ {
		ch := rune(value[marker])

		if inQuote {
			if ch == ' ' || ch == activeQuote {
				entrystring := entry.String()
				if rune(entrystring[0]) == _cache_.Root.CustomOperations["attach"] {
					attachments = append(attachments, entrystring[1:])
				} else if rune(entrystring[0]) == _cache_.Root.CustomOperations["assign"] {
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
		} else if _slices_.Contains(quotes, ch) {
			inQuote = true
			activeQuote = ch
		}
	}

	if action != _type_.Script_Action_Read {
		var scriber _strings_.Builder

		entry.Reset()
		activeQuote = ' '
		inQuote = false

		var metafront string
		switch action {
		case _type_.Script_Action_Monitor:
			metafront = _fmt_.Sprintf(
				"TAG%s\\:%d\\:%d__",
				fileData.DebugClassFront,
				FileCursor.RowMarker,
				FileCursor.ColMarker,
			)
		case _type_.Script_Action_Watch:
			metafront = _fmt_.Sprintf(
				"_%s_%d",
				fileData.Label,
				FileCursor.Cycle,
			)
		default:
			metafront = ""
		}

		classMap := value_EvaluateIndexTraces(action, metafront, classlist, fileData.StyleData.LocalClasses)

		for marker := 0; marker < valuelen; marker++ {
			ch := rune(value[marker])

			if inQuote {
				if ch == ' ' || ch == activeQuote {
					entrystring := entry.String()
					if rune(entrystring[0]) != _cache_.Root.CustomOperations["attach"] {
						if rune(entrystring[0]) == _cache_.Root.CustomOperations["assign"] {
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
				if _slices_.Contains(quotes, ch) {
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
