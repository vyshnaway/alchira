package blockmap

func (This *Class) GetProp(key string) (ok bool, val string) {
	if val, ok := This.prop_vals[key]; ok {
		return true, val
	}
	return false, ""
}

func (This *Class) GetBlock(key string) (ok bool, val *Class) {
	if val, ok := This.block_vals[key]; ok {
		return true, val
	}
	return false, nil
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

func (This *Class) PropKeys() []string {
	copied := make([]string, len(This.prop_keys))
	copy(copied, This.prop_keys)
	return copied
}

func (This *Class) BlockKeys() []string {
	copied := make([]string, len(This.block_keys))
	copy(copied, This.prop_keys)
	return copied
}

func (This *Class) Keys() []string {
	keys := []string{}
	keys = append(keys, This.block_keys...)
	keys = append(keys, This.prop_keys...)
	return keys
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
