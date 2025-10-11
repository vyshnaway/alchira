package css

import (
	O "main/package/object"
	_util "main/package/utils"
	_string "strings"
)

var _tab = ""
var _breaks = ""
var _space = ""
var _minify = false

func SetMinification(active bool) {
	_minify = active
	if active {
		_tab = ""
		_breaks = ""
		_space = ""
	} else {
		_tab = "  "
		_space = " "
		_breaks = "\n"
	}
}

func render_LoadVendors(collection *O.T[string, string], vendor string) []string {
	result := []string{}
	if vendor == "" {
		for _, ven := range vendor_Providers {
			if _, stat := collection.Get(ven); stat {
				result = append(result, ven)
			}
		}
	} else {
		result = append(result, vendor)
	}
	return result
}

func render_Prefixer(stylemap *T_Block, vendors []string) *T_Block {
	out := NewBlock()

	stylemap.PropRange(func(key, val string) {
		if key[0] == '@' {
			for _, r := range prefix_ForAtRule(key, vendors).Keys() {
				out.SetProp(r+";", "")
			}
		} else {
			for _, kv := range prefix_LoadProps(key, val, vendors) {
				k, v := kv[0], kv[1]
				if hasProp, _ := stylemap.GetProp(k); hasProp || k == key {
					out.SetProp(k+":"+_space+v+";", "")
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

func render_Partial(stylemap *T_Block, vendors []string) []string {
	stylesheet := []string{}

	prefixed := render_Prefixer(stylemap, vendors)

	if prefixed.PropLen() > 0 {
		prefixed.PropRange(func(k, v string) {
			if k[0] == '@' {
				stylesheet = append(stylesheet, k)
			} else {
				stylesheet = append(stylesheet, k+_space+v)
			}
		})
	}

	if prefixed.BlockLen() > 0 {
		prefixed.BlockRange(func(k string, v *T_Block) {
			if !_minify {
				stylesheet = append(stylesheet, "")
			}

			if _string.HasPrefix(k, "@") {
				atprefixes := prefix_ForAtRule(k, vendors)
				atprefixes.Range(func(vendor, selector string) {
					composed := render_Partial(v, render_LoadVendors(atprefixes, vendor))
					if len(composed) > 0 {
						stylesheet = append(stylesheet, selector+_space+"{")
						for _, i := range composed {
							stylesheet = append(stylesheet, _tab+i)
						}
						stylesheet = append(stylesheet, "}")

					}
				})

			} else {
				composed := render_Partial(v, vendors)
				for index, line := range composed {
					composed[index] = _tab + line
				}
				if len(composed) > 0 {
					selectors := prefix_ForPseudos(k, vendors)
					finalIndex := len(selectors) - 1
					for i, s := range selectors {
						if finalIndex == i {
							selectors[i] = s + _space + "{"
						} else {
							selectors[i] = s + ","
						}
					}
					stylesheet = append(stylesheet, selectors...)
					stylesheet = append(stylesheet, composed...)
					stylesheet = append(stylesheet, "}")
				}
			}
		})
	}

	return stylesheet
}

func Render_Vendored(stylemap *T_Block, minify bool) string {
	SetMinification(minify)
	return _string.Join(render_Partial(stylemap.Flatten(), vendor_Providers), _breaks)
}

func Render_Sequence(seq *T_BlockSeq, minify bool) string {
	SetMinification(minify)

	lines := []string{}
	for _, i := range seq.Units {
		if i.CssBlock.Len() > 0 {
			lines = append(lines, i.Selector+_space+"{")
			for _, line := range render_Partial(i.CssBlock, vendor_Providers) {
				lines = append(lines, _tab+line)
			}
			lines = append(lines, "}"+_breaks)
		} else {
			lines = append(lines, i.Selector+";")
		}
	}

	return _string.Join(lines, _breaks)
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

func Render_Switched(This *T_Block, minify bool) string {
	SetMinification(minify)

	switched := NewBlock()
	switched.SetBlock("", NewBlock())
	_, inq := switched.GetBlock("")
	This.PropRange(func(k, v string) {
		switched.SetProp(k, v)
	})

	switched.BlockRange(func(k0 string, v0 *T_Block) {
		v0.BlockRange(func(k1 string, v1 *T_Block) {
			if k1 == "" {
				inq.SetBlock(k0, v0)
			} else {
				if wrappers, err := _util.Code_JsonParse[[]string](k1); err == nil {
					keyseq := []string{}
					for index, wrapper := range wrappers {
						if index == 0 || wrappers[index-1][0] == '@' || wrapper[0] == '@' {
							keyseq = append(keyseq, wrapper)
						} else {
							keyseq = append(keyseq, "& "+wrapper)
						}
					}
					render_Wrapper(switched, keyseq, v1)
				}
			}
		})
	})

	return Render_Vendored(switched, minify)
}
