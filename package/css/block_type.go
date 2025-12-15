package css

import (
	_util "main/package/utils"
	_slice "slices"
)

type T_Block struct {
	Prop_keys  []string
	Prop_vals  []string
	Block_keys []string
	Block_vals []*T_Block
}

func NewBlock(prop_size, block_size int) *T_Block {
	p := _util.Number_AbsInt(prop_size) + 1
	b := _util.Number_AbsInt(block_size) + 1
	return &T_Block{
		Prop_keys:  make([]string, 0, p),
		Prop_vals:  make([]string, 0, p),
		Block_keys: make([]string, 0, b),
		Block_vals: make([]*T_Block, 0, b),
	}
}

// Setters

func (This *T_Block) SetProp(key string, val string) {
	if key == "" {
		return
	}

	if len(This.Prop_keys) == cap(This.Prop_keys) {
		newCap := cap(This.Prop_keys) * 2
		newKeys := make([]string, len(This.Prop_keys), newCap)
		newVals := make([]string, len(This.Prop_vals), newCap)
		copy(newKeys, This.Prop_keys)
		copy(newVals, This.Prop_vals)
		This.Prop_keys = newKeys
		This.Prop_vals = newVals
	}

	if index, _ := This.GetProp(key); index > -1 {
		This.Prop_vals[index] = val
	} else {
		This.Prop_vals = append(This.Prop_vals, val)
		This.Prop_keys = append(This.Prop_keys, key)
	}
}

func (This *T_Block) SetBlock(key string, val *T_Block) {
	if key == "" {
		return
	}

	if len(This.Block_keys) == cap(This.Block_keys) {
		newCap := cap(This.Block_keys) * 2
		newKeys := make([]string, len(This.Block_keys), newCap)
		newVals := make([]*T_Block, len(This.Block_vals), newCap)
		copy(newKeys, This.Block_keys)
		copy(newVals, This.Block_vals)
		This.Block_keys = newKeys
		This.Block_vals = newVals
	}

	if index, block := This.GetBlock(key); index > -1 {
		block.Merge(val)
	} else {
		This.Block_vals = append(This.Block_vals, val.Clone())
		This.Block_keys = append(This.Block_keys, key)
	}
}

func (This *T_Block) Merge(source *T_Block) *T_Block {
	if This.Prop_vals == nil || This.Prop_keys == nil {
		This.Prop_vals = make([]string, 0, source.PropLen())
		This.Prop_keys = make([]string, 0, source.PropLen())
	}
	if This.Block_vals == nil || This.Block_keys == nil {
		This.Block_vals = make([]*T_Block, 0, source.BlockLen())
		This.Block_keys = make([]string, 0, source.BlockLen())
	}

	source.PropRange(func(k, v string) {
		This.SetProp(k, v)
	})

	source.BlockRange(func(k string, v *T_Block) {
		This.SetBlock(k, v)
	})

	return This
}

func (This *T_Block) DelProp(key string) *T_Block {
	if This.Prop_vals != nil {
		if i := _slice.Index(This.Prop_keys, key); i != -1 {
			This.Prop_keys = _util.Array_RemoveAt(This.Prop_keys, i)
			This.Prop_vals = _util.Array_RemoveAt(This.Prop_vals, i)
		}
	}
	return This
}

func (This *T_Block) DelBlock(key string) *T_Block {
	if This.Block_vals != nil {
		if i := _slice.Index(This.Block_keys, key); i != -1 {
			This.Block_keys = _util.Array_RemoveAt(This.Block_keys, i)
			This.Block_vals = _util.Array_RemoveAt(This.Block_vals, i)
		}
	}
	return This
}

// Getters

func (This *T_Block) PropLen() int {
	return len(This.Prop_vals)
}

func (This *T_Block) BlockLen() int {
	return len(This.Block_vals)
}

func (This *T_Block) Len() int {
	return This.PropLen() + This.BlockLen()
}

func (This *T_Block) PropKeys() []string {
	copied := make([]string, len(This.Prop_keys))
	copy(copied, This.Prop_keys)
	return copied
}

func (This *T_Block) BlockKeys() []string {
	copied := make([]string, len(This.Block_keys))
	copy(copied, This.Block_keys)
	return copied
}

func (This *T_Block) Keys() []string {
	keys := make([]string, len(This.Block_keys)+len(This.Prop_keys))
	keys = append(keys, This.Block_keys...)
	keys = append(keys, This.Prop_keys...)
	return keys
}

// index = -1 in case not present
func (This *T_Block) GetProp(key string) (Index int, Val string) {
	if index := _slice.Index(This.Prop_keys, key); index > -1 {
		return index, This.Prop_vals[index]
	}
	return -1, ""
}

// index = -1 in case not present
func (This *T_Block) GetBlock(key string) (Index int, Val *T_Block) {
	if index := _slice.Index(This.Block_keys, key); index > -1 {
		return index, This.Block_vals[index]
	}
	return -1, nil
}
