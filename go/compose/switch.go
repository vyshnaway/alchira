package compose

import (
	_json_ "encoding/json"
	_slices_ "slices"
	_strings_ "strings"
)


func wrapper(parentObject map[string]any, keys []string, childObject any) {
	if len(keys) == 0 {
		return
	}

	activeKey := keys[0]
	keys = keys[1:]

	if len(keys) > 0 {
		sub, ok := parentObject[activeKey]
		if !ok {
			sub = make(map[string]any)
			parentObject[activeKey] = sub
		}

		if m, ok := sub.(map[string]any); ok {
			wrapper(m, keys, childObject)
		}
	} else {
		parentObject[activeKey] = childObject
	}
}


func switch_ObjectReorder(object map[string]map[string]any) map[string]any {
	output := map[string]any{"": map[string]any{}}

	for outerKey, outerObject := range object {
		for innerKey, innerObject := range outerObject {
			if innerKey == "" {
				output[""].(map[string]any)[outerKey] = innerObject
			} else {
				var wrappers []string
				if err := _json_.Unmarshal([]byte(innerKey), &wrappers); err == nil {
					keyseq := []string{}
					for index, wrapper := range wrappers {
						if index == 0 || wrappers[index-1][0] == '@' || wrapper[0] == '@' {
							keyseq = append(keyseq, wrapper)
						} else {
							keyseq = append(keyseq, "& "+wrapper)
						}
					}
					wrapper(output, keyseq, innerObject)
				}
			}
		}
	}

	return output
}

func ComposeSwitched(classObjectMap map[string]map[string]any, minify bool) string {
	
	prepared := [][2]any{}
	inits := []string{}
	mins := []string{}
	maxs := []string{}
	flats := []string{}

	switched := switch_ObjectReorder(classObjectMap)
	for key := range switched {
		min := _strings_.Index(key, "min")
		max := _strings_.Index(key, "max")
		if key != "" {
			if min == -1 && max == -1 {
				inits = append(inits, key)
			} else if min < max {
				mins = append(mins, key)
			} else if min > max {
				maxs = append(maxs, key)
			} else if min == max {
				flats = append(flats, key)
			}
		}
	}

	for _, key := range inits {
		prepared = append(prepared, [2]any{key, switched[key]})
	}

	defaults_typed, defaults_ok := switched[""].(map[string]any)
	if defaults_ok {
		for key := range defaults_typed {
			prepared = append(prepared, [2]any{key, switched[key]})
		}
	}

	for _, key := range inits {
		prepared = append(prepared, [2]any{key, switched[key]})
	}

	_slices_.Sort(flats)
	_slices_.Sort(maxs)
	_slices_.Sort(mins)
	_slices_.Reverse(mins)
	
	allkeys := flats
	allkeys = append(allkeys, mins...)
	allkeys = append(allkeys, maxs...)

	for _, key := range allkeys {
		prepared = append(prepared, [2]any{key, switched[key]})
	}

	return Render(prepared, minify)
}


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
