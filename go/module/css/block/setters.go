package block

import (
	_utils_ "main/module/utils"
	"slices"
)

func (This *Type) SetProp(key string, val string) {
	if This.prop_vals == nil {
		This.prop_vals = make(map[string]string)
	}
	if _, ok := This.prop_vals[key]; !ok {
		This.Prop_keys = append(This.Prop_keys, key)
	}
	This.prop_vals[key] = val
}

func (This *Type) SetBlock(key string, val Type) *Type {
	if This.block_vals == nil {
		This.block_vals = make(map[string]*Type)
	}
	if _, ok := This.block_vals[key]; !ok {
		This.Block_keys = append(This.Block_keys, key)
	}
	This.block_vals[key] = val.Clone()

	return This.block_vals[key]
}

func (This *Type) DelProp(key string) *Type {
	if This.prop_vals != nil {
		if i := slices.Index(This.Prop_keys, key); i != -1 {
			This.Prop_keys = _utils_.Array_RemoveAt(This.Prop_keys, i)
			delete(This.prop_vals, key)
		}
	}
	return This
}

func (This *Type) DelBlock(key string) *Type {
	if This.block_vals != nil {
		if i := slices.Index(This.Block_keys, key); i != -1 {
			This.Block_keys = _utils_.Array_RemoveAt(This.Block_keys, i)
			delete(This.block_vals, key)
		}
	}
	return This
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
