package style

import (
	_cache_ "main/cache"
	_types_ "main/types"
	_utils_ "main/utils"
	_maps_ "maps"
)

type parse_AssignMerge_return struct {
	Result      map[string]any
	Attachments []string
	Variables   map[string]string
}

func parse_AssignMerge(classlist []string) parse_AssignMerge_return {
	attachments := []string{}
	mergables := []map[string]any{}
	variables := map[string]string{}

	for _, classname := range classlist {
		found := _cache_.Index_Find(classname, _types_.Style_ClassIndexMap{})
		if found.Group == _types_.Style_Type_Library {
			classdata := _cache_.Index_Fetch(found.Index)

			for k, v := range classdata.Metadata.Variables {
				variables[k] = v
			}

			attachments = append(attachments, classdata.Attachments...)
			retyped := make(map[string]any)
			for k, v := range classdata.StyleObject {
				retyped[k] = v
			}
			mergables = append(mergables, retyped)
		}
	}

	result := _utils_.Map_BulkMerge(mergables, true, true)

	return parse_AssignMerge_return{
		Result:      result,
		Attachments: attachments,
		Variables:   variables,
	}
}

type parse_Scanner_return parse_AssignMerge_return

func parse_CssSnippet(
	content string,
	initial string,
	srcselector string,
	merge_n_flatten bool,
	verbose bool,
) parse_Scanner_return {
	scanned := Block_Parse(content, true)
	assigned := parse_AssignMerge(scanned.Assign)

	variables := assigned.Variables
	_maps_.Copy(variables, scanned.Variables)

	attachments := assigned.Attachments
	for _, v := range scanned.Attachment {
		if v[0] == '/' {
			attachments = append(attachments, v)
		}
	}

	ast_scanned := map[string]any{}

	for k := range assigned.Variables {
		if v, ok := scanned.Properties[k]; ok {
			ast_scanned[k] = v
		}
	}
	for k, v := range scanned.AtProps {
		ast_scanned[k] = v
	}
	for k, v := range scanned.Properties {
		ast_scanned[k] = v
	}

	if verbose {
		for k, v := range ast_scanned {
			v_typed, v_ok := v.(string)
			if v_ok {
				ast_scanned[k] = v_typed + "/* " + initial + srcselector + " */"
			}
		}
	}

	ast_merged := _utils_.Map_BulkMerge([]map[string]any{assigned.Result, {"": ast_scanned}}, true, true)

	result := map[string]any{}
	if merge_n_flatten {
		for k, v := range ast_merged {
			if v_typed, v_ok := v.(map[string]any); v_ok && k == "" {
				_maps_.Copy(result, v_typed)
			} else {
				result[k] = v
			}
		}
	} else {
		result = ast_merged

	}

	if typed, ok := ast_merged[""].(map[string]any); ok {
		_maps_.Copy(result, typed)
	}

	for k, v := range scanned.AllBlocks {
		sub_result := parse_CssSnippet(v, initial, srcselector+" -> "+k, true, true)
		_maps_.Copy(variables, sub_result.Variables)
		attachments = append(attachments, sub_result.Attachments...)
		if merge_n_flatten {
			result[k] = sub_result.Result
		} else if typed, ok := result[""].(map[string]any); ok {
			_maps_.Copy(typed, sub_result.Result)
		}
	}

	return parse_Scanner_return{
		Result:      result,
		Attachments: attachments,
		Variables:   variables,
	}
}
