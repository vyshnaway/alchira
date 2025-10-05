package blockmap


import (
	_utils_ "main/utils"
	"slices"
)


func (This *Class) SetProp(key string, val string) *Class {
	if This.prop_vals == nil {
		This.prop_vals = make(map[string]string)
	}
	if _, ok := This.prop_vals[key]; !ok {
		This.prop_keys = append(This.prop_keys, key)
	}
	This.prop_vals[key] = val
	return This
}

func (This *Class) SetBlock(key string, val Class) *Class {
	if This.block_vals == nil {
		This.block_vals = make(map[string]*Class)
	}
	if _, ok := This.block_vals[key]; !ok {
		This.block_keys = append(This.block_keys, key)
	}
	This.block_vals[key] = val.Clone()

	return This
}

func (This *Class) DelProp(key string) *Class {
	if This.prop_vals != nil {
		if i := slices.Index(This.prop_keys, key); i != -1 {
			This.prop_keys = _utils_.Array_RemoveAt(This.prop_keys, i)
			delete(This.prop_vals, key)
		}
	}
	return This
}

func (This *Class) DelBlock(key string) *Class {
	if This.block_vals != nil {
		if i := slices.Index(This.block_keys, key); i != -1 {
			This.block_keys = _utils_.Array_RemoveAt(This.block_keys, i)
			delete(This.block_vals, key)
		}
	}
	return This
}
