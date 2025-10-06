package compose

import (
	_blockmap_ "main/class/Blockmap"
	"main/shell"
	"strings"
	// _strings_ "strings"
)

func Render_Prefixer(stylemap _blockmap_.Type, vendors []string) [][2]any {
	var result [][2]any

	for key, val := range stylemap.PropRange() {
		if key[0] == '@' {
			for _, r := range prefix_ForAtRule(key, vendors) {
				result = append(result, [2]any{r + ";", ""})
			}
		} else {
			for _, kv := range prefix_LoadProps(key, val, vendors) {
				k, v := kv[0], kv[1]
				if hasProp, _ := stylemap.GetProp(k); hasProp || k == key {
					result = append(result, [2]any{k + ":" + v + ";", ""})
				}
			}
		}
	}
	for key, val := range stylemap.BlockRange() {
		if val.Len() > 0 {
			result = append(result, [2]any{key, val})
		}
	}
	return result
}

// Pending to handle states &:* states.

func render_UnNester(selector string, value, result *_blockmap_.Type) (Result *_blockmap_.Type) {

	compounds := _blockmap_.New()
	// vendor_class := _blockmap_.New()
	// vendor_element := _blockmap_.New()
	// pseudo_class := _blockmap_.New()
	// pseudo_element := _blockmap_.New()
	// children := _blockmap_.New()
	nest_block := _blockmap_.New()
	compounds_list := []_blockmap_.Tracks{}
	vendor_class_list := []_blockmap_.Tracks{}
	vendor_element_list := []_blockmap_.Tracks{}
	pseudo_class_list := []_blockmap_.Tracks{}
	pseudo_element_list := []_blockmap_.Tracks{}
	children_list := []_blockmap_.Tracks{}
	nest_block_list := []_blockmap_.Tracks{}

	for key, val := range value.PropRange() {
		nest_block.SetProp(key, val)
	}

	for key, val := range value.BlockRange() {
		if strings.HasPrefix(key, "&") {
			nexelector := selector + key[1:]

			if strings.HasPrefix(key, "&::-") {
				vendor_element_list = append(vendor_element_list, _blockmap_.Tracks{
					Selector: nexelector,
					Blockmap: val,
				})
			} else if strings.HasPrefix(key, "&::") {
				pseudo_element_list = append(pseudo_element_list, _blockmap_.Tracks{
					Selector: nexelector,
					Blockmap: val,
				})
			} else if strings.HasPrefix(key, "&:-") {
				vendor_class_list = append(vendor_class_list, _blockmap_.Tracks{
					Selector: nexelector,
					Blockmap: val,
				})
			} else if strings.HasPrefix(key, "&:") {
				pseudo_class_list = append(pseudo_class_list, _blockmap_.Tracks{
					Selector: nexelector,
					Blockmap: val,
				})
			} else if strings.HasPrefix(key, "& ") {
				children_list = append(children_list, _blockmap_.Tracks{
					Selector: nexelector,
					Blockmap: val,
				})
			} else if strings.HasPrefix(key, "&") {
				compounds_list = append(compounds_list, _blockmap_.Tracks{
					Selector: nexelector,
					Blockmap: val,
				})
			}
		} else {
			nest_block_list = append(nest_block_list, _blockmap_.Tracks{
				Selector: key,
				Blockmap: val,
			})
		}
	}

	shell.Render.Raw(compounds_list)
	// shell.Render.Raw(vendor_class_list)
	// shell.Render.Raw(vendor_element_list)
	// shell.Render.Raw(pseudo_class_list)
	// shell.Render.Raw(pseudo_element_list)
	// shell.Render.Raw(children_list)
	// shell.Render.Raw(nest_block_list)

	// shell.Render.Raw("---")
	deeper_list := func(tracks []_blockmap_.Tracks, group *_blockmap_.Type) {
		for _, v := range tracks {
			render_UnNester(v.Selector, v.Blockmap, group).Print()
		}
		result.Mixin(*group).Print()
	}

	deeper_list(compounds_list, compounds)
	// deeper_list(pseudo_class_list, pseudo_class)
	// deeper_list(vendor_class_list, vendor_class)

	for _, v := range nest_block_list {
		result.SetBlock(v.Selector, *v.Blockmap)
	}

	// deeper_list(pseudo_element_list, pseudo_element)
	// deeper_list(vendor_element_list, vendor_element)
	// deeper_list(children_list, children)

	return result
}

func Render_UnNester(selector string, value *_blockmap_.Type) (Result *_blockmap_.Type) {
	result := _blockmap_.New()
	return render_UnNester(selector, value, result)
}

// func render_LoadVendors(collection map[string]string, vendor string) []string {
// 	result := []string{}
// 	if vendor == "" {
// 		for _, ven := range vendor_Providers {
// 			if _, stat := collection[ven]; stat {
// 				result = append(result, ven)
// 			}
// 		}
// 	} else {
// 		result = append(result, vendor)
// 	}
// 	return result
// }

// func render_ObjectCompose(object map[string]any, minify bool, vendors []string, first bool) []string {
// 	stylesheet := []string{}
// 	tab := "  "
// 	space := " "
// 	if minify {
// 		tab = ""
// 		space = ""
// 	}

// 	for _, kv := range render_PartialsArrayPrefixer(object, vendors) {
// 		key_typed, key_ok := kv[0].(string)
// 		val := kv[1]
// 		if key_ok {
// 			switch val_typed := val.(type) {
// 			case map[string]any:
// 				if len(val_typed) > 0 {
// 					if !minify && first {
// 						stylesheet = append(stylesheet, "")
// 					}
// 					if key_typed[0] == '@' {
// 						for vendor, selector := range prefix_ForAtRule(key_typed, vendors) {
// 							composed := render_ObjectCompose(val_typed, minify, []string{vendor}, false)
// 							if len(composed) > 0 {
// 								stylesheet = append(stylesheet, selector)
// 								stylesheet = append(stylesheet, "{")
// 								for _, i := range composed {
// 									stylesheet = append(stylesheet, tab+i)
// 								}
// 								stylesheet = append(stylesheet, "}")

// 							}

// 						}
// 					} else {
// 						composed := render_ObjectCompose(val_typed, minify, vendors, false)
// 						if !minify {
// 							for index, line := range composed {
// 								composed[index] = tab + line
// 							}
// 						}
// 						if len(composed) > 0 {
// 							stylesheet = append(stylesheet, prefix_ForPseudos(key_typed, vendors)...)
// 							stylesheet = append(stylesheet, "{")
// 							stylesheet = append(stylesheet, composed...)
// 							stylesheet = append(stylesheet, "}")
// 						}
// 					}
// 				}
// 			case string:
// 				if key_typed[0] == '@' {
// 					stylesheet = append(stylesheet, key_typed)
// 				} else {
// 					stylesheet = append(stylesheet, key_typed+space+val_typed)
// 				}
// 			}
// 		}
// 	}

// 	return stylesheet
// }

// func Render(array [][2]any, minify bool) string {
// 	stylesheet := []string{}
// 	var breaks string

// 	if minify {
// 		breaks = ""
// 	} else {
// 		breaks = "\n"
// 	}

// 	for _, kv := range array {
// 		if key, ok := kv[0].(string); ok {
// 			val := kv[1]
// 			flattened := map[string]any{}

// 			switch val_typed := val.(type) {
// 			case map[string]any:
// 				flattened = Render_UnNester(key, val_typed, map[string]any{})
// 			case string:
// 				flattened = map[string]any{key: val_typed}
// 			}

// 			composed := render_ObjectCompose(flattened, minify, vendor_Providers, true)
// 			stylesheet = append(stylesheet, composed...)
// 		}
// 	}

// 	return _strings_.Join(stylesheet, breaks)
// }
