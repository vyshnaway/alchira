package blockmap

import (
	"strings"
)

type block_groups struct {
	props      Type
	native     []string
	comps_list []string
	clven_list []string
	clstd_list []string
	elven_list []string
	elstd_list []string
	child_list []string
	atven_list []string
	atstd_list []string
}

func (This *Type) Flatten(parent string) (Res *Type) {

	track := block_groups{
		comps_list: []string{},
		clven_list: []string{},
		clstd_list: []string{},
		elven_list: []string{},
		elstd_list: []string{},
		child_list: []string{},
		atven_list: []string{},
		atstd_list: []string{},
		native:     []string{},
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
			track.elven_list = append(track.elven_list, k)
		} else if strings.HasPrefix(k, "&::") {
			track.elstd_list = append(track.elstd_list, k)
		} else if strings.HasPrefix(k, "&:-") {
			track.clven_list = append(track.clven_list, k)
		} else if strings.HasPrefix(k, "&:") {
			track.clstd_list = append(track.clstd_list, k)
		} else if strings.HasPrefix(k, "& ") {
			track.child_list = append(track.child_list, k)
		} else if strings.HasPrefix(k, "&") {
			track.comps_list = append(track.comps_list, k)
		} else if strings.HasPrefix(k, "@-") {
			track.atven_list = append(track.atven_list, k)
		} else if strings.HasPrefix(k, "@") {
			track.atstd_list = append(track.atstd_list, k)
		} else if len(k) > 0 {
			track.native = append(track.native, k)
		} else {
			track.props.Mixin(v)
		}
	})

	add := func(target *Type, list []string) {
		for _, k := range list {
			if o, v := This.GetBlock(k); o {
				if strings.HasPrefix(k, "&") {
					k = parent + k[1:]
				}
				v.Flatten(k).BlockRange(func(kk string, vv Type) {
					target.SetBlock(kk, vv)
				})
			}
		}
	}

	sub := &track.props
	add(sub, track.native)
	add(sub, track.atven_list)
	add(sub, track.atstd_list)
	sub.Print()

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
