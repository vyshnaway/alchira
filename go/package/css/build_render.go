package css

import (
	_utils "main/package/utils"
	_strings "strings"
	// "main/shell/core"
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

func Render_Prefixer(stylemap *T_Block, vendors []string) *T_Block {
	out := NewBlock()

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

	stylemap.BlockRange(func(k string, v *T_Block) {
		if v.Len() > 0 {
			out.SetBlock(k, v)
		}
	})

	return out
}

func render_Vendored(stylemap *T_Block, minify bool, vendors []string, first bool) []string {
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

	prefixed := Render_Prefixer(stylemap, vendors)

	if prefixed.PropLen() > 0 {
		prefixed.PropRange(func(k, v string) {
			if k[0] == '@' {
				stylesheet = append(stylesheet, k)
			} else {
				stylesheet = append(stylesheet, k+space+v)
			}
		})
	}

	if prefixed.BlockLen() > 0 {
		prefixed.BlockRange(func(k string, v *T_Block) {
			if !minify && first {
				stylesheet = append(stylesheet, "")
			}

			if _strings.HasPrefix(k, "@") {
				for vendor, selector := range prefix_ForAtRule(k, vendors) {
					composed := render_Vendored(v, minify, []string{vendor}, false)
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
				composed := render_Vendored(v, minify, vendors, false)
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
		})
	}

	return stylesheet
}

func Render_Vendored(stylemap *T_Block, minify bool) string {
	var breaks string

	if minify {
		breaks = ""
	} else {
		breaks = "\n"
	}

	return _strings.Join(render_Vendored(stylemap.Flatten(), minify, vendor_Providers, true), breaks)
}

func render_Wrapper(pm *T_Block, keys []string, cm *T_Block) {
	if len(keys) == 0 {
		return
	}

	key := keys[0]
	keys = keys[1:]

	if len(keys) > 0 {
		ok, m := pm.GetBlock(key)
		if !ok {
			m = NewBlock()
			pm.SetBlock(key, m)
		}

		if ok, n := m.GetBlock(key); ok {
			render_Wrapper(n, keys, cm)
		}
	} else {
		pm.SetBlock(key, cm)
	}
}

func render_Switched(This *T_Block) *T_Block {
	out := NewBlock()
	inq := out.SetBlock("", NewBlock())

	This.PropRange(func(k, v string) {
		out.SetProp(k, v)
	})

	out.BlockRange(func(k0 string, v0 *T_Block) {
		v0.BlockRange(func(k1 string, v1 *T_Block) {
			if k1 == "" {
				inq.SetBlock(k0, v0)
			} else {
				if wrappers, err := _utils.Code_JsonParse[[]string](k1); err == nil {
					keyseq := []string{}
					for index, wrapper := range wrappers {
						if index == 0 || wrappers[index-1][0] == '@' || wrapper[0] == '@' {
							keyseq = append(keyseq, wrapper)
						} else {
							keyseq = append(keyseq, "& "+wrapper)
						}
					}
					render_Wrapper(out, keyseq, v1)
				}
			}
		})
	})

	return out
}

func Render_Switched(stylemap *T_Block, minify bool) string {
	switched := render_Switched(stylemap)
	return Render_Vendored(switched, minify)
}
