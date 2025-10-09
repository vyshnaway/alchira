package css

import (
	"fmt"
	"slices"
	"strings"
)

func (This *T_Block) flatten(parent string) (Res *T_Block) {

	blocksort := func(list []string) []string {

		outs := []string{}
		mins := []string{}
		maxs := []string{}
		none := []string{}

		for _, key := range list {
			min := strings.Index(key, "min-")
			max := strings.Index(key, "max-")
			if key != "" {
				if min < max {
					mins = append(mins, key)
				} else if min > max {
					maxs = append(maxs, key)
				} else {
					none = append(none, key)
				}
			}
		}

		slices.Sort(none)
		slices.Sort(maxs)
		slices.Sort(mins)
		slices.Reverse(mins)

		outs = append(outs, none...)
		outs = append(outs, maxs...)
		outs = append(outs, mins...)

		return outs
	}

	comps_list := []string{}
	clven_list := []string{}
	clstd_list := []string{}
	elven_list := []string{}
	elstd_list := []string{}
	child_list := []string{}
	atven_list := []string{}
	atstd_list := []string{}
	native := []string{}
	props := *NewBlock()

	sat_prop := []string{}
	vat_prop := []string{}
	constant := []string{}
	variable := []string{}
	ven_prop := []string{}
	std_prop := []string{}

	This.PropRange(func(k, _ string) {
		if strings.HasPrefix(k, "---") {
			constant = append(constant, k)
		} else if strings.HasPrefix(k, "--") {
			variable = append(variable, k)
		} else if strings.HasPrefix(k, "-") {
			ven_prop = append(ven_prop, k)
		} else if strings.HasPrefix(k, "@-") {
			vat_prop = append(vat_prop, k)
		} else if strings.HasPrefix(k, "@") {
			sat_prop = append(sat_prop, k)
		} else if len(k) > 0 {
			std_prop = append(std_prop, k)
		}
	})

	prop_order := []string{}
	prop_order = append(prop_order, sat_prop...)
	prop_order = append(prop_order, vat_prop...)
	prop_order = append(prop_order, constant...)
	prop_order = append(prop_order, variable...)
	prop_order = append(prop_order, ven_prop...)
	prop_order = append(prop_order, std_prop...)

	for _, k := range prop_order {
		if ok, v := This.GetProp(k); ok {
			props.SetProp(k, v)
		}
	}

	This.BlockRange(func(k string, v *T_Block) {
		if strings.HasPrefix(k, "&::-") {
			elven_list = append(elven_list, k)
		} else if strings.HasPrefix(k, "&::") {
			elstd_list = append(elstd_list, k)
		} else if strings.HasPrefix(k, "&:-") {
			clven_list = append(clven_list, k)
		} else if strings.HasPrefix(k, "&:") {
			clstd_list = append(clstd_list, k)
		} else if strings.HasPrefix(k, "& ") {
			child_list = append(child_list, k)
		} else if strings.HasPrefix(k, "&") {
			comps_list = append(comps_list, k)
		} else if strings.HasPrefix(k, "@-") {
			atven_list = append(atven_list, k)
		} else if strings.HasPrefix(k, "@") {
			atstd_list = append(atstd_list, k)
		} else if len(k) > 0 {
			native = append(native, k)
		} else {
			props.Mixin(v)
		}
	})

	atven_list = blocksort(atven_list)
	atstd_list = blocksort(atstd_list)

	add := func(target *T_Block, list []string) {
		for _, k := range list {
			if o, v := This.GetBlock(k); o {
				if strings.HasPrefix(k, "&") {
					k = parent + k[1:]
				}
				v.flatten(k).BlockRange(func(kk string, vv *T_Block) {
					target.SetBlock(kk, vv)
				})
			}
		}
	}

	sub := &props
	add(sub, native)
	add(sub, atven_list)
	add(sub, atstd_list)

	all := NewBlock()
	add(all, comps_list)
	add(all, clven_list)
	add(all, clstd_list)
	all.SetBlock(parent, sub)
	add(all, elven_list)
	add(all, elstd_list)
	add(all, child_list)

	return all
}

func (This *T_Block) Flatten() (Res *T_Block) {
	all := NewBlock()

	This.PropRange(func(k, v string) {
		all.SetProp(k, v)
	})

	This.BlockRange(func(k string, v *T_Block) {
		all.Mixin(v.flatten(k))
	})

	return all
}

func (This *T_Block) PropRange(fn func(k string, v string)) {
	for _, key := range This.Prop_keys {
		if ok, val := This.GetProp(key); ok {
			fn(key, val)
		}
	}
}

func (This *T_Block) BlockRange(fn func(k string, v *T_Block)) {
	for _, key := range This.Block_keys {
		if ok, val := This.GetBlock(key); ok {
			fn(key, val)
		}
	}
}

func (This *T_Block) print() []string {
	const tab = "  "
	result := []string{}

	This.PropRange(func(k, v string) {
		result = append(result, k+": "+v)
	})
	This.BlockRange(func(k string, v *T_Block) {
		result = append(result, k+" {")
		for _, vv := range v.print() {
			result = append(result, tab+vv)
		}
		result = append(result, "}")
	})
	return result
}

func (This *T_Block) Print() *T_Block {
	fmt.Println("\n---\n" + strings.Join(This.print(), "\n") + "\n---\n")
	return This
}

func (This *T_Block) Skeleton() any {
	result := map[string]any{}

	This.PropRange(func(k string, v string) {
		if strings.HasPrefix(k, "--") {
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
		return NewBlock()
	}
	copy := &T_Block{
		Prop_keys:  make([]string, len(This.Prop_keys)),
		prop_vals:  make(map[string]string, len(This.prop_vals)),
		Block_keys: make([]string, len(This.Block_keys)),
		block_vals: make(map[string]*T_Block, len(This.block_vals)),
	}

	copy.Prop_keys = append(copy.Prop_keys, This.Prop_keys...)

	for key, val := range This.prop_vals {
		copy.prop_vals[key] = val
	}

	copy.Block_keys = append(copy.Block_keys, This.Block_keys...)

	for key, val := range This.block_vals {
		if val != nil {
			copy.block_vals[key] = val.Clone()
		}
	}

	return copy
}
