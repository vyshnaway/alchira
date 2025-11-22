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
	ClassesList       [][]string
	Loadashes         map[string]bool
	RapidList         map[string]bool
	FinalList         map[string]bool
	NativeAttributes  map[string]string
	StyleDeclarations _model.T_RawStyle
}

var symclass_regex = _regexp.MustCompile(`(?i)^[\w\-_]+\$+[\w\-]+$`)
var symclass_chars = _regexp.MustCompile(`[A-Za-z0-9/_\$\-]`)

func Tag_Scanner(
	fileData *_model.File_Stash,
	method E_Method,
	cursor *_reader.T_Reader,
) tag_Parse_retype {
	classesList := make([][]string, 0, 1)
	rapidList := make(map[string]bool, 4)
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
	startpos := cursor.Active
	tagStart := cursor.Active.Idx

	styleDeclarations := _model.T_RawStyle{
		Elid:       0,
		EndMarker:  0,
		Element:    "",
		Elvalue:    "",
		Innertext:  "",
		Scope:      _model.Style_Type_Null,
		TagCount:   cursor.Active.Cycle + 1,
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

	for cursor.Streaming {
		ch, _ := cursor.Increment()

		if cursor.Active.Last != '\\' {
			if !fallbackAquired && cursor.Active.Next == '<' {
				fallbackAquired = true
				cursor.SaveFallback()
			}

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
					cursor.Increment()
					break
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
							} else if fileData.Lookup.Type == _model.File_Type_Artifact {
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
						value_Parse_return := Value_Parse(
							tr_Value,
							method,
							fileData,
							cursor,
							!isWatching,
						)
						_map.Copy(rapidList, value_Parse_return.RapidClasses)
						_map.Copy(finalList, value_Parse_return.FinalClasses)
						if isWatching {
							if len(value_Parse_return.OrderedClasses) > 0 {
								classesList = append(classesList, value_Parse_return.OrderedClasses)
							}
							_map.Copy(loadashes, value_Parse_return.Loadashes)
						}
						nativeAttributes[tr_Attr] = value_Parse_return.Scribed
						SaveToFrag(tr_Attr, value_Parse_return.Scribed)
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
	styleDeclarations.EndMarker = cursor.Active.Idx

	if ok {
		if cursor.Active.Char == '>' {
			styleDeclarations.EndMarker++
		}
		fragString = fragment.String()
		if fragString[1] == '!' {
			fragString = string(cursor.Runes[tagStart:styleDeclarations.EndMarker])
		} else {
			cursor.Active.Cycle++
			selfClosed = cursor.Active.Last == '/'
			styleDeclarations.Range = _reader.T_Range{Data: []string{}, Start: startpos, End: cursor.Active}
		}

	} else {
		fragString = string(cursor.Runes[tagStart:styleDeclarations.EndMarker])
		if fallbackAquired {
			cursor.LoadFallback()
		}
	}

	return tag_Parse_retype{
		Ok:                ok,
		Loadashes:         loadashes,
		FinalList:         finalList,
		RapidList:         rapidList,
		Fragment:          fragString,
		SelfClosed:        selfClosed,
		ClassSynced:       classSynced,
		ClassesList:       classesList,
		NativeAttributes:  nativeAttributes,
		StyleDeclarations: styleDeclarations,
	}
}
