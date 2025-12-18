package script

import (
	_config "main/configs"
	_model "main/models"
	_reader "main/package/reader"
	_util "main/package/utils"
	_map "maps"
	_regexp "regexp"
	_slice "slices"
	_string "strings"
)

type tag_Parse_retype struct {
	Ok                bool
	SelfClosed        bool
	ClassSynced       bool
	Fragment          string
	OrderedList       []string
	Loadashes         map[string]bool
	ScatteredList     map[string]bool
	FinalList         map[string]bool
	AppendsList       map[string]bool
	NativeAttributes  map[string]string
	StyleDeclarations _model.T_RawStyle
}

var symclass_regex = _regexp.MustCompile(`(?i)^[\w\-_]+\$+[\w\-]+$`)
var symclass_chars = _regexp.MustCompile(`[A-Za-z0-9/_\$\-]`)

func Tag_Scanner(
	fileData *_model.File_Stash,
	method E_Method,
	fileCursor *_reader.T_Reader,
	appendstack map[int]bool,
	orderedMapping map[string]string,
) tag_Parse_retype {
	orderedlist := []string{}
	appends := []string{}
	appendsList := make(map[string]bool, 4)
	scatterList := make(map[string]bool, 4)
	finalList := make(map[string]bool, 4)
	braceTrack := make([]rune, 0, 8)
	loadashes := make(map[string]bool, 12)
	nativeAttributes := make(map[string]string, 8)

	deviance := 0
	var awaitClosure rune = 0
	var attr _string.Builder
	var value _string.Builder
	ok := false
	isVal := false
	selfClosed := false
	classSynced := false
	fallbackAquired := false
	startpos := fileCursor.Active
	tagStart := fileCursor.Active.Idx

	styleDeclarations := _model.T_RawStyle{
		Elid:       0,
		EndMarker:  0,
		Element:    "",
		Elvalue:    "",
		Innertext:  "",
		Scope:      _model.Style_Type_Null,
		TagCount:   fileCursor.Active.Cycle + 1,
		SymClasses: make([]string, 0, 1),
		Attributes: make(map[string]string, 12),
		Comments:   make([]string, 0, 1),
		Styles:     make(map[string]string, 3),
	}

	var fragment, whitespace _string.Builder
	fragment.WriteRune('<')
	SaveToFrag := func(k, v string) {
		fragment.WriteString(k)
		if len(v) > 0 {
			fragment.WriteRune('=')
			fragment.WriteString(v)
		}
	}

	tracking := fileCursor.Active.Next != '!'

	for fileCursor.Streaming {
		ch, _ := fileCursor.Increment()

		if fileCursor.Active.Last != '\\' {
			if !fallbackAquired && fileCursor.Active.Next == '<' {
				fallbackAquired = true
				fileCursor.SaveFallback()
			}

			if tracking {
				if awaitClosure != 0 && awaitClosure == ch {
					deviance = len(braceTrack) - 1
					braceTrack = braceTrack[:deviance]
					if deviance > 0 {
						awaitClosure = braceTrack[deviance-1]
					} else {
						awaitClosure = 0
					}
				} else if !_slice.Contains(_util.Refer.WatchQuotes, awaitClosure) {
					if _slice.Contains(_util.Refer.OpenBraces, ch) ||
						_slice.Contains(_util.Refer.WatchQuotes, ch) {
						awaitClosure = _util.Refer.BracePair[ch]
						braceTrack = append(braceTrack, awaitClosure)
						deviance = len(braceTrack)
					} else if awaitClosure != ch && _slice.Contains(_util.Refer.CloseBraces, ch) {
						fileCursor.Increment()
						break
					}
				}
			}

			if deviance == 0 && attr.Len() > 0 && _slice.Contains([]rune{' ', '\n', '\r', '>', '\t'}, ch) {
				tr_Attr := _string.Trim(attr.String(), " \t\r\n")
				tr_Value := _string.Trim(value.String(), " \t\r\n")

				if len(styleDeclarations.Element) == 0 {
					if elid, elok := _config.Root.CustomTags[tr_Attr]; elok {
						styleDeclarations.Elid = elid
					}
					styleDeclarations.Element = tr_Attr
					styleDeclarations.Elvalue = tr_Value
					SaveToFrag(tr_Attr, tr_Value)

				} else if styleDeclarations.Element[0] != '!' {
					if whitespace.Len() > 0 {
						fragment.WriteString(whitespace.String())
						whitespace.Reset()
					} else {
						fragment.WriteString(" ")
					}

					if tr_Attr == "&" {
						if len(tr_Value) > 3 {
							for _, line := range _string.Split(tr_Value[1:len(tr_Value)-2], "\r\n") {
								commentTrimmed := _string.Trim(line, "\t ")
								if len(commentTrimmed) > 0 {
									styleDeclarations.Comments = append(styleDeclarations.Comments, commentTrimmed)
								}
							}
						}
					} else if symclass_regex.MatchString(tr_Attr) {
						if len(styleDeclarations.SymClasses) == 0 {
							if _string.Contains(tr_Attr, "$$$$") {
								styleDeclarations.Scope = _model.Style_Type_Null
							} else if fileData.Cache.Type == _model.File_Type_Artifact {
								styleDeclarations.Scope = _model.Style_Type_Artifact
							} else if _string.Contains(tr_Attr, "$$$") {
								styleDeclarations.Scope = _model.Style_Type_Public
							} else if _string.Contains(tr_Attr, "$$") {
								styleDeclarations.Scope = _model.Style_Type_Global
							} else {
								styleDeclarations.Scope = _model.Style_Type_Local
							}
							if styleDeclarations.Scope != _model.Style_Type_Null {
								styleDeclarations.Styles[""] = tr_Value
							}
						}
						styleDeclarations.SymClasses = append(styleDeclarations.SymClasses, tr_Attr)
					} else if _string.HasSuffix(tr_Attr, "&") {
						if len(tr_Value) > 0 {
							styleDeclarations.Styles[tr_Attr] = tr_Value
						}
					} else {
						classSynced = true
						isWatching := _slice.Contains(fileData.WatchAttrs, tr_Attr)
						scribed := tr_Value
						if method == E_Method_Strip || method == E_Method_Read {
							value_Parse_return := Value_ClassFilter(tr_Value, isWatching)
							_map.Copy(loadashes, value_Parse_return.Loadashes)
							_map.Copy(scatterList, value_Parse_return.ScatterList)
							_map.Copy(appendsList, value_Parse_return.AppendsList)
							_map.Copy(finalList, value_Parse_return.FinalList)
							orderedlist = append(orderedlist, value_Parse_return.OrderedClasses...)
						} else {

							scribed_, append_ := Value_Builder(
								tr_Value,
								method,
								fileData,
								fileCursor,
								isWatching,
								orderedMapping,
								appendstack,
							)
							scribed = scribed_
							appends = append(appends, append_...)
						}
						nativeAttributes[tr_Attr] = scribed
						SaveToFrag(tr_Attr, scribed)
					}
				}

				isVal = false
				attr.Reset()
				value.Reset()
			}
			if (deviance == 0 && (ch == '>' || ch == ';' || ch == ',' || ch == '<')) || deviance < 0 {
				if ch == '>' {
					fragment.WriteString(whitespace.String())
					fragment.WriteRune('>')
					ok = true
				}
				break
			}
		}

		if deviance == 0 && _slice.Contains([]rune{' ', '\n', '\r', '\t'}, ch) {
			whitespace.WriteRune(ch)
		}
		if deviance != 0 || (deviance == 0 && !_slice.Contains([]rune{' ', '=', '\n', '\r', '\t', '>'}, ch)) {
			if isVal {
				value.WriteRune(ch)
			} else {
				attr.WriteRune(ch)
			}
		} else if deviance == 0 && ch == '=' {
			isVal = true
		}
	}

	var fragString = ""
	styleDeclarations.EndMarker = fileCursor.Active.Idx

	if ok {
		if fileCursor.Active.Char == '>' {
			styleDeclarations.EndMarker++
		}

		fragString = fragment.String()
		if fragString[1] == '!' {
			fragString = string(fileCursor.Slice(tagStart, styleDeclarations.EndMarker))
		} else {
			fileCursor.Active.Cycle++
			selfClosed = fileCursor.Active.Last == '/'
			if (method == E_Method_DebugHash ||
				method == E_Method_PreviewHash ||
				method == E_Method_PublishHash) && selfClosed && styleDeclarations.Elid == _config.Root.CustomTags["sketch"] {
				fragment.Reset()
			}
			for _, a := range appends {
				fragment.WriteString(a)
			}
			fragString = fragment.String()
			styleDeclarations.Range = _reader.T_Range{Data: []string{}, Start: startpos, End: fileCursor.Active}
		}

	} else {
		fragString = string(fileCursor.Slice(tagStart, styleDeclarations.EndMarker))
		if fallbackAquired {
			fileCursor.LoadFallback()
		}
	}

	return tag_Parse_retype{
		Ok:                ok,
		AppendsList:       appendsList,
		Loadashes:         loadashes,
		FinalList:         finalList,
		ScatteredList:     scatterList,
		Fragment:          fragString,
		SelfClosed:        selfClosed,
		ClassSynced:       classSynced,
		OrderedList:       orderedlist,
		NativeAttributes:  nativeAttributes,
		StyleDeclarations: styleDeclarations,
	}
}
