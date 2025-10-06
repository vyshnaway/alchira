package compose

import (
	_json_ "encoding/json"
	blockmap "main/class/Blockmap"
)

func wrapper(pm *blockmap.Type, keys []string, cm *blockmap.Type) {
	if len(keys) == 0 {
		return
	}

	key := keys[0]
	keys = keys[1:]

	if len(keys) > 0 {
		ok, m := pm.GetBlock(key)
		if !ok {
			m = blockmap.New()
			pm.SetBlock(key, *m)
		}

		if ok, n := m.GetBlock(key); ok {
			wrapper(n, keys, cm)
		}
	} else {
		pm.SetBlock(key, *cm)
	}
}

func switch_Blockmap(This *blockmap.Type) *blockmap.Type {
	out := blockmap.New()
	inq := out.SetBlock("", *blockmap.New())

	This.PropRange(func(k, v string) {
		out.SetProp(k, v)
	})

	out.BlockRange(func(k0 string, v0 blockmap.Type) {
		v0.BlockRange(func(k1 string, v1 blockmap.Type) {
			if k1 == "" {
				inq.SetBlock(k0, v0)
			} else {
				var wrappers []string
				if err := _json_.Unmarshal([]byte(k1), &wrappers); err == nil {
					keyseq := []string{}
					for index, wrapper := range wrappers {
						if index == 0 || wrappers[index-1][0] == '@' || wrapper[0] == '@' {
							keyseq = append(keyseq, wrapper)
						} else {
							keyseq = append(keyseq, "& "+wrapper)
						}
					}
					wrapper(out, keyseq, &v1)
				}
			}
		})
	})

	return out
}

// func Switched(stylemap blockmap.Type, minify bool) string {
// 	switched := switch_Blockmap(&stylemap)

// 	return Render(prepared, minify)
// }

// func ComposeSwitched(selectorIndex [][2]any, minify bool) string {
// 	objectMap := map[string]map[string]any{}
// 	// classOrder := []string{}

// 	for _, si := range selectorIndex {
// 		selector_typed, selector_ok := si[0].(string)
// 		index_typed, index_ok := si[1].(int)
// 		if selector_ok && index_ok {
// 			objectMap[selector_typed] = _cache_.Index_Fetch(index_typed).StyleObject
// 			// classOrder = append(classOrder, selector_typed)
// 		}
// 	}

// 	preped := styleSwitch(objectMap)
// 	return Render(preped, minify)
// }
