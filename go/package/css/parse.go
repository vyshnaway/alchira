package css

import (
	// _cache_ "main/cache"
	_Cursor_ "main/package/reader"
	_utils_ "main/package/utils"
	_slices_ "slices"
	_strings_ "strings"
)

type R_Parse struct {
	Directives    []string
	Properties    [][2]string
	Atrule_Blocks [][2]string
	Nested_Blocks [][2]string
	Select_Blocks [][2]string
	All_Blocks    [][2]string
	Variables     map[string]string
}

func ParsePartial(content string) R_Parse {

	result := R_Parse{
		Directives:    []string{},
		Properties:    [][2]string{},
		Atrule_Blocks: [][2]string{},
		Nested_Blocks: [][2]string{},
		Select_Blocks: [][2]string{},
		All_Blocks:    [][2]string{},
		Variables:     map[string]string{},
	}

	key := ""
	var awaitBrace rune = 0
	braceTrack := []rune{}
	start := 0
	deviance := 0
	isProp := true
	cursor := _Cursor_.New(content + ";")

	for ch, streaming := cursor.Active.Char, cursor.Streaming; streaming; ch, streaming = cursor.Increment() {

		if ch == '\\' {
			cursor.Increment()
			continue
		} else if awaitBrace == ch {
			deviance = len(braceTrack) - 1
			braceTrack = braceTrack[:deviance]
			if deviance > 0 {
				awaitBrace = braceTrack[deviance-1]
			} else {
				awaitBrace = 0
			}
		} else if !_slices_.Contains(_utils_.Refer.WatchQuotes, awaitBrace) &&
			_slices_.Contains(_utils_.Refer.OpenBraces, ch) || _slices_.Contains(_utils_.Refer.WatchQuotes, ch) {
			awaitBrace = _utils_.Refer.BracePair[ch]
			braceTrack = append(braceTrack, awaitBrace)
			deviance = len(braceTrack)
		}

		if deviance == 1 && cursor.Active.Char == '{' {
			isProp = false
			key = _utils_.String_Minify(content[start:cursor.Active.Marker])
			start = cursor.Active.Marker + 1
		} else if deviance != 0 {
			continue
		} else {
			switch cursor.Active.Char {
			case ':':
				key = _utils_.String_Minify(content[start:cursor.Active.Marker])
				start = cursor.Active.Marker + 1
			case '}':
				fallthrough
			case ';':
				val := _utils_.String_Minify(content[start:cursor.Active.Marker])
				{
					if isProp {
						if len(key) > 0 {
							if _strings_.HasPrefix(key, "--") {
								result.Variables[key] = val
							}
							result.Properties = append(result.Properties, [2]string{key, val})
						} else if len(val) > 0 && val[0] == '@' {
							result.Directives = append(result.Directives, val)
						}
					} else if len(key) > 0 {
						switch rune(key[0]) {
						case '@':
							result.Atrule_Blocks = append(result.Atrule_Blocks, [2]string{key, val})
						case '&':
							result.Nested_Blocks = append(result.Nested_Blocks, [2]string{key, val})
						default:
							result.Select_Blocks = append(result.Select_Blocks, [2]string{key, val})
						}
						result.All_Blocks = append(result.All_Blocks, [2]string{key, val})
					}
					start = cursor.Active.Marker + 1
					key = ""
					isProp = true
				}
			}
		}
	}

	return result
}
