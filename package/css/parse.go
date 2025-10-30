package css

import (
	_reader "main/package/reader"
	_util "main/package/utils"
	_slice "slices"
	_string "strings"
)

type R_Parse struct {
	Directives    []string
	Operations    []string
	Properties    [][2]string
	Atrule_Blocks [][2]string
	Nested_Blocks [][2]string
	Select_Blocks [][2]string
	All_Blocks    [][2]string
	Variables     [][2]string
}

func ParsePartial(content string, basic_allocation_size int) R_Parse {

	result := R_Parse{
		Directives:    make([]string, 0, basic_allocation_size),
		Operations:    make([]string, 0, basic_allocation_size),
		Properties:    make([][2]string, 0, basic_allocation_size),
		Atrule_Blocks: make([][2]string, 0, basic_allocation_size),
		Nested_Blocks: make([][2]string, 0, basic_allocation_size),
		Select_Blocks: make([][2]string, 0, basic_allocation_size),
		All_Blocks:    make([][2]string, 0, basic_allocation_size),
		Variables:     make([][2]string, 0, basic_allocation_size),
	}

	key := ""
	var awaitBrace rune = 0
	braceTrack := make([]rune, 0, 12)
	keyStart := 0
	valStart := 0
	deviance := 0
	isProp := true
	cursor := _reader.New(content + ";")

	for ch, streaming := cursor.Active.Char, cursor.Streaming; streaming; ch, streaming = cursor.Increment() {

		if ch == '\\' {
			cursor.Increment()
			continue
		} else if awaitBrace != 0 && awaitBrace == ch {
			deviance = len(braceTrack) - 1
			braceTrack = braceTrack[:deviance]
			if deviance > 0 {
				awaitBrace = braceTrack[deviance-1]
			} else {
				awaitBrace = 0
			}
		} else if !_slice.Contains(_util.Refer.WatchQuotes, awaitBrace) &&
			_slice.Contains(_util.Refer.OpenBraces, ch) || _slice.Contains(_util.Refer.WatchQuotes, ch) {
			awaitBrace = _util.Refer.BracePair[ch]
			braceTrack = append(braceTrack, awaitBrace)
			deviance = len(braceTrack)
		}

		if deviance == 1 && cursor.Active.Char == '{' {
			isProp = false
			key = _util.String_Minify(content[keyStart:cursor.Active.Position])
			valStart = cursor.Active.Position + 1
		} else if deviance != 0 {
			continue
		} else {
			switch cursor.Active.Char {
			case ':':
				k := _util.String_Minify(content[keyStart:cursor.Active.Position])
				if len(k) > 0 && k[0] != '@' {
					key = k
					valStart = cursor.Active.Position + 1
				}
			case '}':
				fallthrough
			case ';':
				val := _util.String_Minify(content[valStart:cursor.Active.Position])
				{
					if isProp {
						if len(key) > 0 {
							if _string.HasPrefix(key, "--") {
								result.Variables = append(result.Variables, [2]string{key, val})
							}
							result.Properties = append(result.Properties, [2]string{key, val})
						} else if len(val) > 0 {
							if val[0] == '@' {
								result.Directives = append(result.Directives, val)
							} else {
								result.Operations = append(result.Operations, val)
							}
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
					keyStart = cursor.Active.Position + 1
					valStart = cursor.Active.Position + 1
					key = ""
					val = ""
					isProp = true
				}
			}
		}
	}

	return result
}
