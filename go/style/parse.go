package style

import (
	_cache_ "main/cache"
	_Blockmap_ "main/class/Blockmap"
	"main/shell"
	_types_ "main/types"
	_maps_ "maps"
)

type Parse_return struct {
	Result      _Blockmap_.Class
	Attachments []string
	Variables   map[string]string
}

func parse_AssignMerge(classlist []string) Parse_return {
	attachments := []string{}
	result := _Blockmap_.Class{}
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

type Parse_Scanner_return Parse_return

func Parse_CssSnippet(
	content string,
	initial string,
	srcselector string,
	merge_n_flatten bool,
	verbose bool,
) Parse_Scanner_return {

	scanned := Block_Parse(content)
	assigned := parse_AssignMerge(scanned.Assign)
	variables := assigned.Variables
	_maps_.Copy(variables, scanned.Variables)
	shell.Render.Raw("scanned")
	shell.Render.Raw(scanned)
	shell.Render.Raw("assigned")
	shell.Render.Raw(assigned)
	shell.Render.Raw("variables")
	shell.Render.Raw(variables)
	shell.Render.Raw("---")


	attachments := assigned.Attachments
	for _, v := range scanned.Attach {
		if v[0] == '/' {
			attachments = append(attachments, v)
		}
	}

	blockmap := _Blockmap_.Class{}

	for k, v := range assigned.Variables {
		blockmap.SetProp(k, v)
	}
	for _, kv := range scanned.AtProps {
		blockmap.SetProp(kv[0], kv[1])
	}
	for _, kv := range scanned.Properties {
		blockmap.SetProp(kv[0], kv[1])
	}

	if verbose {
		for k, v := range blockmap.PropRange() {
			blockmap.SetProp(k, v+"/* "+initial+srcselector+" */")
		}
	}

	ast_merged := assigned.Result.Mixin(*_Blockmap_.New().SetBlock("", blockmap))

	var result _Blockmap_.Class
	if merge_n_flatten {
		defer ast_merged.DelBlock("")
		if bm, ok := ast_merged.GetBlock(""); ok {

			for k, v := range bm.PropRange() {
				ast_merged.SetProp(k, v)
			}
			for k, v := range bm.BlockRange() {
				ast_merged.SetBlock(k, *v.Clone())
			}
		}
		result = *ast_merged
	} else {
		result = *ast_merged
	}

	var target _Blockmap_.Class
	if merge_n_flatten {
		target = result
	} else {
		if v, k := ast_merged.GetBlock(""); k {
			target = *v
		}
	}

	for _, kv := range scanned.AllBlocks {
		k := kv[0]
		v := kv[1]
		sub_result := Parse_CssSnippet(v, initial, srcselector+" -> "+k, true, true)
		_maps_.Copy(variables, sub_result.Variables)
		attachments = append(attachments, sub_result.Attachments...)
		target.Mixin(sub_result.Result)
	}

	return Parse_Scanner_return{
		Result:      result,
		Attachments: attachments,
		Variables:   variables,
	}
}
