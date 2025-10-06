package compose

import (
	_blockmap_ "main/class/Blockmap"
	// "main/shell"
	// "strings"
	// _strings_ "strings"
)

func Render_Prefixer(stylemap _blockmap_.Type, vendors []string) [][2]any {
	var result [][2]any

	stylemap.PropRange(func(key, val string) {
		if key[0] == '@' {
			for _, r := range prefix_ForAtRule(key, vendors) {
				result = append(result, [2]any{r + ";", ""})
			}
		} else {
			for _, kv := range prefix_LoadProps(key, val, vendors) {
				k, v := kv[0], kv[1]
				if hasProp, _ := stylemap.GetProp(k); hasProp || k == key {
					result = append(result, [2]any{k + ":" + v + ";", ""})
				}
			}
		}

	}) 
	
	stylemap.BlockRange(func(k string, v _blockmap_.Type) {
		if v.Len() > 0 {
			result = append(result, [2]any{k, v})
		}
	})

	return result
}

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

// func render_ObjectCompose(object map[string]any, minify bool, vendors []string, first bool) []string {
// 	stylesheet := []string{}
// 	tab := "  "
// 	space := " "
// 	if minify {
// 		tab = ""
// 		space = ""
// 	}

// 	for _, kv := range render_PartialsArrayPrefixer(object, vendors) {
// 		key_typed, key_ok := kv[0].(string)
// 		val := kv[1]
// 		if key_ok {
// 			switch val_typed := val.(type) {
// 			case map[string]any:
// 				if len(val_typed) > 0 {
// 					if !minify && first {
// 						stylesheet = append(stylesheet, "")
// 					}
// 					if key_typed[0] == '@' {
// 						for vendor, selector := range prefix_ForAtRule(key_typed, vendors) {
// 							composed := render_ObjectCompose(val_typed, minify, []string{vendor}, false)
// 							if len(composed) > 0 {
// 								stylesheet = append(stylesheet, selector)
// 								stylesheet = append(stylesheet, "{")
// 								for _, i := range composed {
// 									stylesheet = append(stylesheet, tab+i)
// 								}
// 								stylesheet = append(stylesheet, "}")

// 							}

// 						}
// 					} else {
// 						composed := render_ObjectCompose(val_typed, minify, vendors, false)
// 						if !minify {
// 							for index, line := range composed {
// 								composed[index] = tab + line
// 							}
// 						}
// 						if len(composed) > 0 {
// 							stylesheet = append(stylesheet, prefix_ForPseudos(key_typed, vendors)...)
// 							stylesheet = append(stylesheet, "{")
// 							stylesheet = append(stylesheet, composed...)
// 							stylesheet = append(stylesheet, "}")
// 						}
// 					}
// 				}
// 			case string:
// 				if key_typed[0] == '@' {
// 					stylesheet = append(stylesheet, key_typed)
// 				} else {
// 					stylesheet = append(stylesheet, key_typed+space+val_typed)
// 				}
// 			}
// 		}
// 	}

// 	return stylesheet
// }

// func Render(array [][2]any, minify bool) string {
// 	stylesheet := []string{}
// 	var breaks string

// 	if minify {
// 		breaks = ""
// 	} else {
// 		breaks = "\n"
// 	}

// 	for _, kv := range array {
// 		if key, ok := kv[0].(string); ok {
// 			val := kv[1]
// 			flattened := map[string]any{}

// 			switch val_typed := val.(type) {
// 			case map[string]any:
// 				flattened = Render_UnNester(key, val_typed, map[string]any{})
// 			case string:
// 				flattened = map[string]any{key: val_typed}
// 			}

// 			composed := render_ObjectCompose(flattened, minify, vendor_Providers, true)
// 			stylesheet = append(stylesheet, composed...)
// 		}
// 	}

// 	return _strings_.Join(stylesheet, breaks)
// }
