package blockmap

import (
	"main/shell"
	"strings"
)

func (This *Type) Flatten() (Res *Type) {
	res, _ := This.flatten()
	return res
}

func (This *Type) flatten() (Res *Type, Buf []Tracks) {
	new := New()
	buf := []Tracks{}

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
			new.SetProp(k, v)
		}
	}

	compounds := []string{}
	vendor_class := []string{}
	pseudo_class := []string{}
	nest_block := []string{}
	vendor_element := []string{}
	pseudo_element := []string{}
	vendor_atblock := []string{}
	atblock := []string{}
	children := []string{}
	base_block := []string{}

	This.BlockRange(func(k string, v Type) {
		if strings.HasPrefix(k, "&::-") {
			vendor_element = append(vendor_element, k)
		} else if strings.HasPrefix(k, "&::") {
			pseudo_element = append(pseudo_element, k)
		} else if strings.HasPrefix(k, "&:-") {
			vendor_class = append(vendor_class, k)
		} else if strings.HasPrefix(k, "&:") {
			pseudo_class = append(pseudo_class, k)
		} else if strings.HasPrefix(k, "& ") {
			children = append(children, k)
		} else if strings.HasPrefix(k, "&") {
			compounds = append(compounds, k)
		} else if strings.HasPrefix(k, "@-") {
			vendor_atblock = append(vendor_atblock, k)
		} else if strings.HasPrefix(k, "@") {
			atblock = append(atblock, k)
		} else if len(k) > 0 {
			nest_block = append(nest_block, k)
		} else {
			base_block = append(base_block, k)
		}
	})

	block_order := []string{}
	block_order = append(block_order, base_block...)
	block_order = append(block_order, compounds...)
	block_order = append(block_order, vendor_class...)
	block_order = append(block_order, pseudo_class...)
	block_order = append(block_order, nest_block...)
	block_order = append(block_order, vendor_element...)
	block_order = append(block_order, pseudo_element...)
	block_order = append(block_order, vendor_atblock...)
	block_order = append(block_order, atblock...)
	block_order = append(block_order, children...)

	shell.Render.Raw(block_order)
	for _, k := range block_order {
		if ok, v := This.GetBlock(k); ok {
			r, _ := v.flatten()
			r.BlockRange(func(kk string, vv Type) {
				new.SetBlock(k, *v)
			})
			// for _, bb := range b {
			// 	bb.Selector
			// }
		}
	}

	return new, buf
}

// func (This *Type) Flattehn() *Type {
// 	new := New()

// 	This.PropRange(func(k, v string) {
// 		new.SetProp(k, v)
// 	})

// 	This.BlockRange(func(k string, v Type) {
// 		nn := New()

// 		v.PropRange(func(k, v string) {
// 			nn.SetProp(k, v)
// 		})

// 		v.BlockRange(func(kk string, vv Type) {
// 			vvv := *vv.Flatten()
// 			if strings.HasPrefix(kk, "&") {
// 				s := k + kk[1:]
// 				nn.SetBlock(s, vvv)
// 			} else {
// 				nn.SetBlock(kk, vvv)
// 			}
// 		})

// 		// new.SetBlock(k, *nn)
// 	})

// 	return new
// }
