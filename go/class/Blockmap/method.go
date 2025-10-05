package blockmap

import (
	_utils_ "main/utils"
	"slices"
)

func (This *Class) GetProp(key string) (val string, ok bool) {
	if val, ok := This.prop_vals[key]; ok {
		return val, true
	}
	return "", false
}

func (This *Class) GetBlock(key string) (val *Class, ok bool) {
	if val, ok := This.block_vals[key]; ok {
		return val, true
	}
	return nil, false
}

func (This *Class) PropRange() map[string]string {
	rangemap := make(map[string]string, len(This.prop_keys))
	for _, k := range This.prop_keys {
		if val, ok := This.prop_vals[k]; ok {
			rangemap[k] = val
		}
	}
	return rangemap
}

func (This *Class) BlockRange() map[string]*Class {
	rangemap := make(map[string]*Class, len(This.block_keys))
	for _, k := range This.block_keys {
		if val, ok := This.block_vals[k]; ok {
			rangemap[k] = val
		}
	}
	return rangemap
}

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

func (This *Class) PropLen() int {
	return len(This.prop_vals)
}

func (This *Class) BlockLen() int {
	return len(This.block_vals)
}

func (This *Class) Len() int {
	return This.PropLen() + This.BlockLen()
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
		if tval, isBlock := This.GetBlock(skey); isBlock {
			tval.Mixin(*sval)
			This.block_vals[skey] = tval
		} else {
			This.SetBlock(skey, *sval)
		}
	}
	This.block_keys = _utils_.Array_Setfront(append(This.block_keys, source.block_keys...))

	return This
}
