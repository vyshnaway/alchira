package style

import (
	_cache_ "main/cache"
	_Blockmap_ "main/class/Blockmap"

	// "main/shell/core"
	_types_ "main/types"
	_maps_ "maps"
)

type Parse_return struct {
	Result      _Blockmap_.Type
	Attachments []string
	Variables   map[string]string
}

func parse_AssignMerge(classlist []string) Parse_return {
	attachments := []string{}
	result := _Blockmap_.Type{}
	variables := map[string]string{}

	for _, classname := range classlist {
		found := _cache_.Index_Find(classname, _types_.Style_ClassIndexMap{})
		if found.Group == _types_.Style_Type_Library {
			classdata := _cache_.Index_Fetch(found.Index)
			_maps_.Copy(variables, classdata.Metadata.Variables)
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

func Parse_CssSnippet(
	content string,
	initial string,
	srcselector string,
	flatten bool,
	verbose bool,
) Parse_return {

	scanned := Block_Parse(content)
	assigned := parse_AssignMerge(scanned.Assign)
	variables := assigned.Variables
	_maps_.Copy(variables, scanned.Variables)

	attachments := assigned.Attachments
	for _, v := range scanned.Attach {
		if v[0] != '/' {
			attachments = append(attachments, v)
		}
	}

	propmap := _Blockmap_.Type{}
	for k, v := range assigned.Variables {
		propmap.SetProp(k, v)
	}

	savprop := func(proplist [][2]string) {
		if verbose {
			for _, kv := range proplist {
				propmap.SetProp(kv[0], kv[1]+"/* "+initial+srcselector+" */")
			}
		} else {
			for _, kv := range proplist {
				propmap.SetProp(kv[0], kv[1])
			}
		}
	}
	savprop(scanned.AtProps)
	savprop(scanned.Properties)

	blockmap := *assigned.Result.Mixin(*_Blockmap_.New().SetBlock("", propmap))
	if flatten {
		if ok, bm := blockmap.GetBlock(""); ok {
			bm.PropRange(func(k, v string) {
				blockmap.SetProp(k, v)
			})
			bm.BlockRange(func(k string, v _Blockmap_.Type) {
				blockmap.SetBlock(k, *v.Clone())
			})
		}
		blockmap.DelBlock("")
	}

	for _, kv := range scanned.AllBlocks {
		key := kv[0]
		val := kv[1]
		sub_result := Parse_CssSnippet(val, initial, srcselector+" -> "+key, true, verbose)
		_maps_.Copy(variables, sub_result.Variables)
		attachments = append(attachments, sub_result.Attachments...)
		if flatten {
			blockmap.SetBlock(key, sub_result.Result)
		} else if ok, bm := blockmap.GetBlock(""); ok {
			bm.SetBlock(key, sub_result.Result)
		}
	}

	return Parse_return{
		Result:      blockmap,
		Attachments: attachments,
		Variables:   variables,
	}
}
