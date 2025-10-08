package compose

import (
	_blockmap_ "main/class/Blockmap"
	"strings"
	// "main/shell"
	// "strings"
	// _strings_ "strings"
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

func Render_Prefixer(stylemap _blockmap_.Type, vendors []string) *_blockmap_.Type {
	out := _blockmap_.New()

	stylemap.PropRange(func(key, val string) {
		if key[0] == '@' {
			for _, r := range prefix_ForAtRule(key, vendors) {
				out.SetProp(r+";", "")
			}
		} else {
			for _, kv := range prefix_LoadProps(key, val, vendors) {
				k, v := kv[0], kv[1]
				if hasProp, _ := stylemap.GetProp(k); hasProp || k == key {
					out.SetProp(k+":"+v+";", "")
				}
			}
		}
	})

	stylemap.BlockRange(func(k string, v _blockmap_.Type) {
		if v.Len() > 0 {
			out.SetBlock(k, v)
		}
	})

	return out
}

func render_Prefixed(styleobject *_blockmap_.Type, minify bool, vendors []string, first bool) []string {
	stylesheet := []string{}
	var tab string
	var space string
	if minify {
		tab = ""
		space = ""
	} else {
		tab = "  "
		space = " "
	}

	made := Render_Prefixer(*styleobject, vendors)

	made.PropRange(func(k, v string) {
		if k[0] == '@' {
			stylesheet = append(stylesheet, k)
		} else {
			stylesheet = append(stylesheet, k+space+v)
		}
	})

	made.BlockRange(func(k string, v _blockmap_.Type) {
		if v.BlockLen() > 0 {
			if !minify && first {
				stylesheet = append(stylesheet, "")
			}
			if strings.HasPrefix(k, "@") {
				for vendor, selector := range prefix_ForAtRule(k, vendors) {
					composed := render_Prefixed(&v, minify, []string{vendor}, false)
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
				composed := render_Prefixed(&v, minify, vendors, false)
				if !minify {
					for index, line := range composed {
						composed[index] = tab + line
					}
				}
				if len(composed) > 0 {
					stylesheet = append(stylesheet, prefix_ForPseudos(k, vendors)...)
					stylesheet = append(stylesheet, "{")
					stylesheet = append(stylesheet, composed...)
					stylesheet = append(stylesheet, "}")
				}
			}
		}
	})

	return stylesheet
}

func Render_Prefixed(stylemap *_blockmap_.Type, minify bool) string {
	stylesheet := []string{}
	var breaks string

	if minify {
		breaks = ""
	} else {
		breaks = "\n"
	}

	stylesheet = append(stylesheet, render_Prefixed(stylemap.Flatten(), minify, vendor_Providers, true)...)
	return strings.Join(stylesheet, breaks)
}
