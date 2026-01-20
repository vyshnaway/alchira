package script

import (
	_fmt "fmt"
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
	E_Method_LoadHash
	E_Method_DebugHash
	E_Method_PreviewHash
	E_Method_PublishHash
)

type parse_return struct {
	LowRefs      map[string]bool
	MidRefs      [][]string
	MacRefs      map[string]bool
	TopRefs      map[string]bool
	Scribed      string
	StylesList   []*_model.T_RawStyle
	Replacements []_model.File_TagReplacement
}

var replacementTags = _config.Static.ReplacementTags
var regexp_aftertagopen = _regexp.MustCompile(`(?i)[\w\-\!/]`)

func Rider(
	fileData *_model.File_Stash,
	method E_Method,
	appendstack map[int]bool,
) parse_return {

	fileData.Cache.TagReplacements = []_model.File_TagReplacement{}
	replacements := make([]_model.File_TagReplacement, 0, 8)
	orderList := make([][]string, 0, 24)
	tagTrack := make([]*_model.T_RawStyle, 0, 24)
	stylesList := make([]*_model.T_RawStyle, 0, 24)
	scatteredList := make(map[string]bool, 24)
	finalList := make(map[string]bool, 24)
	appendsList := make(map[string]bool, 24)
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

	cursor := _reader.New(content)
	var entry _string.Builder
	awaitop := false
	incFlag := true
	var waitop rune = 0

	streamWriteString := func(s string) {
		if len(tagTrack) == 0 {
			stream.WriteString(s)
		}
	}

	streamWriteRune := func(s rune) {
		if len(tagTrack) == 0 {
			stream.WriteRune(s)
		}
	}

	for cursor.Streaming {
		ch := cursor.Active.Char

		if cursor.Active.Last != '\\' && ch == '<' && regexp_aftertagopen.MatchString(string(cursor.Active.Next)) {
			tagStart := cursor.Active.Idx
			cursorx := *cursor
			methodx := E_Method_Read
			if method == E_Method_Strip {
				methodx = E_Method_Strip
			}
			parsed := Tag_Scanner(fileData, methodx, cursor, appendstack, map[string]string{})
			if method != E_Method_Read && method != E_Method_Strip {

				metafront := ""
				switch method {
				case E_Method_DebugHash:
					metafront = _fmt.Sprintf("TAG%s:%d:%d__", fileData.DebugFront, cursorx.Active.Row, cursorx.Active.Col)
				case E_Method_PreviewHash:
					metafront = _fmt.Sprintf("%s%d-%d_", fileData.Label, cursorx.Active.Row, cursorx.Active.Col)
				}
				orderedMapping := Value_EvaluateIndexTraces(method, metafront, parsed.OrderedList, fileData.Cache.LocalMap)

				parsed = Tag_Scanner(fileData, method, &cursorx, appendstack, orderedMapping)
			}
			fragment := parsed.Fragment

			exitedNow := false
			if parsed.Ok {
				_map.Copy(scatteredList, parsed.ScatteredList)
				_map.Copy(appendsList, parsed.AppendsList)
				_map.Copy(finalList, parsed.FinalList)
				_map.Copy(loadashes, parsed.Loadashes)
				if len(parsed.OrderedList) > 0 {
					orderList = append(orderList, parsed.OrderedList)
				}
				for k, v := range parsed.StyleDeclarations.Styles {
					if len(v) > 2 {
						parsed.StyleDeclarations.Styles[k] = v[1 : len(v)-1]
					} else {
						delete(parsed.StyleDeclarations.Styles, k)
					}
				}

				if method == E_Method_Read {
					if parsed.HasDeclared {
						stylesList = append(stylesList, &parsed.StyleDeclarations)
					}
					if len(tagTrack) > 0 || (parsed.StyleDeclarations.Elid > 0 && parsed.HasDeclared) {
						fragment = ""
					}
				} else if elid, status := replacementTags[fragment]; status {
					replacements = append(replacements, _model.File_TagReplacement{Loc: stream.Len(), Elid: elid})
					fragment = ""
				} else if len(tagTrack) > 0 || (parsed.StyleDeclarations.Elid > 0 && parsed.HasDeclared) {
					fragment = ""
				}

				if !parsed.SelfClosed {
					if parsed.StyleDeclarations.Element[0] == '/' {
						element := parsed.StyleDeclarations.Element[1:]
						if len(tagTrack) != 0 {
							track := tagTrack[len(tagTrack)-1]
							tagTrack = tagTrack[:len(tagTrack)-1]

							if track.Element == element {
								track.Innertext = string(cursor.Slice(track.EndMarker, tagStart))
								exitedNow = true
							} else {
								tagTrack = append(tagTrack, track)
							}
						}
					} else if _slice.Contains(_config.Static.CustomTags, parsed.StyleDeclarations.Element) && parsed.HasDeclared {
						parsed.StyleDeclarations.Attributes = parsed.NativeAttributes
						tagTrack = append(tagTrack, &parsed.StyleDeclarations)
					}
				}
			} else {
				incFlag = false
			}

			if !exitedNow {
				streamWriteString(fragment)
			}
			awaitop = false
		} else if method != E_Method_Strip && awaitop {
			if ok := symlink_chars.Match([]byte{byte(ch)}); ok {
				entry.WriteRune(ch)
			} else {
				entrystring := entry.String()

				switch waitop {
				case op_lodash:
					if method != E_Method_Read && fileData.Cache.Loadashes[entrystring] {
						streamWriteString(fileData.Label)
						streamWriteString(entrystring)
						awaitop = false
					}

				case op_low:
					if method == E_Method_Read {
						scatteredList[entrystring] = true
					} else if i := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); i.Index > 0 && method != E_Method_LoadHash {
						if method == E_Method_DebugHash {
							streamWriteString(i.Data.SrcData.DebugLow)
						} else if E_Method_PreviewHash == method || _config.Static.PREVIEW {
							streamWriteString(i.Data.SrcData.PreviewLow)
						} else {
							streamWriteString(i.Data.SrcData.PublishLow)
						}

						awaitop = false
					}

				case op_top:
					if method == E_Method_Read {
						finalList[entrystring] = true
					} else if i := _action.Index_Finder(entrystring, fileData.Cache.LocalMap); i.Index > 0 && method != E_Method_LoadHash {
						if method == E_Method_DebugHash {
							streamWriteString(i.Data.SrcData.DebugTop)
						} else if E_Method_PreviewHash == method || _config.Static.PREVIEW {
							streamWriteString(i.Data.SrcData.PreviewTop)
						} else {
							streamWriteString(i.Data.SrcData.PublishTop)
						}
						awaitop = false
					}
				}

				if awaitop {
					streamWriteRune('\\')
					streamWriteRune(waitop)
					streamWriteString(entrystring)
				}
				streamWriteRune(ch)
				entry.Reset()
				waitop = 0
				awaitop = false
			}
		} else if method != E_Method_Strip &&
			cursor.Active.Last == '\\' &&
			(ch == op_low || ch == op_top || ch == op_lodash) {
			awaitop = true
			waitop = ch
		} else if len(tagTrack) == 0 {
			if cursor.Active.Last == '\\' {
				streamWriteRune('\\')
			}
			if cursor.Active.Char != '\\' {
				streamWriteRune(cursor.Active.Char)
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
		Scribed:      stream.String(),
		StylesList:   stylesList,
		TopRefs:      finalList,
		MidRefs:      orderList,
		MacRefs:      appendsList,
		LowRefs:      scatteredList,
		Replacements: replacements,
	}
}
