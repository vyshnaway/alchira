package script

import (
	_config "main/configs"
	_model "main/models"
	_reader "main/package/reader"
	_regexp "regexp"
	_slice "slices"
	_string "strings"
)

type E_Action int

const (
	E_Action_Read E_Action = iota
	E_Action_SandBox
	E_Action_BuildHash
	E_Action_DebugHash
)

type parse_return struct {
	Scribed      string
	ClassesList  [][]string
	StylesList   []*_model.T_RawStyle
	Attachments  map[string]bool
	Replacements []_model.File_TagReplacement
}

var replacementTags = _config.Static.ReplacementTags
var regexp_aftertagopen = _regexp.MustCompile(`(?i)[\w\-\!/]`)

func Rider(
	fileData *_model.File_Stash,
	action E_Action,
) parse_return {
	if action == E_Action_SandBox {
		_config.Style.PublishIndexMap = [][]_model.Style_ClassIndexTrace{}
	}

	fileData.StyleData.TagReplacements = []_model.File_TagReplacement{}
	replacements := make([]_model.File_TagReplacement, 0, 8)
	classesList := make([][]string, 0, 24)
	tagTrack := make([]*_model.T_RawStyle, 0, 24)
	stylesList := make([]*_model.T_RawStyle, 0, 24)
	attachments := make(map[string]bool, 24)

	var content string
	var stream _string.Builder
	if action == E_Action_Read {
		content = fileData.Content
		fileData.Midway = ""
	} else {
		content = fileData.Midway
	}
	fileData.Scratch = ""

	cursor := _reader.New(content)

	for cursor.Streaming {
		ch := cursor.Active.Char

		if cursor.Active.Last != '\\' && ch == '<' && regexp_aftertagopen.MatchString(string(cursor.Active.Next)) {
			subScribed := ""
			tagStart := cursor.Active.Idx
			result := Tag_Scanner(fileData, action, &cursor)
			fragment := string(cursor.Runes[tagStart:result.StyleDeclarations.EndMarker])
			hasDeclared := (len(result.StyleDeclarations.Styles) > 0 || len(result.StyleDeclarations.SymClasses) > 0)

			if result.Ok {
				classesList = append(classesList, result.ClassesList...)
				for _, a := range result.Attachments {
					attachments[a] = true
				}

				if hasDeclared {
					stylesList = append(stylesList, &result.StyleDeclarations)
				} else if elid, status := replacementTags[fragment]; status && len(tagTrack) == 0 && action != E_Action_Read {
					replacements = append(replacements, _model.File_TagReplacement{
						Loc:  stream.Len(),
						Elid: elid,
					})
					fragment = ""
				}

				for k, v := range result.StyleDeclarations.Styles {
					if len(v) > 2 {
						result.StyleDeclarations.Styles[k] = v[1 : len(v)-1]
					} else {
						delete(result.StyleDeclarations.Styles, k)
					}
				}

				if _, status := replacementTags[fragment]; (!status && result.ClassSynced) ||
					(action == E_Action_Read && hasDeclared) {
					if result.StyleDeclarations.Elid == 0 {
						var strbuild _string.Builder
						strbuild.WriteRune('<')
						strbuild.WriteString(result.StyleDeclarations.Element)
						if len(result.StyleDeclarations.Elvalue) > 0 {
							strbuild.WriteRune('=')
							strbuild.WriteString(result.StyleDeclarations.Elvalue)
						}
						for k, v := range result.NativeAttributes {
							strbuild.WriteRune(' ')
							strbuild.WriteString(k)
							if len(v) > 0 {
								strbuild.WriteRune('=')
								strbuild.WriteString(v)
							}
						}
						strbuild.WriteRune('>')
						subScribed = strbuild.String()
					}
				} else {
					subScribed = fragment
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
				} else if _slice.Contains(_config.Static.CustomTags, result.StyleDeclarations.Element) && hasDeclared {
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

	replacements = append(replacements, _model.File_TagReplacement{Loc: 0, Elid: 0})

	return parse_return{
		Replacements: replacements,
		Scribed:      stream.String(),
		ClassesList:  classesList,
		StylesList:   stylesList,
		Attachments:  attachments,
	}
}
