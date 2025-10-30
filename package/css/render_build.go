package css

import (
	// "main/package/console"
	O "main/package/object"
	_util "main/package/utils"
	_slice "slices"
	_string "strings"
)

var _tab = ""
var _break = ""
var _space = ""
var _minify = false

func set_MinifyOptions(active bool) {
	_minify = active
	if active {
		_tab = ""
		_break = ""
		_space = ""
	} else {
		_tab = "	"
		_space = " "
		_break = "\r\n"
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

func render_Prefixes(stylemap *T_Block, vendors []string) *T_Block {
	out := NewBlock(len(vendor_Providers), 0)

	stylemap.PropRange(func(key, val string) {
		if key[0] == '@' {
			prefix_ForAtRule(key, vendors).Range(func(k, v string) {
				if len(v) > 0 {
					out.SetProp(v+";", "")
				}
			})
		} else {
			for _, kv := range prefix_LoadProps(key, val, vendors) {
				k, v := kv[0], kv[1]
				if len(k) == 0 {
					continue
				}
				if i, _ := stylemap.GetProp(k); i > -1 || k == key {
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

func render_Partial(stylemap *T_Block, vendors []string, first bool) []string {
	stylesheet := []string{}

	prefixed := render_Prefixes(stylemap, vendors)

	if prefixed.PropLen() > 0 {
		if !_minify && first {
			stylesheet = append(stylesheet, "")
		}
		prefixed.PropRange(func(k, v string) {
			if k[0] == '@' {
				stylesheet = append(stylesheet, k)
			} else if len(k) > 0 {
				stylesheet = append(stylesheet, k+_space+v)
			}
		})
	}

	if prefixed.BlockLen() > 0 {
		prefixed.BlockRange(func(k string, v *T_Block) {
			if !_minify && first {
				stylesheet = append(stylesheet, "")
			}
			if _string.HasPrefix(k, "@") {
				atprefixes := prefix_ForAtRule(k, vendors)
				atprefixes.Range(func(vendor, selector string) {
					composed := render_Partial(v, render_LoadVendors(atprefixes, vendor), false)
					if len(composed) > 0 {
						stylesheet = append(stylesheet, selector+_space+"{")
						for _, i := range composed {
							stylesheet = append(stylesheet, _tab+i)
						}
						stylesheet = append(stylesheet, "}")

					}
				})

			} else {
				composed := render_Partial(v, vendors, false)
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
	set_MinifyOptions(minify)
	return _string.Join(render_Partial(stylemap.Flatten(), vendor_Providers, true), _break)
}

func Render_Sequence(seq *T_BlockSeq, minify bool) string {
	set_MinifyOptions(minify)

	lines := []string{}
	for _, u := range seq.Units {
		if u.CssBlock != nil {
			temp := NewBlock(0, 1)
			temp.SetBlock(u.Selector, u.CssBlock)
			lines = append(lines, _break)
			lines = append(lines, render_Partial(temp, vendor_Providers, false)...)
		} else {
			if len(lines) == 0 {
				lines = append(lines, "")
			}
			if len(u.Selector) > 0 {
				lines = append(lines, u.Selector+";")
			}
		}
	}

	return _string.Join(lines, _break)
}

func Render_Switched(refmap *T_Block, minify bool) string {
	set_MinifyOptions(minify)
	p, b := refmap.PropLen(), refmap.BlockLen()
	nonwrap := NewBlock(p, b)
	rulewrap := NewBlock(p, b)
	labelwrap := NewBlock(p, b)
	refmap.PropRange(func(k, v string) {
		nonwrap.SetProp(k, v)
	})

	refmap.BlockRange(func(k0 string, v0 *T_Block) {
		v0.BlockRange(func(k1 string, v1 *T_Block) {
			if k1 == "[]" {
				nonwrap.SetBlock(k0, v1)
			} else if wrappers, err := _util.Code_JsoncParse[[]string](k1); err == nil {
				var target *T_Block
				if k1[0] == ' ' {

					target = labelwrap
				} else {
					target = rulewrap
				}

				temp := v1
				finalIndex := len(wrappers)
				wrappers = append(wrappers, k0)
				_slice.Reverse(wrappers)

				p, b := v1.PropLen(), v1.BlockLen()
				for index := 0; index < len(wrappers); index++ {
					wrapper := wrappers[index]

					if index != finalIndex && wrapper != "" && wrapper[0] != '&' {
						if index+1 < len(wrappers) && wrappers[index+1] != "" && wrappers[index+1][0] != '@' {
							wrapper = "& " + wrapper
						}
					}

					t := temp
					temp = NewBlock(p, b)
					temp.SetBlock(wrapper, t)
				}
				target.Merge(temp)
			}
		})
	})

	var builder _string.Builder
	builder.WriteString(Render_Vendored(labelwrap, minify))
	builder.WriteString(_break)
	builder.WriteString(Render_Vendored(nonwrap, minify))
	builder.WriteString(_break)
	builder.WriteString(Render_Vendored(rulewrap, minify))
	builder.WriteString(_break)
	return builder.String()
}
