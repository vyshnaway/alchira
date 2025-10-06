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
	vendor_atblock Type
	atblock        Type
}

func (groups *block_groups) merge_groups(parent string) *Type {
	tr := []Track{}

	add := func(list []Track) {
		for _, item := range list {
			k := item.Selector
			if strings.HasPrefix(k, "&") {
				k = parent + k[1:]
			} 
			item.Blockmap.Flatten(k).BlockRange(func(kk string, vv Type) {
				tr = append(tr, Track{
					Selector: kk,
					Blockmap: &vv,
				})
			})
		}
	}

	add(groups.compounds)
	add(groups.vendor_class)
	add(groups.pseudo_class)

	sub := New()
	sub.Mixin(groups.native)
	sub.Mixin(groups.vendor_atblock)
	sub.Mixin(groups.atblock)
	tr = append(tr, Track{
		Selector: parent,
		Blockmap: sub,
	})

	add(groups.vendor_element)
	add(groups.pseudo_element)
	add(groups.children)

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
		children:       []Track{},
		vendor_atblock: *New(),
		atblock:        *New(),
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
			track.vendor_atblock.SetBlock(k, v)
		} else if strings.HasPrefix(k, "@") {
			track.atblock.SetBlock(k, v)
		} else if len(k) > 0 {
			track.native.SetBlock(k, v)
		} else {
			track.native.Mixin(v)
		}
	})

	res := New()
	track.merge_groups(parent).BlockRange(func(k string, v Type) {
		res.SetBlock(k, v)
	})

	return res
}
