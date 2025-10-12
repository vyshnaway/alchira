package script

import (
	_config "main/configs"
	_model "main/models"
	_reader "main/package/reader"
	_util "main/package/utils"
	_regexp "regexp"
	_slice "slices"
	_string "strings"
)

type tag_Parse_retype struct {
	Ok                bool
	SelfClosed        bool
	ClassSynced       bool
	ClassesList       [][]string
	Locales           []string
	Attachments       []string
	NativeAttributes  map[string]string
	StyleDeclarations T_RawStyle
}

var symclass_regex = _regexp.MustCompile(`(?i)^[\w\-]+\$+[\w\-]+$`)

func Tag_Scanner(
	fileData *_model.File_Stash,
	classProps []string,
	action E_Action,
	cursor *_reader.Type,
) tag_Parse_retype {
	classesList := [][]string{}
	attachments := []string{}
	locales := []string{}
	braceTrack := []rune{}
	nativeAttributes := make(map[string]string)

	deviance := 0
	var attr _string.Builder
	var value _string.Builder
	var awaitClosure rune = 0
	ok := false
	isVal := false
	selfClosed := false
	classSynced := false
	fallbackAquired := false

	styleDeclarations := T_RawStyle{
		Elid:       0,
		EndMarker:  0,
		Element:    "",
		Elvalue:    "",
		Innertext:  "",
		Scope:      _model.Style_Type_Null,
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
					if elid, elok := _config.Root.CustomElements[tr_Attr]; elok {
						styleDeclarations.Elid = elid
					}
					styleDeclarations.Element = tr_Attr
					styleDeclarations.Elvalue = tr_Value
				} else if tr_Attr == "&" {
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
						} else if fileData.Manifest.Lookup.Type == _model.File_Type_Artifact {
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
				} else if _slice.Contains(classProps, tr_Attr) {
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
