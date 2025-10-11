package style

import (
	_config "main/configs"
	_action "main/internal/action"
	_css "main/package/css"
	O "main/package/object"
	_util "main/package/utils"
	_string "strings"

	_model "main/models"
)

type Parse_return struct {
	Result      *_css.T_Block
	Attachments []string
	Variables   *O.T[string, string]
}

func parse_AssignMerge(classlist []string) Parse_return {
	attachments := []string{}
	result := _css.NewBlock()
	variables := O.New[string, string]()

	for _, classname := range classlist {
		found := _action.Index_Find(classname, _model.Style_ClassIndexMap{})
		if found.Group == _model.Style_Type_Library {
			classdata := _action.Index_Fetch(found.Index)
			classdata.StyleObject.PropRange(func(k, v string) {
				if _string.HasPrefix(k, "--") {
					variables.Set(k, v)
				}
			})
			attachments = append(attachments, classdata.Attachments...)
			result.Merge(classdata.StyleObject)
		}
	}

	return Parse_return{
		Result:      result,
		Attachments: attachments,
		Variables:   variables,
	}
}

type R_Parse_Filter struct {
	Assign     []string
	Attach     []string
	Properties *O.T[string, string]
	Blocks     *O.T[string, string]
	Variables  *O.T[string, string]
}

var assign_directive = _config.Root.CustomAtrules["assign"]
var attach_directive = _config.Root.CustomAtrules["attach"]
var assign_operator = string(_config.Root.CustomOperations["assign"])
var attach_operator = string(_config.Root.CustomOperations["attach"])

func Parse_Filter(content string) R_Parse_Filter {
	ref := _css.ParsePartial(content)
	res := R_Parse_Filter{
		Assign:     []string{},
		Attach:     []string{},
		Blocks:     O.New[string, string](),
		Variables:  O.FromArray(ref.Variables),
		Properties: O.New[string, string](),
	}

	for _, val := range ref.Directives {
		spaceIndex := _string.Index(val, " ")
		if spaceIndex < 0 {
			spaceIndex = len(val)
		}
		directive := val[0:spaceIndex]

		switch directive {
		case attach_directive:
			breaks := _util.String_ZeroBreaks(val[spaceIndex:], []rune{' ', '\n', ','})
			res.Attach = append(res.Attach, breaks...)
		case assign_directive:
			breaks := _util.String_ZeroBreaks(val[spaceIndex:], []rune{' ', '\n', ','})
			res.Assign = append(res.Assign, breaks...)
		default:
		}
	}

	for _, val := range ref.Operations {
		breaks := _util.String_ZeroBreaks(val, []rune{' ', '\n', ','})
		if len(breaks) > 0 {
			if breaks[0] == attach_operator {
				res.Attach = append(res.Attach, breaks[1:]...)
			} else if (breaks[0]) == assign_operator {
				res.Assign = append(res.Assign, breaks[1:]...)
			}
		}
	}

	for _, kv := range ref.Properties {
		key, val := kv[0], kv[1]
		res.Properties.Set(key, val)
	}

	for _, kv := range ref.All_Blocks {
		key, val := kv[0], kv[1]
		res.Blocks.Set(key, val)
	}

	for _, kv := range ref.Variables {
		key, val := kv[0], kv[1]
		res.Variables.Set(key, val)
	}

	return res
}

func Parse_CssSnippet(
	content string,
	initial string,
	srcselector string,
	flatten bool,
	debug bool,
) Parse_return {

	scanned := Parse_Filter(content)
	assigned := parse_AssignMerge(scanned.Assign)
	variables := assigned.Variables
	variables.Copy(scanned.Variables)

	attachments := append(assigned.Attachments, scanned.Attach...)

	propmap := _css.NewBlock()
	assigned.Variables.Range(func(k, v string) {
		propmap.SetProp(k, v)
		variables.Set(k, v)
	})
	if debug {
		scanned.Properties.Range(func(k, v string) {
			propmap.SetProp(k, v+"/* "+initial+srcselector+" */")
		})
	} else {
		scanned.Properties.Range(func(k, v string) {
			propmap.SetProp(k, v)
		})
	}

	temp := _css.NewBlock()
	temp.SetBlock("[]", propmap)
	assigned.Result.Merge(temp)
	output := assigned.Result
	_, target := output.GetBlock("[]")

	if flatten {
		if ok, bm := output.GetBlock("[]"); ok {
			bm.PropRange(func(k, v string) {
				output.SetProp(k, v)
			})
			bm.BlockRange(func(k string, v *_css.T_Block) {
				output.SetBlock(k, v.Clone())
			})
		}
		output.DelBlock("[]")
		target = output
	}

	scanned.Blocks.Range(func(key, val string) {
		sub_result := Parse_CssSnippet(val, initial, srcselector+" / "+key, true, debug)
		variables.Copy(sub_result.Variables)
		attachments = append(attachments, sub_result.Attachments...)
		target.SetBlock(key, sub_result.Result)
	})

	return Parse_return{
		Result:      output,
		Attachments: attachments,
		Variables:   variables,
	}
}
