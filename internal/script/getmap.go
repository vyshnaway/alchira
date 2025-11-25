package script

import (
	_json_ "encoding/json"
	_fmt "fmt"
	_config "main/configs"
	_action "main/internal/action"
	_model "main/models"
	_util "main/package/utils"
)

func value_EvaluateIndexTraces(
	action E_Method,
	metaFront string,
	classList []string,
	localClassMap _model.Style_ClassIndexMap,
) (ClassMap map[string]string) {
	indexArray := make([]int, 0, len(classList))
	classTrace := make([]_model.Style_ClassIndexTrace, 0, len(classList))

	for _, entry := range classList {
		found := _action.Index_Finder(entry, localClassMap)
		if found.Index > 0 {
			classTrace = append(classTrace, _model.Style_ClassIndexTrace{ClassName: entry, ClassIndex: found.Index})
			indexArray = append(indexArray, found.Index)
		}
	}

	classMap := make(map[string]string, len(classTrace))

	indexSetback := _util.Array_Setback(indexArray)
	if action == E_Method_BuildHash {
		json_Return, json_Error := _json_.Marshal(indexSetback)
		if json_Error == nil {
			dict_Return, dict_Status := _config.Style.ClassDictionary[string(json_Return)]
			if dict_Status {
				for _, trace := range classTrace {
					classMap[trace.ClassName] = dict_Return[trace.ClassIndex]
				}
			}
		}
	} else {
		temp_map := make([]_model.Style_ClassIndexTrace, 0, len(classTrace))

		if action == E_Method_DebugHash {
			for _, item := range classTrace {
				classdata := _action.Index_Fetch(item.ClassIndex)
				classname := _fmt.Sprintf("%s%s", metaFront, classdata.SrcData.DebugScatterClass)
				temp_map = append(temp_map, _model.Style_ClassIndexTrace{
					ClassName:  classname,
					ClassIndex: item.ClassIndex,
				})
				classMap[item.ClassName] = classname
			}
		}

		if len(temp_map) > 0 {
			_config.Style.Publish_Ordered = append(_config.Style.Publish_Ordered, temp_map)
		}
	}

	return classMap
}

var op_order = byte(_config.Root.CustomOp["strict"])
var op_scatter = byte(_config.Root.CustomOp["attach"])
var op_finalize = byte(_config.Root.CustomOp["assign"])
var op_lodash = byte(_config.Root.CustomOp["lodash"])