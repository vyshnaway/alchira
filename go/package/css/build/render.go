package compose

import (
	_blockmap_ "main/package/css/block"
	"main/utils"
	"strings"
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

func render_Vendored(stylemap *_blockmap_.Type, minify bool, vendors []string, first bool) []string {
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

	prefixed := Render_Prefixer(*stylemap, vendors)

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
		prefixed.BlockRange(func(k string, v _blockmap_.Type) {
			if !minify && first {
				stylesheet = append(stylesheet, "")
			}

			if strings.HasPrefix(k, "@") {
				for vendor, selector := range prefix_ForAtRule(k, vendors) {
					composed := render_Vendored(&v, minify, []string{vendor}, false)
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
				composed := render_Vendored(&v, minify, vendors, false)
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

func Render_Vendored(stylemap *_blockmap_.Type, minify bool) string {
	var breaks string

	if minify {
		breaks = ""
	} else {
		breaks = "\n"
	}

	return strings.Join(render_Vendored(stylemap.Flatten(), minify, vendor_Providers, true), breaks)
}

func render_Wrapper(pm *_blockmap_.Type, keys []string, cm *_blockmap_.Type) {
	if len(keys) == 0 {
		return
	}

	key := keys[0]
	keys = keys[1:]

	if len(keys) > 0 {
		ok, m := pm.GetBlock(key)
		if !ok {
			m = _blockmap_.New()
			pm.SetBlock(key, *m)
		}

		if ok, n := m.GetBlock(key); ok {
			render_Wrapper(n, keys, cm)
		}
	} else {
		pm.SetBlock(key, *cm)
	}
}

func render_Switched(This *_blockmap_.Type) *_blockmap_.Type {
	out := _blockmap_.New()
	inq := out.SetBlock("", *_blockmap_.New())

	This.PropRange(func(k, v string) {
		out.SetProp(k, v)
	})

	out.BlockRange(func(k0 string, v0 _blockmap_.Type) {
		v0.BlockRange(func(k1 string, v1 _blockmap_.Type) {
			if k1 == "" {
				inq.SetBlock(k0, v0)
			} else {
				if wrappers, err := utils.Code_JsonParse[[]string](k1); err == nil {
					keyseq := []string{}
					for index, wrapper := range wrappers {
						if index == 0 || wrappers[index-1][0] == '@' || wrapper[0] == '@' {
							keyseq = append(keyseq, wrapper)
						} else {
							keyseq = append(keyseq, "& "+wrapper)
						}
					}
					render_Wrapper(out, keyseq, &v1)
				}
			}
		})
	})

	return out
}

func Render_Switched(stylemap _blockmap_.Type, minify bool) string {
	switched := render_Switched(&stylemap)
	return Render_Vendored(switched, minify)
}
