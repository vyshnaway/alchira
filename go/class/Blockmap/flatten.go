package blockmap

import (
	"strings"
)

type block_groups struct {
	native         Type
	compounds      []Track
	vendor_class   []Track
	pseudo_class   []Track
	vendor_element []Track
	pseudo_element []Track
	children       []Track
	vendor_atblock []Track
	atblock        []Track
}

func (groups *block_groups) merge_groups(parent string) *Type {
	tr := []Track{}

	add := func(list []Track) {
		for _, item := range list {
			k := item.Selector
			if strings.HasPrefix(k, "&") {
				k = parent + k[1:]
			}
			tr = append(tr, Track{
				Selector: k,
				Blockmap: item.Blockmap,
			})
		}
	}

	add(groups.compounds)
	add(groups.vendor_class)
	add(groups.pseudo_class)
	add(groups.vendor_element)
	tr = append(tr, Track{
		Selector: parent,
		Blockmap: &groups.native,
	})
	add(groups.pseudo_element)
	add(groups.children)
	add(groups.vendor_atblock)
	add(groups.atblock)

	rs := New()
	for _, i := range tr {
		rs.SetBlock(i.Selector, *i.Blockmap)
	}
	return rs
}

func (This *Type) Flatten(parent string) (Res *Type) {

	track := block_groups{
		compounds:      []Track{},
		vendor_class:   []Track{},
		pseudo_class:   []Track{},
		vendor_element: []Track{},
		pseudo_element: []Track{},
		vendor_atblock: []Track{},
		atblock:        []Track{},
		children:       []Track{},
		native:         *New(),
	}

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
			track.native.SetProp(k, v)
		}
	}

	This.BlockRange(func(k string, v Type) {

		if strings.HasPrefix(k, "&::-") {
			track.vendor_element = append(track.vendor_element, Track{Selector: k, Blockmap: &v})
		} else if strings.HasPrefix(k, "&::") {
			track.pseudo_element = append(track.pseudo_element, Track{Selector: k, Blockmap: &v})
		} else if strings.HasPrefix(k, "&:-") {
			track.vendor_class = append(track.vendor_class, Track{Selector: k, Blockmap: &v})
		} else if strings.HasPrefix(k, "&:") {
			track.pseudo_class = append(track.pseudo_class, Track{Selector: k, Blockmap: &v})
		} else if strings.HasPrefix(k, "& ") {
			track.children = append(track.children, Track{Selector: k, Blockmap: &v})
		} else if strings.HasPrefix(k, "&") {
			track.compounds = append(track.compounds, Track{Selector: k, Blockmap: &v})
		} else if strings.HasPrefix(k, "@-") {
			track.vendor_atblock = append(track.vendor_atblock, Track{Selector: k, Blockmap: &v})
		} else if strings.HasPrefix(k, "@") {
			track.atblock = append(track.atblock, Track{Selector: k, Blockmap: &v})
		} else if len(k) > 0 {
			track.native.SetBlock(k, v)
		} else {
			track.native.Mixin(v)
		}
	})

	res := New()
	track.merge_groups(parent).BlockRange(func(k string, v Type) {
		res.Mixin(v)
	})

	// push_new := func(order []Track) {
	// 	for _, k := range order {
	// 		if ok, v := This.GetBlock(k); ok {
	// 			r, b := v.flatten(k)
	// 			if strings.HasPrefix(k, "&") {
	// 				buf = append(buf, Track{
	// 					Selector: parent + k[1:],
	// 					Blockmap: r,
	// 				})
	// 			} else {
	// 				tmp.SetBlock(k, *r)
	// 			}
	// 			for _, bb := range b {
	// 				new.SetBlock(bb.Selector, *bb.Blockmap)
	// 			}
	// 		}
	// 	}
	// }

	// 	push_tmp := func ([]tracks) {

	// 	}
	// track.flat_block
	// track.nest_block
	// track.vendor_atblock
	// track.atblock

	// 	push_new(base_block)
	// 	push_new(compounds)
	// 	push_new(vendor_class)
	// 	push_new(pseudo_class)
	// 	push_new(nest_block)
	// 	// new.Mixin(*tmp)
	// 	push_new(vendor_element)
	// 	push_new(pseudo_element)
	// 	push_new(children)
	// 	push_new(vendor_atblock)
	// 	push_new(atblock)

	return res
}
