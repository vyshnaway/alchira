package compose

import (
	_strings_ "strings"
)

// func render_LoadVendors(collection map[string]string, vendor string) []string {
// 	result := []string{}
// 	if vendor == "" {
// 		for _, ven := range vendor_Providers {
// 			if _, stat := collection[ven]; stat {
// 				result = append(result, ven)
// 			}
// 		}
// 	} else {
// 		result = append(result, vendor)
// 	}
// 	return result
// }

func render_PartialsArrayPrefixer(object map[string]any, vendors []string) [][2]any {
	var result [][2]any

	for key, value := range object {
		switch val := value.(type) {
		case map[string]any:
			if len(val) > 0 {
				result = append(result, [2]any{key, val})
			}
		case string:
			if _strings_.HasPrefix(key, "@") {
				for _, r := range prefix_ForAtRule(key, vendors) {
					result = append(result, [2]any{r + ";", ""})
				}
			} else if valstr, ok := value.(string); ok {
				for _, kv := range prefix_LoadProps(key, valstr, vendors) {
					k, v := kv[0], kv[1]
					if k == key || object[k] == nil {
						result = append(result, [2]any{k + ":" + v + ";"})
					}
				}
			}
		}
	}
	return result
}

// Pending to handle states &:* states.

func render_UnNester(selector string, value map[string]any, cumulates map[string]any) map[string]any {
	compounds := map[string]any{}
	pseudoclass := map[string]any{}
	pseudoelement := map[string]any{}
	children := map[string]any{}
	myself := map[string]any{}
	holder := map[string]any{}

	for key, val := range value {
		switch val_typed := val.(type) {
		case map[string]any:
			if key[0] == '&' {
				xelector := selector + key[1:]
				if key[1] == ':' {
					if key[2] == ':' {
						render_UnNester(xelector, val_typed, pseudoelement)
					} else {
						render_UnNester(xelector, val_typed, pseudoclass)
					}
				} else if key[1] == ' ' {
					render_UnNester(xelector, val_typed, children)
				} else {
					render_UnNester(xelector, val_typed, compounds)
				}
			} else {
				render_UnNester(key, val_typed, holder)
			}
		default:
			holder[key] = val
		}
	}

	for _, m := range []map[string]any{compounds, pseudoclass, myself, pseudoelement, children, holder} {
		for k, v := range m {
			cumulates[k] = v
		}
	}
	return cumulates
}

func render_ObjectCompose(object map[string]any, minify bool, vendors []string, first bool) []string {
	stylesheet := []string{}
	tab := "  "
	space := " "
	if minify {
		tab = ""
		space = ""
	}

	for _, kv := range render_PartialsArrayPrefixer(object, vendors) {
		key_typed, key_ok := kv[0].(string)
		val := kv[1]
		if key_ok {
			switch val_typed := val.(type) {
			case map[string]any:
				if len(val_typed) > 0 {
					if !minify && first {
						stylesheet = append(stylesheet, "")
					}
					if key_typed[0] == '@' {
						for vendor, selector := range prefix_ForAtRule(key_typed, vendors) {
							composed := render_ObjectCompose(val_typed, minify, []string{vendor}, false)
							if len(composed) > 0 {
								stylesheet = append(stylesheet, selector)
								stylesheet = append(stylesheet, "{")
								for _, i := range composed {
									stylesheet = append(stylesheet, tab+i)
								}
								stylesheet = append(stylesheet, "}")
									
							}

						}
					} else {
						composed := render_ObjectCompose(val_typed, minify, vendors, false)
						if !minify {
							for index, line := range composed {
								composed[index] = tab + line
							}
						}
						if len(composed) > 0 {
							stylesheet = append(stylesheet, prefix_ForPseudos(key_typed, vendors)...)
							stylesheet = append(stylesheet, "{")
							stylesheet = append(stylesheet, composed...)
							stylesheet = append(stylesheet, "}")
						}
					}
				}
			case string:
				if key_typed[0] == '@' {
					stylesheet = append(stylesheet, key_typed)
				} else {
					stylesheet = append(stylesheet, key_typed+space+val_typed)
				}
			}
		}
	}

	return stylesheet
}

func Render(array [][2]any, minify bool)string {
	stylesheet := []string{}
	breaks := "\n"
	if minify {
		breaks = ""
	}

	for _, kv := range array {
		key := kv[0]
		key_typed, key_ok := key.(string)

		if key_ok {
			val := kv[1]
			flattened := map[string]any{} 

			switch val_typed := val.(type) {
			case map[string]any: 
				flattened = render_UnNester(key_typed, val_typed, map[string]any{})
			case string:
				flattened = map[string]any{ key_typed: val_typed }
			}

			composed := render_ObjectCompose(flattened, minify, vendor_Providers, true)
			stylesheet = append(stylesheet, composed...)
		}
	}

	return _strings_.Join(stylesheet, breaks)
}
