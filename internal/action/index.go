package action

import (
	_config "main/configs"
	_model "main/models"
)

// Simulated utils and enums

// Index_Declare: Assigns and registers a new index
func Index_Declare(object *_model.Cache_SymlinkData) int {
	var idx int
	for i := range _config.Style.Index_Bin {
		idx = i
		break
	}
	if idx == 0 {
		_config.Style.Index_Now++
		idx = _config.Style.Index_Now
	}
	object.SrcData.Index = idx
	delete(_config.Style.Index_Bin, idx)
	_config.Style.Index_to_Styledata[idx] = object
	return idx
}

// DISPOSE: Free indexes and remove associated data.
func Index_Dispose(indexes ...int) {
	for _, idx := range indexes {
		if idx > 0 {
			_config.Style.Index_Bin[idx] = true
			delete(_config.Style.Index_to_Styledata, idx)
		}
	}
}

type index_Find_retrun struct {
	Index int
	Group _model.Style_Type
	Data  *_model.Cache_SymlinkData
}

func Index_Fetch(index int) *_model.Cache_SymlinkData {
	data, ok := _config.Style.Index_to_Styledata[index]
	if ok {
		return data
	}
	return nil
}

func Index_Finder(classname string, localMap _model.Style_ClassIndexMap) index_Find_retrun {
	index := 0
	group := _model.Style_Type_Null
	if idx, found := localMap[classname]; found {
		index = idx
		group = _model.Style_Type_Local
	} else if idx, found := _config.Style.Global___Index[classname]; found {
		index = idx
		group = _model.Style_Type_Global
	} else if idx, found := _config.Style.Public___Index[classname]; found {
		index = idx
		group = _model.Style_Type_Public
	} else if idx, found := _config.Style.Library__Index[classname]; found {
		index = idx
		group = _model.Style_Type_Library
	} else if idx, found := _config.Style.Artifact_Index[classname]; found {
		index = idx
		group = _model.Style_Type_Artifact
	}
	data := _config.Style.Index_to_Styledata[index]

	return index_Find_retrun{
		Index: index,
		Group: group,
		Data:  data,
	}
}
