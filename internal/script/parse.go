package script

import (
	_config "main/configs"
	_model "main/models"
	_reader "main/package/reader"
	_map "maps"
	_regexp "regexp"
	_slice "slices"
	_string "strings"
)

type E_Method int

const (
	E_Method_Read E_Method = iota
	E_Method_BuildHash
	E_Method_DebugHash
)

type parse_return struct {
	Scribed      string
	RigidTracks  [][]string
	StylesList   []*_model.T_RawStyle
	SwiftAssign  map[string]bool
	ForceAssign  map[string]bool
	Replacements []_model.File_TagReplacement
}

var replacementTags = _config.Static.ReplacementTags
var regexp_aftertagopen = _regexp.MustCompile(`(?i)[\w\-\!/]`)

func Rider(
	fileData *_model.File_Stash,
	action E_Method,
) parse_return {

	fileData.Style.TagReplacements = []_model.File_TagReplacement{}
	replacements := make([]_model.File_TagReplacement, 0, 8)
	orderList := make([][]string, 0, 24)
	tagTrack := make([]*_model.T_RawStyle, 0, 24)
	stylesList := make([]*_model.T_RawStyle, 0, 24)
	swiftList := make(map[string]bool, 24)
	forceList := make(map[string]bool, 24)

	var content string
	var stream _string.Builder
	if action == E_Method_Read {
		content = fileData.Content
		fileData.Midway = ""
	} else {
		content = fileData.Midway
	}
	fileData.Scratch = ""

	cursor := _reader.New(content)

	for cursor.Streaming {

		if cursor.Active.Last != '\\' && cursor.Active.Char == '<' && regexp_aftertagopen.MatchString(string(cursor.Active.Next)) {
			tagStart := cursor.Active.Idx
			result := Tag_Scanner(fileData, action, &cursor)
			fragment := result.Fragment
			hasDeclared := (len(result.StyleDeclarations.Styles) > 0 || len(result.StyleDeclarations.SymClasses) > 0)

			if result.Ok {
				_map.Copy(swiftList, result.SwiftList)
				_map.Copy(forceList, result.ForceList)
				orderList = append(orderList, result.ClassesList...)
				for k, v := range result.StyleDeclarations.Styles {
					if len(v) > 2 {
						result.StyleDeclarations.Styles[k] = v[1 : len(v)-1]
					} else {
						delete(result.StyleDeclarations.Styles, k)
					}
				}

				if action == E_Method_Read {
					if hasDeclared {
						stylesList = append(stylesList, &result.StyleDeclarations)
					}
					if len(tagTrack) > 0 || result.StyleDeclarations.Elid > 0 {
						fragment = ""
					}
				} else if elid, status := replacementTags[fragment]; status {
					replacements = append(replacements, _model.File_TagReplacement{Loc: stream.Len(), Elid: elid})
					fragment = ""
				} 

				cursor.Increment()
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
				stream.WriteString(fragment)
			}

		} else {
			if len(tagTrack) == 0 {
				stream.WriteRune(cursor.Active.Char)
			}
			cursor.Increment()
		}
	}

	replacements = append(replacements, _model.File_TagReplacement{Loc: 0, Elid: 0})

	return parse_return{
		Replacements: replacements,
		Scribed:      stream.String(),
		RigidTracks:  orderList,
		StylesList:   stylesList,
		SwiftAssign:  swiftList,
		ForceAssign:  forceList,
	}
}
