package blockmap

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
