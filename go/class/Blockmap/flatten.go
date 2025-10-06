package blockmap

import (
	"strings"
)

type block_groups struct {
	props      Type
	native     Type
	comps_list Type
	clven_list Type
	clstd_list Type
	elven_list Type
	elstd_list Type
	child_list Type
	atven_list Type
	atstd_list Type
}

func (This *Type) Flatten(parent string) (Res *Type) {

	track := block_groups{
		comps_list: *New(),
		clven_list: *New(),
		clstd_list: *New(),
		elven_list: *New(),
		elstd_list: *New(),
		child_list: *New(),
		atven_list: *New(),
		atstd_list: *New(),
		native:     *New(),
		props:      *New(),
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
			track.props.SetProp(k, v)
		}
	}

	This.BlockRange(func(k string, v Type) {
		if strings.HasPrefix(k, "&::-") {
			track.elven_list.SetBlock(k, v)
		} else if strings.HasPrefix(k, "&::") {
			track.elstd_list.SetBlock(k, v)
		} else if strings.HasPrefix(k, "&:-") {
			track.clven_list.SetBlock(k, v)
		} else if strings.HasPrefix(k, "&:") {
			track.clstd_list.SetBlock(k, v)
		} else if strings.HasPrefix(k, "& ") {
			track.child_list.SetBlock(k, v)
		} else if strings.HasPrefix(k, "&") {
			track.comps_list.SetBlock(k, v)
		} else if strings.HasPrefix(k, "@-") {
			track.atven_list.SetBlock(k, v)
		} else if strings.HasPrefix(k, "@") {
			track.atstd_list.SetBlock(k, v)
		} else if len(k) > 0 {
			track.native.SetBlock(k, v)
		} else {
			track.native.Mixin(v)
		}
	})

	add := func(target *Type, list Type) {
		list.BlockRange(func(k string, v Type) {
			if strings.HasPrefix(k, "&") {
				k = parent + k[1:]
			}
			v.Flatten(k).BlockRange(func(kk string, vv Type) {
				target.SetBlock(kk, vv)
			})
		})
	}
	
	sub := &track.props
	add(sub, track.native)
	add(sub, track.atven_list)
	add(sub, track.atstd_list)

	all := New()
	add(all, track.comps_list)
	add(all, track.clven_list)
	add(all, track.clstd_list)
	all.SetBlock(parent, *sub)
	add(all, track.elven_list)
	add(all, track.elstd_list)
	add(all, track.child_list)

	return all
}
