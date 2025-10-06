package blockmap

func (This *Type) GetProp(key string) (ok bool, val string) {
	if val, ok := This.prop_vals[key]; ok {
		return true, val
	}
	return false, ""
}

func (This *Type) GetBlock(key string) (ok bool, val *Type) {
	if val, ok := This.block_vals[key]; ok {
		return true, val
	}
	return false, nil
}

func (This *Type) PropLen() int {
	return len(This.prop_vals)
}

func (This *Type) BlockLen() int {
	return len(This.block_vals)
}

func (This *Type) Len() int {
	return This.PropLen() + This.BlockLen()
}

func (This *Type) PropKeys() []string {
	copied := make([]string, len(This.Prop_keys))
	copy(copied, This.Prop_keys)
	return copied
}

func (This *Type) BlockKeys() []string {
	copied := make([]string, len(This.Block_keys))
	copy(copied, This.Block_keys)
	return copied
}

func (This *Type) Keys() []string {
	keys := []string{}
	keys = append(keys, This.Block_keys...)
	keys = append(keys, This.Prop_keys...)
	return keys
}

func (This *Type) PropRange(fn func(k string, v string)) {
	for _, key := range This.Prop_keys {
		if ok, val := This.GetProp(key); ok {
			fn(key, val)
		}
	}
}

func (This *Type) BlockRange(fn func(k string, v Type)) {
	for _, key := range This.Block_keys {
		if ok, val := This.GetBlock(key); ok {
			fn(key, *val)
		}
	}
}
