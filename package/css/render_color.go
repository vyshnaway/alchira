package css

import (
	_Cursor_ "main/package/reader"
	_utils_ "main/package/utils"
	_math_ "math"
	_regexp_ "regexp"
	_slices_ "slices"
	_strconv_ "strconv"
	_strings_ "strings"
)

func color_Investigate(cursor *_Cursor_.T_Reader, palette string) []float64 {
	var value _strings_.Builder
	values := []float64{}
	braceTrack := []rune{}
	awaitBrace := ' '
	ok := true
	deviance := 0

	for ch, streaming := cursor.Increment(); streaming; ch, streaming = cursor.Increment() {

		if deviance == 0 && (ch == ')' || ch == ',' || ch == ' ' || ch == '/') {

			trimmed := _strings_.Trim(value.String(), " \t\r\n")
			if len(trimmed) > 0 {

				if _strings_.HasSuffix(trimmed, "deg") {
					numString := trimmed[0 : len(trimmed)-4]
					numValue, err := _strconv_.ParseFloat(numString, 64)
					if err == nil {
						values = append(values, numValue, 4)
					} else {
						ok = false
					}
				} else if _strings_.HasSuffix(trimmed, "%") {
					numString := trimmed[0 : len(trimmed)-1]
					numValue, err := _strconv_.ParseFloat(numString, 64)
					if err == nil {
						if ch == '/' {
							values = append(values, numValue/1000)
						} else if (palette == "rgb" || palette == "rgba") && len(values) < 3 {
							values = append(values, _math_.Round((numValue/100)*255))
						} else if palette == "hsl" && (len(values) == 1 || len(values) == 2) {
							values = append(values, numValue)
						} else if _slices_.Contains([]string{"hwb", "lab", "lch", "oklab", "oklch"}, palette) && len(values) > 0 {
							values = append(values, numValue)
						} else {
							values = append(values, numValue)
						}
					} else {
						ok = false
					}
				} else if numValue, err := _strconv_.ParseFloat(trimmed, 64); err == nil {
					if (palette == "rgb" || palette == "rgba") && len(values) < 3 {
						if o, _, _ := _utils_.Number_FloatIsInt(numValue); o && numValue >= 0 && numValue <= 255 {
							values = append(values, numValue)
						} else {
							values = append(values, numValue)
						}
					} else {
						values = append(values, numValue)
					}
				} else {
					ok = false
				}
			}
			value.Reset()
		} else {
			value.WriteRune(ch)
		}

		if deviance == 0 && ch == ')' {
			break
		} else if awaitBrace != 0 && awaitBrace == ch {
			braceTrack = braceTrack[:len(braceTrack)-2]
			deviance = len(braceTrack)
			awaitBrace = _utils_.Refer.BracePair[braceTrack[deviance-1]]
		} else if _slices_.Contains(_utils_.Refer.OpenBraces, ch) && _slices_.Contains(_utils_.Refer.WatchQuotes, awaitBrace) {
			braceTrack = append(braceTrack, ch)
			deviance = len(braceTrack)
			awaitBrace = _utils_.Refer.BracePair[ch]
		} else if deviance == 0 && _slices_.Contains(_utils_.Refer.CloseBraces, ch) {
			break
		}
	}

	cursor.Increment()
	if !ok {
		values = []float64{}
	}
	return values
}

var regex_isAlNum = _regexp_.MustCompile(`^[a-zA-Z0-9]$`)

func Color_FallbackGen(
	content string,
	fallback_RGB1_HEX0 bool,
	fallbackPalettes []string,
) (Values []string) {
	result := ""
	score := 0

	var capture _strings_.Builder
	cursor := _Cursor_.New(content)
	for ch, streaming := cursor.Active.Char, cursor.Streaming; streaming; ch, streaming = cursor.Increment() {

		if regex_isAlNum.MatchString(string(ch)) {
			capture.WriteRune(ch)
		} else {
			if capture.Len() > 0 {
				capture.WriteRune(ch)
			}
			result += capture.String()
			capture.Reset()
		}

		if _slices_.Contains(fallbackPalettes, capture.String()) && content[cursor.Active.Idx] == '(' {
			frompos := cursor.Active.Idx
			values := color_Investigate(&cursor, capture.String())
			if len(values) > 2 {

				r := 0.0
				g := 0.0
				b := 0.0
				alpha := 1.0
				converted := ""
				palette := capture.String()
				score++

				if len(values) > 3 {
					alpha = values[3]
				}

				switch palette {
				case "hsl", "hsla":
					h, s, l := values[0], values[1], values[2]
					rgb := _utils_.ColorRGB.From.Hsl(h, s*100, l*100, alpha)
					r, g, b, alpha, converted = rgb.R, rgb.G, rgb.B, rgb.A, rgb.Converted
				case "hwb":
					h, w, b_ := values[0], values[1], values[2]
					rgb := _utils_.ColorRGB.From.Hwb(h, w*100, b_*100, alpha)
					r, g, b, alpha, converted = rgb.R, rgb.G, rgb.B, rgb.A, rgb.Converted
				case "lab":
					l, a_, b_ := values[0], values[1], values[2]
					rgb := _utils_.ColorRGB.From.Lab(l, a_, b_, alpha)
					r, g, b, alpha, converted = rgb.R, rgb.G, rgb.B, rgb.A, rgb.Converted
				case "lch":
					l, c, h := values[0], values[1], values[2]
					rgb := _utils_.ColorRGB.From.Lch(l, c, h, alpha)
					r, g, b, alpha, converted = rgb.R, rgb.G, rgb.B, rgb.A, rgb.Converted
				case "oklab":
					l, a_, b_ := values[0], values[1], values[2]
					rgb := _utils_.ColorRGB.From.Oklab(l, a_, b_, alpha)
					r, g, b, alpha, converted = rgb.R, rgb.G, rgb.B, rgb.A, rgb.Converted
				case "oklch":
					l, c, h := values[0], values[1], values[2]
					rgb := _utils_.ColorRGB.From.Oklch(l, c, h, alpha)
					r, g, b, alpha, converted = rgb.R, rgb.G, rgb.B, rgb.A, rgb.Converted
				default:
					converted = capture.String() + content[frompos:cursor.Active.Idx]
				}

				if fallback_RGB1_HEX0 {
					result += converted
				} else {
					result += _utils_.ColorRGB.ToHex(r, g, b, alpha)
				}

			} else {
				result += capture.String() + content[frompos:cursor.Active.Idx]
			}
			capture.Reset()
		}

	}

	if score == 0 {
		return []string{content}
	} else {
		return []string{result, content}
	}
}
