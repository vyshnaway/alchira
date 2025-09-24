package style

import (
	_Cursor_ "main/Cursor"
	_cache_ "main/cache"
	_util_ "main/util"
	_slices_ "slices"
	"strings"
)

type block_Parse_retype struct{
	Assign      []string
	Attachment  []string
	Variables   map[string]string
	XatProps    [][2]string
	AtProps     map[string]string
	Xproperties [][2]string
	Properties  map[string]string
	XatRules    [][2]string
	AtRules     map[string]string
	Xnested     [][2]string
	Nested      map[string]string
	Xclasses    [][2]string
	Classes     map[string]string
	Xflats      [][2]string
	Flats       map[string]string
	XallBlocks  [][2]string
	AllBlocks   map[string]string
}

func block_Parse(content string, blockInArrays bool) block_Parse_retype {
	content += ";"

	result := block_Parse_retype{
		Assign:      []string{},
		Attachment:  []string{},
		Variables:   map[string]string{},
		XatProps:    [][2]string{},
		AtProps:     map[string]string{},
		Xproperties: [][2]string{},
		Properties:  map[string]string{},
		XatRules:    [][2]string{},
		AtRules:     map[string]string{},
		Xnested:     [][2]string{},
		Nested:      map[string]string{},
		Xclasses:    [][2]string{},
		Classes:     map[string]string{},
		Xflats:      [][2]string{},
		Flats:       map[string]string{},
		XallBlocks:  [][2]string{},
		AllBlocks:   map[string]string{},
	}

	key := ""
	quote := ' '
	keyStart := 0
	valStart := 0
	deviance := 0
	isProp := true
	cursor := _Cursor_.Construct(content + ";")

	for ch, streaming := cursor.Active.Char, cursor.Streaming; streaming; ch, streaming = cursor.Increment() {

		if ch == '\\' {
			cursor.Increment()
			continue
		}
		if _slices_.Contains(_cache_.Refer.WatchQuotes, ch) {
			switch quote {
			case ' ':
				quote = ch
			case ch:
				quote = ' '
			}
		}

		if quote == ' ' {
			if _slices_.Contains(_cache_.Refer.CloseBraces, ch) {
				deviance--
			}

			if deviance == 0 {
				switch ch {
				case '{':
					isProp = false
					key = _util_.String_Minify(content[keyStart:cursor.Active.Marker])
					valStart = cursor.Active.Marker + 1
				case ':':
					key = _util_.String_Minify(content[keyStart:cursor.Active.Marker])
					valStart = cursor.Active.Marker + 1
				case '}':
					fallthrough
				case ';':
					{
						value := _util_.String_Minify(content[valStart:cursor.Active.Marker])
						if isProp {
							if len(key) > 0 {
								if strings.HasPrefix(key, "--") {
									result.Variables[key] = value
								}
								result.Properties[key] = value
								if blockInArrays {
									result.Xproperties = append(result.Xproperties, [2]string{key, value})
								}
							} else if value[0] == '@' {
								spaceIndex := strings.Index(value, " ")
								if spaceIndex < 0 {
									spaceIndex = len(value)
								}
								directive := value[0:spaceIndex]

								switch directive {
								case _cache_.Root.CustomAtrules["attach"]:
									breaks := _util_.String_ZeroBreaks(value[spaceIndex:], []rune{' ', '\n', ','})
									result.Attachment = append(result.Attachment, breaks...)
								case _cache_.Root.CustomAtrules["assign"]:
									breaks := _util_.String_ZeroBreaks(value[spaceIndex:], []rune{' ', '\n', ','})
									result.Assign = append(result.Assign, breaks...)
								default:
									result.AtProps[value] = ""
									if blockInArrays {
										result.XatProps = append(result.XatProps, [2]string{value, ""})
									}
								}
							} else {
								breaks := _util_.String_ZeroBreaks(value, []rune{' ', '\n', ','})
								if breaks[0] == string(_cache_.Root.CustomOperations["attach"]) {
									result.Attachment = append(result.Attachment, breaks[1:]...)
								} else if (breaks[0]) == string(_cache_.Root.CustomOperations["assign"]) {
									result.Assign = append(result.Assign, breaks[1:]...)
								}
							}
						} else {
							switch rune(key[0]) {
							case '@':
								result.AtRules[key] = value
								if blockInArrays {
									result.XatRules = append(result.XatRules, [2]string{key, value})
								}
							case '&':
								result.Nested[key] = value
								if blockInArrays {
									result.Xnested = append(result.Xnested, [2]string{key, value})
								}
							case '.':
								result.Classes[key] = value
								if blockInArrays {
									result.Xclasses = append(result.Xclasses, [2]string{key, value})
								}
							default:
								result.Flats[key] = value
								if blockInArrays {
									result.Xflats = append(result.Xflats, [2]string{key, value})
								}
							}
							result.AllBlocks[key] = value
							if blockInArrays {
								result.XallBlocks = append(result.XallBlocks, [2]string{key, value})
							}
						}
						keyStart = cursor.Active.Marker + 1
						valStart = cursor.Active.Marker + 1
						key = ""
						isProp = true
					}
				}
			}

			if _slices_.Contains(_cache_.Refer.OpenBraces, ch) {
				deviance++
			}
		}
	}

	return result
}
