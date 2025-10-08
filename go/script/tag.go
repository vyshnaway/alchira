package script

import (
	_cache_ "main/cache"
	_Cursor_ "main/class/Cursor"
	_types_ "main/types"
	_utils_ "main/utils"
	_regexp_ "regexp"
	_slices_ "slices"
	_strings_ "strings"
)

type tag_Parse_retype struct {
	Ok                bool
	SelfClosed        bool
	ClassSynced       bool
	ClassesList       [][]string
	Locales           []string
	Attachments       []string
	NativeAttributes  map[string]string
	StyleDeclarations _types_.Script_RawStyle
}

func Tag_Scanner(
	fileData *_types_.File_Stash,
	classProps []string,
	action _types_.Script_Action,
	cursor *_Cursor_.Type,
) tag_Parse_retype {
	classesList := [][]string{}
	attachments := []string{}
	locales := []string{}
	braceTrack := []rune{}
	nativeAttributes := make(map[string]string)

	deviance := 0
	var attr _strings_.Builder
	var value _strings_.Builder
	var awaitClosure rune = 0
	ok := false
	isVal := false
	selfClosed := false
	classSynced := false
	fallbackAquired := false

	styleDeclarations := _types_.Script_RawStyle{
		Elid:       0,
		EndMarker:  0,
		Element:    "",
		Elvalue:    "",
		Innertext:  "",
		Scope:      _types_.Style_Type_Null,
		TagCount:   cursor.Active.Cycle + 1,
		RowIndex:   cursor.Active.RowMarker,
		ColIndex:   cursor.Active.ColMarker,
		SymClasses: make([]string, 0),
		Attributes: make(map[string]string),
		Comments:   make([]string, 0),
		Styles:     make(map[string]string),
	}

	for cursor.Streaming {
		ch, _ := cursor.Increment()

		if cursor.Active.Last != '\\' {
			if !fallbackAquired && cursor.Active.Next == '<' {
				fallbackAquired = true
				cursor.SaveFallback()
			}

			if awaitClosure == ch {
				deviance = len(braceTrack) - 1
				braceTrack = braceTrack[:deviance]
				if deviance > 0 {
					awaitClosure = braceTrack[deviance-1]
				} else {
					awaitClosure = 0
				}
			} else if !_slices_.Contains(_utils_.Refer.WatchQuotes, awaitClosure) {
				if _slices_.Contains(_utils_.Refer.OpenBraces, ch) ||
					_slices_.Contains(_utils_.Refer.WatchQuotes, ch) {
					awaitClosure = _utils_.Refer.BracePair[ch]
					braceTrack = append(braceTrack, awaitClosure)
					deviance = len(braceTrack)
				} else if awaitClosure != ch && _slices_.Contains(_utils_.Refer.CloseBraces, ch) {
					cursor.Increment()
					break
				}
			}

			if deviance == 0 && attr.Len() > 0 && _slices_.Contains([]rune{' ', '\n', '\r', '>', '\t'}, ch) {
				tr_Attr := _strings_.Trim(attr.String(), " \t\n")
				tr_Value := _strings_.Trim(value.String(), " \t\n")
				symclass_regex := _regexp_.MustCompile(`(?i)^[\w\-]+\$+[\w\-]+$`)
				if len(styleDeclarations.Element) == 0 {
					if elid, elok := _cache_.Root.CustomElements[tr_Attr]; elok {
						styleDeclarations.Elid = elid
					}
					styleDeclarations.Element = tr_Attr
					styleDeclarations.Elvalue = tr_Value
				} else if tr_Attr == "&" {
					if len(tr_Value) > 3 {
						for _, line := range _strings_.Split(tr_Value[1:len(tr_Value)-2], "\n") {
							commentTrimmed := _strings_.Trim(line, "\t ")
							if len(commentTrimmed) > 0 {
								styleDeclarations.Comments = append(styleDeclarations.Comments, commentTrimmed)
							}
						}
					}
				} else if symclass_regex.MatchString(tr_Attr) {
					if len(styleDeclarations.SymClasses) == 0 {
						if _strings_.Contains(tr_Attr, "$$$$") {
							styleDeclarations.Scope = _types_.Style_Type_Null
						} else if fileData.Manifest.Lookup.Type == _types_.File_Type_Artifact {
							styleDeclarations.Scope = _types_.Style_Type_Artifact
						} else if _strings_.Contains(tr_Attr, "$$$") {
							styleDeclarations.Scope = _types_.Style_Type_Public
						} else if _strings_.Contains(tr_Attr, "$$") {
							styleDeclarations.Scope = _types_.Style_Type_Global
						} else {
							styleDeclarations.Scope = _types_.Style_Type_Local
						}
						if styleDeclarations.Scope != _types_.Style_Type_Null {
							styleDeclarations.Styles[""] = tr_Value
						}
					}
					styleDeclarations.SymClasses = append(styleDeclarations.SymClasses, tr_Attr)
				} else if tr_Attr[0] == '&' {
					if len(tr_Value) > 0 {
						styleDeclarations.Styles[tr_Attr] = tr_Value
					}
				} else if _slices_.Contains(classProps, tr_Attr) {
					classSynced = true
					value_Parse_return := value_Parse(
						tr_Value,
						action,
						fileData,
						*cursor,
					)
					if len(value_Parse_return.Classlist) > 0 {
						classesList = append(classesList, value_Parse_return.Classlist)
					}
					if len(value_Parse_return.Attachments) > 0 {
						attachments = append(attachments, value_Parse_return.Attachments...)
					}
					if len(value_Parse_return.Locales) > 0 {
						locales = append(locales, value_Parse_return.Locales...)
					}
					nativeAttributes[tr_Attr] = value_Parse_return.Scribed
				} else {
					nativeAttributes[tr_Attr] = tr_Value
				}

				isVal = false
				attr.Reset()
				value.Reset()
			}
			if (deviance == 0 && (ch == '>' || ch == ';' || ch == ',' || ch == '<')) || deviance < 0 {
				if ch == '>' {
					ok = true 

				}
				break
			}
		}

		if deviance != 0 || (deviance == 0 && !_slices_.Contains([]rune{' ', '=', '\n', '\r', '\t', '>'}, ch)) {
			if isVal {
				value.WriteRune(ch)
			} else {
				attr.WriteRune(ch)
			}
		} else if deviance == 0 && ch == '=' {
			isVal = true
		}
	}

	styleDeclarations.EndMarker = cursor.Active.Marker
	if cursor.Active.Char == '>' {
		styleDeclarations.EndMarker++
	}

	if ok {
		cursor.Active.Cycle++
		selfClosed = cursor.Active.Last == '/'
	} else if fallbackAquired {
		cursor.LoadFallback()
	}

	return tag_Parse_retype{
		Ok:                ok,
		SelfClosed:        selfClosed,
		ClassSynced:       classSynced,
		ClassesList:       classesList,
		Locales:           locales,
		Attachments:       attachments,
		NativeAttributes:  nativeAttributes,
		StyleDeclarations: styleDeclarations,
	}
}
