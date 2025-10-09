package style

import (
	_action "main/internal/action"
	_css "main/package/css"

	_model "main/models"
	_map "maps"
)

type Parse_return struct {
	Result      *_css.T_Block
	Attachments []string
	Variables   map[string]string
}

func parse_AssignMerge(classlist []string) Parse_return {
	attachments := []string{}
	result := _css.NewBlock()
	variables := map[string]string{}

	for _, classname := range classlist {
		found := _action.Index_Find(classname, _model.Style_ClassIndexMap{})
		if found.Group == _model.Style_Type_Library {
			classdata := _action.Index_Fetch(found.Index)
			_map.Copy(variables, classdata.Metadata.Variables)
			attachments = append(attachments, classdata.Attachments...)
			result.Mixin(classdata.StyleObject)
		}
	}

	return Parse_return{
		Result:      result,
		Attachments: attachments,
		Variables:   variables,
	}
}

type R_Parse_Filter struct {
	Assign    []string
	Attach    []string
	Liners    map[string]string
	Blocks    map[string]string
	Variables map[string]string
}

func parse_Filter(content string) R_Parse_Filter {
	assign := []string{}
	attach := []string{}
	directives := []string{}
	properties := []string{}
	_css.ParsePartial(content)
	// for _, kv := refer

	// 	spaceIndex := _strings_.Index(val, " ")
	// 	if spaceIndex < 0 {
	// 		spaceIndex = len(val)
	// 	}
	// 	directive := val[0:spaceIndex]

	// 	switch directive {
	// 	case _cache_.Root.CustomAtrules["attach"]:
	// 		breaks := _utils_.String_ZeroBreaks(val[spaceIndex:], []rune{' ', '\n', ','})
	// 		result.Attach = append(result.Attach, breaks...)
	// 	case _cache_.Root.CustomAtrules["assign"]:
	// 		breaks := _utils_.String_ZeroBreaks(val[spaceIndex:], []rune{' ', '\n', ','})
	// 		result.Assign = append(result.Assign, breaks...)
	// 	default:
	// 	}
	// } else {
	// 	breaks := _utils_.String_ZeroBreaks(val, []rune{' ', '\n', ','})
	// 	if len(breaks) > 0 {
	// 		if breaks[0] == string(_cache_.Root.CustomOperations["attach"]) {
	// 			result.Attach = append(result.Attach, breaks[1:]...)
	// 		} else if (breaks[0]) == string(_cache_.Root.CustomOperations["assign"]) {
	// 			result.Assign = append(result.Assign, breaks[1:]...)
	// 		}
	// 	}
}

func Parse_CssSnippet(
	content string,
	initial string,
	srcselector string,
	flatten bool,
	verbose bool,
) Parse_return {

	scanned := parse_Filter(content)
	assigned := parse_AssignMerge(scanned.Assign)
	variables := assigned.Variables
	_map.Copy(variables, scanned.Variables)

	attachments := assigned.Attachments
	for _, v := range scanned.Attach {
		if v[0] != '/' {
			attachments = append(attachments, v)
		}
	}

	propmap := _css.NewBlock()
	for k, v := range assigned.Variables {
		propmap.SetProp(k, v)
	}

	if verbose {
		for k, v := range scanned.Liners {
			propmap.SetProp(k, v+"/* "+initial+srcselector+" */")
		}
	} else {
		for k, v := range scanned.Liners {
			propmap.SetProp(k, v)
		}
	}

	blockmap := *assigned.Result.Mixin(_css.NewBlock().SetBlock("", propmap))
	if flatten {
		if ok, bm := blockmap.GetBlock(""); ok {
			bm.PropRange(func(k, v string) {
				blockmap.SetProp(k, v)
			})
			bm.BlockRange(func(k string, v *_css.T_Block) {
				blockmap.SetBlock(k, v.Clone())
			})
		}
		blockmap.DelBlock("")
	}

	for key, val := range scanned.Blocks {
		sub_result := Parse_CssSnippet(val, initial, srcselector+" -> "+key, true, verbose)
		_map.Copy(variables, sub_result.Variables)
		attachments = append(attachments, sub_result.Attachments...)
		if flatten {
			blockmap.SetBlock(key, sub_result.Result)
		} else if ok, bm := blockmap.GetBlock(""); ok {
			bm.SetBlock(key, sub_result.Result)
		}
	}

	return Parse_return{
		Result:      &blockmap,
		Attachments: attachments,
		Variables:   variables,
	}
}
