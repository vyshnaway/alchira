package script

import (
	_cache_ "main/cache"
	_Cursor_ "main/class/Cursor"
	_types_ "main/types"
	_regexp_ "regexp"
	_slices_ "slices"
	_strings_ "strings"
)

var initStatus bool
var customElements []string
var replacementTags map[string]int

type parse_return struct {
	Scribed     string
	ClassesList [][]string
	StylesList  []_types_.Script_RawStyle
	Attachments []string
}

func Parse(
	fileData *_types_.File_Stash,
	classProps []string,
	action _types_.Target_Action,
) parse_return {
	if !initStatus {
		for k, v := range _cache_.Root.CustomElements {
			customElements = append(customElements, k)
			replacementTags["<!-- "+k+" -->"] = v
			replacementTags["<"+k+" />"] = v
			replacementTags["<"+k+"/>"] = v
		}
	}
	initStatus = true

	fileData.StyleData.TagReplacements = []_types_.File_TagReplacement{}
	tagTrack := []*_types_.Script_RawStyle{}
	classesList := [][]string{}
	attachments := []string{}
	stylesList := []_types_.Script_RawStyle{}

	var content string
	var stream _strings_.Builder
	if action == _types_.Target_Action_Read {
		content = fileData.Content
	} else {
		content = fileData.Midway
	}

	cursor := _Cursor_.Construct(content)
	for ch, streaming := cursor.Active.Char, cursor.Streaming; streaming; ch, streaming = cursor.Increment() {

		regexp_aftertagopen := _regexp_.MustCompile(`(?i)[\w\-\!]`)
		if cursor.Active.Last != '\\' && ch == '<' && regexp_aftertagopen.MatchString(string(cursor.Active.Next)) {
			subScribed := ""
			tagStart := cursor.Active.Marker
			result := tag_Scanner(fileData, classProps, action, &cursor)
			fragment := string(cursor.Runes[tagStart:result.StyleDeclarations.EndMarker])
			hasDeclared := len(result.StyleDeclarations.Styles) > 0 || len(result.StyleDeclarations.Symclasses) > 0

			if result.Ok {
				classesList = append(classesList, result.ClassesList...)
				attachments = append(attachments, result.Attachments...)

				if hasDeclared {
					stylesList = append(stylesList, result.StyleDeclarations)
				} else if elid, status := replacementTags[fragment]; status && len(tagTrack) == 0 {
					fileData.StyleData.TagReplacements = append(fileData.StyleData.TagReplacements, _types_.File_TagReplacement{
						Loc:  stream.Len(),
						Elid: elid,
					})
				}

				for k, v := range result.StyleDeclarations.Styles {
					if len(v) > 2 {
						result.StyleDeclarations.Styles[k] = v[1 : len(v)-1]
					} else {
						result.StyleDeclarations.Styles[k] = ""
					}
				}

				if action == _types_.Target_Action_Read {
					if hasDeclared {
						if result.StyleDeclarations.Elid == 0 {
							var stash _strings_.Builder
							stash.WriteString(result.StyleDeclarations.Element)
							if len(result.StyleDeclarations.Elvalue) > 0 {
								stash.WriteString(result.StyleDeclarations.Elvalue)
							}
							for k, v := range result.NativeAttributes {
								if len(v) > 0 {
									stash.WriteString(k + "=" + v)
								} else {
									stash.WriteString(k)
								}
							}
							subScribed = "<" + stash.String() + ">"
						}
					} else {
						subScribed = fragment
					}
				} else if _, status := replacementTags[fragment]; !status {
					if result.ClassSynced {
						subScribed = fragment
					} else {
						var stash _strings_.Builder
						stash.WriteString(result.StyleDeclarations.Element)
						if len(result.StyleDeclarations.Elvalue) > 0 {
							stash.WriteString(result.StyleDeclarations.Elvalue)
						}
						for k, v := range result.NativeAttributes {
							if len(v) > 0 {
								stash.WriteString(k + "=" + v)
							} else {
								stash.WriteString(k)
							}
						}
						subScribed = "<" + stash.String() + ">"
					}
				}

				cursor.Increment()
			} else {
				subScribed += fragment
			}

			exitedNow := false
			if !result.SelfClosed && result.Ok {
				if result.StyleDeclarations.Element[0] == '/' {
					element := result.StyleDeclarations.Element[1:]
					if len(tagTrack) != 0 {
						track := tagTrack[len(tagTrack)-1]
						tagTrack = tagTrack[:len(tagTrack)-1]
						if track.Element == element {
							track.Innertext = content[track.EndMarker:tagStart]
							exitedNow = true
						} else {
							tagTrack = append(tagTrack, track)
						}
					}
				} else if _slices_.Contains(customElements, result.StyleDeclarations.Element) && hasDeclared {
					result.StyleDeclarations.Attributes = result.NativeAttributes
					tagTrack = append(tagTrack, &result.StyleDeclarations)
				}
			}

			if len(tagTrack) == 0 && !exitedNow {
				stream.WriteString(subScribed)
			}
		} else {
			cursor.Increment()
			if len(tagTrack) == 0 {
				stream.WriteRune(ch)
			}
		}
	}

	fileData.StyleData.TagReplacements = append(fileData.StyleData.TagReplacements, _types_.File_TagReplacement{Loc: 0, Elid: 0})

	return parse_return{
		Scribed:     stream.String(),
		ClassesList: classesList,
		StylesList:  stylesList,
		Attachments: attachments,
	}
}
