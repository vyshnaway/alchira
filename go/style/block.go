package style

import (
	_cache_ "main/cache"
	_Cursor_ "main/class/Cursor"
	_utils_ "main/utils"
	_slices_ "slices"
	_strings_ "strings"
)

type block_Parse_retype struct {
	Assign     []string
	Attach     []string
	AtProps    [][2]string
	Properties [][2]string
	AtRules    [][2]string
	Nested     [][2]string
	Classes    [][2]string
	Flats      [][2]string
	AllBlocks  [][2]string
	Variables  map[string]string
}

func Block_Parse(content string) block_Parse_retype {

	result := block_Parse_retype{
		Assign:     []string{},
		Attach:     []string{},
		AtProps:    [][2]string{},
		Properties: [][2]string{},
		AtRules:    [][2]string{},
		Nested:     [][2]string{},
		Classes:    [][2]string{},
		Flats:      [][2]string{},
		AllBlocks:  [][2]string{},
		Variables:  map[string]string{},
	}

	key := ""
	var awaitBrace rune = 0
	braceTrack := []rune{}
	keyStart := 0
	valStart := 0
	deviance := 0
	isProp := true
	cursor := _Cursor_.Construct(content + ";")

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
			key = _utils_.String_Minify(content[keyStart : cursor.Active.Marker-1])
			valStart = cursor.Active.Marker + 1
		} else if deviance != 0 {
			continue
		} else {
			switch cursor.Active.Char {
			case ':':
				key = _utils_.String_Minify(content[keyStart : cursor.Active.Marker-1])
				valStart = cursor.Active.Marker + 1
			case '}':
				fallthrough
			case ';':
				{
					value := _utils_.String_Minify(content[valStart : cursor.Active.Marker-1])
					if isProp {
						if len(key) > 0 {
							if _strings_.HasPrefix(key, "--") {
								result.Variables[key] = value
							}
							result.Properties = append(result.Properties, [2]string{key, value})
						} else if len(value) > 0 && value[0] == '@' {
							spaceIndex := _strings_.Index(value, " ")
							if spaceIndex < 0 {
								spaceIndex = len(value)
							}
							directive := value[0:spaceIndex]

							switch directive {
							case _cache_.Root.CustomAtrules["attach"]:
								breaks := _utils_.String_ZeroBreaks(value[spaceIndex:], []rune{' ', '\n', ','})
								result.Attach = append(result.Attach, breaks...)
							case _cache_.Root.CustomAtrules["assign"]:
								breaks := _utils_.String_ZeroBreaks(value[spaceIndex:], []rune{' ', '\n', ','})
								result.Assign = append(result.Assign, breaks...)
							default:
								result.AtProps = append(result.AtProps, [2]string{value, ""})
							}
						} else {
							breaks := _utils_.String_ZeroBreaks(value, []rune{' ', '\n', ','})
							if len(breaks) > 0 {
								if breaks[0] == string(_cache_.Root.CustomOperations["attach"]) {
									result.Attach = append(result.Attach, breaks[1:]...)
								} else if (breaks[0]) == string(_cache_.Root.CustomOperations["assign"]) {
									result.Assign = append(result.Assign, breaks[1:]...)
								}
							}
						}
					} else if len(key) > 0 {
						switch rune(key[0]) {
						case '@':
							result.AtRules = append(result.AtRules, [2]string{key, value})
						case '&':
							result.Nested = append(result.Nested, [2]string{key, value})
						case '.':
							result.Classes = append(result.Classes, [2]string{key, value})
						default:
							result.Flats = append(result.Flats, [2]string{key, value})
						}
						result.AllBlocks = append(result.AllBlocks, [2]string{key, value})
					}
					keyStart = cursor.Active.Marker
					valStart = cursor.Active.Marker
					key = ""
					isProp = true
				}
			}
		}
	}

	return result
}
