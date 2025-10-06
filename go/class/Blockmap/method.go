package blockmap

import (
	_utils_ "main/utils"
)

func (This *Type) Clone() *Type {
	if This == nil {
		return New()
	}
	copy := &Type{
		Prop_keys:  make([]string, len(This.Prop_keys)),
		prop_vals:  make(map[string]string, len(This.prop_vals)),
		Block_keys: make([]string, len(This.Block_keys)),
		block_vals: make(map[string]*Type, len(This.block_vals)),
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

func (This *Type) Mixin(source Type) *Type {
	if This.prop_vals == nil {
		This.prop_vals = make(map[string]string)
	}
	if This.Prop_keys == nil {
		This.Prop_keys = make([]string, 0)
	}
	if This.block_vals == nil {
		This.block_vals = make(map[string]*Type)
	}
	if This.Block_keys == nil {
		This.Block_keys = make([]string, 0)
	}

	source.PropRange(func(k, v string) {
		This.SetProp(k, v)
	})
	This.Prop_keys = _utils_.Array_SetAppend(This.Prop_keys, source.Prop_keys...)

	source.BlockRange(func(skey string, sval Type) {
		if isBlock, tval := This.GetBlock(skey); isBlock {
			tval.Mixin(sval)
			This.SetBlock(skey, *tval)
		} else {
			This.SetBlock(skey, sval)
		}
	})
	This.Block_keys = _utils_.Array_SetAppend(This.Block_keys, source.Block_keys...)

	return This
}
