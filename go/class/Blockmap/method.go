package blockmap

import (
	_utils_ "main/utils"
)


func (This *Class) Clone() *Class {
	if This == nil {
		return New()
	}
	copy := &Class{
		prop_keys:  make([]string, len(This.prop_keys)),
		prop_vals:  make(map[string]string, len(This.prop_vals)),
		block_keys: make([]string, len(This.block_keys)),
		block_vals: make(map[string]*Class, len(This.block_vals)),
	}

	copy.prop_keys = append(copy.prop_keys, This.prop_keys...)

	for key, val := range This.prop_vals {
		copy.prop_vals[key] = val
	}

	copy.block_keys = append(copy.block_keys, This.block_keys...)

	for key, val := range This.block_vals {
		if val != nil {
			copy.block_vals[key] = val.Clone()
		}
	}

	return copy
}

func (This *Class) Mixin(source Class) *Class {
	if This.prop_vals == nil {
		This.prop_vals = make(map[string]string)
	}
	if This.prop_keys == nil {
		This.prop_keys = make([]string, 0)
	}
	if This.block_vals == nil {
		This.block_vals = make(map[string]*Class)
	}
	if This.block_keys == nil {
		This.block_keys = make([]string, 0)
	}

	for skey, sval := range source.PropRange() {
		This.SetProp(skey, sval)
	}
	This.prop_keys = _utils_.Array_Setfront(append(This.prop_keys, source.prop_keys...))

	for skey, sval := range source.BlockRange() {
		if isBlock, tval := This.GetBlock(skey); isBlock {
			tval.Mixin(*sval)
			This.block_vals[skey] = tval
		} else {
			This.SetBlock(skey, *sval)
		}
	}
	This.block_keys = _utils_.Array_Setfront(append(This.block_keys, source.block_keys...))

	return This
}
