package css

import (
	_utils_ "main/package/utils"
	"slices"
)

type T_Block struct {
	Prop_keys  []string
	prop_vals  map[string]string
	Block_keys []string
	block_vals map[string]*T_Block
}

func NewBlock() *T_Block {
	return &T_Block{
		Prop_keys:  make([]string, 0),
		prop_vals:  make(map[string]string),
		Block_keys: make([]string, 0),
		block_vals: make(map[string]*T_Block),
	}
}

// Setters for CssBlock

func (This *T_Block) GetProp(key string) (ok bool, val string) {
	if val, ok := This.prop_vals[key]; ok {
		return true, val
	}
	return false, ""
}

func (This *T_Block) GetBlock(key string) (ok bool, val *T_Block) {
	if val, ok := This.block_vals[key]; ok {
		return true, val
	}
	return false, nil
}

func (This *T_Block) PropLen() int {
	return len(This.prop_vals)
}

func (This *T_Block) BlockLen() int {
	return len(This.block_vals)
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
	keys := []string{}
	keys = append(keys, This.Block_keys...)
	keys = append(keys, This.Prop_keys...)
	return keys
}

// Setters for CssBlock

func (This *T_Block) SetProp(key string, val string) {
	if This.prop_vals == nil {
		This.prop_vals = make(map[string]string)
	}
	if _, ok := This.prop_vals[key]; !ok {
		This.Prop_keys = append(This.Prop_keys, key)
	}
	This.prop_vals[key] = val
}

func (This *T_Block) SetBlock(key string, val T_Block) *T_Block {
	if This.block_vals == nil {
		This.block_vals = make(map[string]*T_Block)
	}
	if _, ok := This.block_vals[key]; !ok {
		This.Block_keys = append(This.Block_keys, key)
	}
	This.block_vals[key] = val.Clone()

	return This.block_vals[key]
}

func (This *T_Block) DelProp(key string) *T_Block {
	if This.prop_vals != nil {
		if i := slices.Index(This.Prop_keys, key); i != -1 {
			This.Prop_keys = _utils_.Array_RemoveAt(This.Prop_keys, i)
			delete(This.prop_vals, key)
		}
	}
	return This
}

func (This *T_Block) DelBlock(key string) *T_Block {
	if This.block_vals != nil {
		if i := slices.Index(This.Block_keys, key); i != -1 {
			This.Block_keys = _utils_.Array_RemoveAt(This.Block_keys, i)
			delete(This.block_vals, key)
		}
	}
	return This
}

func (This *T_Block) Mixin(source T_Block) *T_Block {
	if This.prop_vals == nil {
		This.prop_vals = make(map[string]string)
	}
	if This.Prop_keys == nil {
		This.Prop_keys = make([]string, 0)
	}
	if This.block_vals == nil {
		This.block_vals = make(map[string]*T_Block)
	}
	if This.Block_keys == nil {
		This.Block_keys = make([]string, 0)
	}

	source.PropRange(func(k, v string) {
		This.SetProp(k, v)
	})
	This.Prop_keys = _utils_.Array_SetAppend(This.Prop_keys, source.Prop_keys...)

	source.BlockRange(func(skey string, sval T_Block) {
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
