package blockmap

type Type struct {
	Prop_keys  []string
	prop_vals  map[string]string
	Block_keys []string
	block_vals map[string]*Type
}

func New() *Type {
	return &Type{
		Prop_keys:  make([]string, 0),
		prop_vals:  make(map[string]string),
		Block_keys: make([]string, 0),
		block_vals: make(map[string]*Type),
	}
}
