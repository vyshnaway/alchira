package css

import (
	O "main/package/object"
	_util "main/package/utils"
	_regexp "regexp"
	_slice "slices"
	_string "strings"
)

func prefix_ForAttribute(content string, prefixes []string) *O.T[string, string] {
	attrVals, attrStat := Vendor_Refer.Attributes[content]
	result := O.New[string, string]()

	if attrStat {
		for vendor, value := range attrVals {
			if _slice.Contains(prefixes, vendor) {
				result.Set(vendor, value)
			}
		}
	}
	result.Set("", content)

	return result
}

func prefix_ForValues(attribute string, value string, prefixes []string) *O.T[string, string] {
	cleanValue := _util.Code_Uncomment(value, false, true, false)
	var venVals map[string]string
	var venStat = false
	if attrMap, ok := Vendor_Refer.Values[attribute]; ok {
		venVals, venStat = attrMap[cleanValue]
	}

	result := O.New[string, string]()
	if venStat {
		for vendor, val := range venVals {
			if _slice.Contains(prefixes, vendor) {
				result.Set(vendor, _string.Replace(value, cleanValue, val, 1))
			}
		}
	}
	result.Set("", value)

	return result
}

var prefix_fallbackPalettes = []string{"oklch", "oklab", "lab", "lch", "hwb", "rgba"}

func prefix_LoadProps(attribute string, value string, prefixes []string) [][2]string {
	results := [][2]string{}
	attributes := prefix_ForAttribute(attribute, prefixes)

	values := prefix_ForValues(attribute, value, prefixes)
	attributes.Range(func(attrVen, attr string) {
		values.Range(func(valVen, val string) {
			if attrVen == valVen || valVen == "" {
				for _, v := range Color_FallbackGen(val, false, prefix_fallbackPalettes) {
					results = append(results, [2]string{attr, v})
				}
			}
		})
	})

	return results
}

func prefix_ForAtRule(content string, prefixes []string) *O.T[string, string] {
	index := _string.Index(content, " ")
	if index < 0 {
		index = len(content)
	}
	rule := content[0:index]
	data := content[index:]

	result := O.New[string, string]()
	for _, group := range prefixes {
		if rval, rbool := Vendor_Refer.Atrules[rule]; rbool {
			if gval, gbool := rval[group]; gbool {
				result.Set(group, gval+data)
			}
		}
	}
	result.Set("", content)

	return result
}

var regex_pseuods = _regexp.MustCompile(`:+[\w-]+`)

func prefix_ForPseudos(content string, prefixes []string) []string {
	selectors := []string{}
	stringList := _util.String_ZeroBreaks(content, []rune{','})
	for i, br := range stringList {
		stringList[i] = _string.Trim(br, "\r\n\t ")
	}

	for _, str := range stringList {
		type VendorScore struct {
			value string
			score int
		}

		vendorMap := make(map[string]VendorScore)

		for _, group := range prefixes {
			score := 0
			value := regex_pseuods.ReplaceAllStringFunc(str, func(selector string) string {
				if sVal, sStat := Vendor_Refer.Pseudos[selector]; sStat {
					if gVal, gStat := sVal[group]; gStat {
						score++
						return gVal
					}
				}

				if _, stat := Vendor_Refer.Pseudos[selector]; stat {
					return selector
				}

				return selector
			})
			vendorMap[group] = VendorScore{value, score}
		}

		for _, ven := range vendorMap {
			if ven.score > 0 {
				selectors = append(selectors, ven.value)
			}
		}

		selectors = append(selectors, str)
	}

	return selectors
}
