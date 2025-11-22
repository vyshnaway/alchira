package script

import (
	_config "main/configs"
	_action "main/internal/action"
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
	E_Method_Strip
	E_Method_OnlyHash
	E_Method_BuildHash
	E_Method_DebugHash
)

type parse_return struct {
	Scribed      string
	RigidTracks  [][]string
	StylesList   []*_model.T_RawStyle
	RapidAssign  map[string]bool
	FinalAssign  map[string]bool
	Replacements []_model.File_TagReplacement
}

var replacementTags = _config.Static.ReplacementTags
var regexp_aftertagopen = _regexp.MustCompile(`(?i)[\w\-\!/]`)

func Rider(
	fileData *_model.File_Stash,
	method E_Method,
) parse_return {

	fileData.Cache.TagReplacements = []_model.File_TagReplacement{}
	replacements := make([]_model.File_TagReplacement, 0, 8)
	orderList := make([][]string, 0, 24)
	tagTrack := make([]*_model.T_RawStyle, 0, 24)
	stylesList := make([]*_model.T_RawStyle, 0, 24)
	rapidList := make(map[string]bool, 24)
	finalList := make(map[string]bool, 24)
	loadashes := make(map[string]bool, 24)

	var content string
	var stream _string.Builder
	if method == E_Method_Read || method == E_Method_Strip {
		content = fileData.Content
		fileData.Midway = ""
	} else {
		content = fileData.Midway
	}
	fileData.Scratch = ""

	cursor := _reader.New(content + " ")
	var entry _string.Builder
	awaitop := false
	incFlag := true
	var waitop byte = 0

	for cursor.Streaming {
		ch := cursor.Active.Char
		by := byte(ch)

		if cursor.Active.Last != '\\' && ch == '<' && regexp_aftertagopen.MatchString(string(cursor.Active.Next)) {
			tagStart := cursor.Active.Idx
			result := Tag_Scanner(fileData, method, &cursor)
			fragment := result.Fragment
			hasDeclared := (len(result.StyleDeclarations.Styles) > 0 || len(result.StyleDeclarations.SymClasses) > 0)

			exitedNow := false
			if result.Ok {
				_map.Copy(rapidList, result.RapidList)
				_map.Copy(finalList, result.FinalList)
				_map.Copy(loadashes, result.Loadashes)
				orderList = append(orderList, result.ClassesList...)
				for k, v := range result.StyleDeclarations.Styles {
					if len(v) > 2 {
						result.StyleDeclarations.Styles[k] = v[1 : len(v)-1]
					} else {
						delete(result.StyleDeclarations.Styles, k)
					}
				}

				if method == E_Method_Read {
					if hasDeclared {
						stylesList = append(stylesList, &result.StyleDeclarations)
					}
					if len(tagTrack) > 0 || (result.StyleDeclarations.Elid > 0 && hasDeclared) {
						fragment = ""
					}
				} else if elid, status := replacementTags[fragment]; status {
					replacements = append(replacements, _model.File_TagReplacement{Loc: stream.Len(), Elid: elid})
					fragment = ""
				} else if len(tagTrack) > 0 || (result.StyleDeclarations.Elid > 0 && hasDeclared) {
					fragment = ""
				}

				if !result.SelfClosed {
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
			} else {
				incFlag = false
			}

			if len(tagTrack) == 0 && !exitedNow {
				stream.WriteString(fragment)
			}
			awaitop = false
		} else if method != E_Method_Strip && awaitop {
			if ok := symclass_chars.Match([]byte{by}); ok {
				entry.WriteByte(by)
			} else {
				entrystring := entry.String()

				switch waitop {
				case op_lodash:
					if method != E_Method_Read && fileData.Cache.Loadashes[entrystring] {
						stream.WriteString(fileData.Label)
						stream.WriteString(entrystring)
						awaitop = false
					}

				case op_scatter:
					if method == E_Method_Read {
						rapidList[entrystring] = true
					} else if i := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); i.Index > 0 && method != E_Method_OnlyHash {
						if method == E_Method_DebugHash {
							stream.WriteString(i.Data.SrcData.DebugScatterClass)
						} else {
							stream.WriteString(i.Data.SrcData.ScatterClass)
						}
						awaitop = false
					}

				case op_finalize:
					if method == E_Method_Read {
						finalList[entrystring] = true
					} else if i := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); i.Index > 0 && method != E_Method_OnlyHash {
						if method == E_Method_DebugHash {
							stream.WriteString(i.Data.SrcData.DebugFinalClass)
						} else {
							stream.WriteString(i.Data.SrcData.FinalClass)
						}
						awaitop = false
					}
				}

				if awaitop {
					stream.WriteByte(waitop)
					stream.WriteString(entrystring)
				}
				stream.WriteByte(by)
				entry.Reset()
				waitop = 0
				awaitop = false
			}
		} else if method != E_Method_Strip &&
			cursor.Active.Last == '\\' &&
			(by == op_scatter || by == op_finalize || by == op_lodash) {
			awaitop = true
			waitop = by
		} else {
			if len(tagTrack) == 0 {
				stream.WriteRune(cursor.Active.Char)
			}
		}

		if incFlag {
			cursor.Increment()
		}
		incFlag = true
	}

	replacements = append(replacements, _model.File_TagReplacement{Loc: 0, Elid: 0})

	if method == E_Method_Read {
		fileData.Cache.Loadashes = loadashes
	}
	return parse_return{
		Replacements: replacements,
		Scribed:      stream.String(),
		RigidTracks:  orderList,
		StylesList:   stylesList,
		RapidAssign:  rapidList,
		FinalAssign:  finalList,
	}
}
