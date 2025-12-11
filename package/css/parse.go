package css

import (
	_reader "main/package/reader"
	_util "main/package/utils"
	_slice "slices"
	_string "strings"
)

type R_Parse struct {
	Directives    []_reader.T_Range
	Operations    []_reader.T_Range
	Properties    []_reader.T_Range
	Atrule_Blocks []_reader.T_Range
	Nested_Blocks []_reader.T_Range
	Select_Blocks []_reader.T_Range
	All_Blocks    []_reader.T_Range
	Variables     []_reader.T_Range
}

func ParsePartial(content string, basic_allocation_size int) R_Parse {

	result := R_Parse{
		Directives:    make([]_reader.T_Range, 0, basic_allocation_size),
		Operations:    make([]_reader.T_Range, 0, basic_allocation_size),
		Properties:    make([]_reader.T_Range, 0, basic_allocation_size),
		Atrule_Blocks: make([]_reader.T_Range, 0, basic_allocation_size),
		Nested_Blocks: make([]_reader.T_Range, 0, basic_allocation_size),
		Select_Blocks: make([]_reader.T_Range, 0, basic_allocation_size),
		All_Blocks:    make([]_reader.T_Range, 0, basic_allocation_size),
		Variables:     make([]_reader.T_Range, 0, basic_allocation_size),
	}

	key := ""
	var awaitBrace rune = 0
	braceTrack := make([]rune, 0, 12)
	deviance := 0
	isProp := true
	reader := _reader.New(content + "; ")
	keyStart := reader.Active
	valueFrom := 0

	createRange := func(data []string) _reader.T_Range {
		return _reader.T_Range{
			Data:  data,
			Start: keyStart,
			End:   reader.Active,
		}
	}

	for ch, streaming := reader.Active.Char, reader.Streaming; streaming; ch, streaming = reader.Increment() {

		if ch == '\\' {
			reader.Increment()
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

		if deviance == 1 && reader.Active.Char == '{' {
			isProp = false
			key = _util.String_Minify(string(reader.Slice(keyStart.Idx, reader.Active.Idx)))
			valueFrom = reader.Active.Idx + 1
		} else if deviance != 0 {
			continue
		} else {
			switch reader.Active.Char {
			case ':':
				k := _util.String_Minify(string(reader.Slice(keyStart.Idx, reader.Active.Idx)))
				if len(k) > 0 && k[0] != '@' && k[0] != '&' {
					key = k
					valueFrom = reader.Active.Idx + 1
				}
			case '}':
				fallthrough
			case ';':
				val := _util.String_Minify(string(reader.Slice(valueFrom, reader.Active.Idx)))
				{
					if isProp {
						if len(key) > 0 {
							if _string.HasPrefix(key, "--") {
								result.Variables = append(result.Variables, createRange([]string{key, val}))
							}
							result.Properties = append(result.Properties, createRange([]string{key, val}))
						} else if len(val) > 0 {
							if val[0] == '@' {
								result.Directives = append(result.Directives, createRange([]string{val}))
							} else {
								result.Operations = append(result.Operations, createRange([]string{val}))
							}
						}
					} else if len(key) > 0 {
						switch rune(key[0]) {
						case '@':
							result.Atrule_Blocks = append(result.Atrule_Blocks, createRange([]string{key, val}))
						case '&':
							result.Nested_Blocks = append(result.Nested_Blocks, createRange([]string{key, val}))
						default:
							result.Select_Blocks = append(result.Select_Blocks, createRange([]string{key, val}))
						}
						result.All_Blocks = append(result.All_Blocks, createRange([]string{key, val}))
					}

					reader.Increment()
					keyStart = reader.Active
					valueFrom = keyStart.Idx + 1
					key = ""
					val = ""
					isProp = true
				}
			}
		}
	}

	return result
}
