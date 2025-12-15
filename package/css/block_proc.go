package css

import (
	_fmt "fmt"
	_string "strings"
)

func (This *T_Block) PropRange(fn func(k string, v string)) {
	for index, key := range This.Prop_keys {
		fn(key, This.Prop_vals[index])
	}
}

func (This *T_Block) BlockRange(fn func(k string, v *T_Block)) {
	for index, key := range This.Block_keys {
		fn(key, This.Block_vals[index])
	}
}

func (This *T_Block) format(minify bool) []string {
	tab := "  "
	space := " "
	if minify {
		tab = ""
		space = ""
	}
	result := []string{}

	This.PropRange(func(k, v string) {
		str := k
		if len(v) > 0 {
			str += ":" + space + v
		}
		str += ";"
		result = append(result, str)
	})
	This.BlockRange(func(k string, v *T_Block) {
		result = append(result, k+" {")
		for _, vv := range v.format(minify) {
			result = append(result, tab+vv)
		}
		result = append(result, "}")
	})
	return result
}

func (This *T_Block) Format(minify bool) string {
	br := "\r\n"
	if minify {
		br = ""
	}
	return _string.Join(This.format(minify), br)
}

func (This *T_Block) Print() *T_Block {
	_fmt.Println("\r\n---\r\n" + This.Format(false) + "\r\n---\r\n")
	return This
}

func (This *T_Block) Skeleton() any {
	result := map[string]any{}

	This.PropRange(func(k string, v string) {
		if _string.HasPrefix(k, "--") {
			result[k] = v
		}
	})

	This.BlockRange(func(k string, v *T_Block) {
		result[k] = v.Skeleton()
	})

	return result
}

func (This *T_Block) Clone() *T_Block {
	if This == nil {
		return NewBlock(0, 0)
	}
	c := NewBlock(cap(This.Prop_keys), cap(This.Block_keys))

	This.PropRange(func(k string, v string) {
		c.SetProp(k, v)
	})
	This.BlockRange(func(k string, v *T_Block) {
		c.SetBlock(k, v)
	})

	return c
}
