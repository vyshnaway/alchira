package blockmap

type Class struct {
	prop_keys  []string
	prop_vals  map[string]string
	block_keys []string
	block_vals map[string]*Class
}

func New() *Class {
	return &Class{
		prop_keys:  make([]string, 0),
		prop_vals:  make(map[string]string),
		block_keys: make([]string, 0),
		block_vals: make(map[string]*Class),
	}
}
