package css

import (
	_slice "slices"
	_string "strings"
)

func amparsandSuffixLen(str string) int {
	count := 0
	for i := len(str) - 1; i >= 0; i-- {
		if str[i] == '&' || str[i] == '*' {
			count++
		} else {
			break
		}
	}
	return count
}

func (This *T_Block) flatten(parent string) (Res *T_Block) {

	blocksort := func(list []string) []string {

		l := len(list)
		outs := make([]string, 0, l)
		mins := make([]string, 0, l)
		maxs := make([]string, 0, l)
		none := make([]string, 0, l)

		for _, key := range list {
			min := _string.Index(key, "min-")
			max := _string.Index(key, "max-")
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

		_slice.Sort(none)
		_slice.Sort(maxs)
		_slice.Sort(mins)
		_slice.Reverse(mins)

		outs = append(outs, none...)
		outs = append(outs, maxs...)
		outs = append(outs, mins...)

		return outs
	}

	p := This.PropLen()
	b := This.BlockLen()
	natives := NewBlock(p, b)

	sat_prop := make([]string, 0, p)
	vat_prop := make([]string, 0, p)
	constant := make([]string, 0, p)
	variable := make([]string, 0, p)
	ven_prop := make([]string, 0, p)
	std_prop := make([]string, 0, p)

	This.PropRange(func(k, _ string) {
		if _string.HasPrefix(k, "---") {
			constant = append(constant, k)
		} else if _string.HasPrefix(k, "--") {
			variable = append(variable, k)
		} else if _string.HasPrefix(k, "-") {
			ven_prop = append(ven_prop, k)
		} else if _string.HasPrefix(k, "@-") {
			vat_prop = append(vat_prop, k)
		} else if _string.HasPrefix(k, "@") {
			sat_prop = append(sat_prop, k)
		} else if len(k) > 0 {
			std_prop = append(std_prop, k)
		}
	})

	prop_order := make([]string, 0, p)
	prop_order = append(prop_order, sat_prop...)
	prop_order = append(prop_order, vat_prop...)
	prop_order = append(prop_order, constant...)
	prop_order = append(prop_order, variable...)
	prop_order = append(prop_order, ven_prop...)
	prop_order = append(prop_order, std_prop...)

	for _, k := range prop_order {
		if index, v := This.GetProp(k); index > -1 {
			natives.SetProp(k, v)
		}
	}

	comps_list := make([]string, 0, b)
	clven_list := make([]string, 0, b)
	clstd_list := make([]string, 0, b)
	elven_list := make([]string, 0, b)
	elstd_list := make([]string, 0, b)
	child_list := make([]string, 0, b)
	atven_list := make([]string, 0, b)
	atstd_list := make([]string, 0, b)
	nativ_list := make([]string, 0, b)

	This.BlockRange(func(k string, v *T_Block) {
		if _string.HasPrefix(k, "&::-") {
			elven_list = append(elven_list, k)
		} else if _string.HasPrefix(k, "&::") {
			elstd_list = append(elstd_list, k)
		} else if _string.HasPrefix(k, "&:-") {
			clven_list = append(clven_list, k)
		} else if _string.HasPrefix(k, "&:") {
			clstd_list = append(clstd_list, k)
		} else if _string.HasPrefix(k, "& ") {
			child_list = append(child_list, k)
		} else if _string.HasPrefix(k, "&") {
			comps_list = append(comps_list, k)
		} else if _string.HasPrefix(k, "@-") {
			atven_list = append(atven_list, k)
		} else if _string.HasPrefix(k, "@") {
			atstd_list = append(atstd_list, k)
		} else if len(k) > 0 {
			nativ_list = append(nativ_list, k)
		} else {
			natives.Merge(v)
		}
	})

	atven_list = blocksort(atven_list)
	atstd_list = blocksort(atstd_list)

	add := func(target *T_Block, list []string) {
		for _, k := range list {
			if i, v := This.GetBlock(k); i > -1 {
				if _string.HasPrefix(k, "&") {
					k = k[1:]
					temparent := parent
					if trimlen := amparsandSuffixLen(parent); trimlen > 0 {
						trimBytes := trimlen * 2
						if len(temparent) >= trimBytes {
							temparent = temparent[:len(temparent)-trimBytes]
						} else {
							temparent = "" // or handle underflow case appropriately
						}

						if len(k) >= trimlen {
							k = k[trimlen:]
						} else {
							k = "" // or handle overflow case appropriately
						}
					}
					k = temparent + k
				}
				v.flatten(k).BlockRange(func(kk string, vv *T_Block) {
					target.SetBlock(kk, vv)
				})
			}
		}
	}

	add(natives, nativ_list)
	add(natives, atven_list)
	add(natives, atstd_list)

	all := NewBlock(This.PropLen(), This.BlockLen())
	all.SetBlock(parent, natives)
	add(all, comps_list)
	add(all, clven_list)
	add(all, clstd_list)
	// all.SetBlock(parent, natives)
	add(all, elven_list)
	add(all, elstd_list)
	add(all, child_list)

	return all
}

func (This *T_Block) Flatten() *T_Block {
	all := NewBlock(This.PropLen(), This.BlockLen())

	This.PropRange(func(k string, v string) {
		all.SetProp(k, v)
	})

	This.BlockRange(func(k string, v *T_Block) {
		all.Merge(v.flatten(k))
	})

	return all
}
