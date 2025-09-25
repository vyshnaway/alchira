package cache

import (
	_types_ "main/types"
	_strconv_ "strconv"
	_sync_ "sync"
)

// Simulated utils and enums
var NOW = 0
var BIN = make(map[int]struct{})
var mu _sync_.Mutex

// Index_Fetch: Retrieve data by index.
func Index_Fetch(index int) _types_.Style_ClassData {
	mu.Lock()
	defer mu.Unlock()
	return Style.Index_to_Data[index]
}

// Index_Declare: Assigns and registers a new index
func Index_Declare(object _types_.Style_ClassData) int {
	mu.Lock()
	defer mu.Unlock()
	var idx int
	for i := range BIN {
		idx = i
		break
	}
	if idx == 0 {
		NOW++
		idx = NOW
	}
	object.Index = idx
	delete(BIN, idx)
	object.Metadata.WatchClass = "__" + _strconv_.Itoa(idx)
	Style.Index_to_Data[idx] = object
	return idx
}

// DISPOSE: Free indexes and remove associated data.
func Index_Dispose(indexes ...int) {
	mu.Lock()
	defer mu.Unlock()
	for _, idx := range indexes {
		if idx > 0 {
			BIN[idx] = struct{}{}
			delete(Style.Index_to_Data, idx)
		}
	}
}

// RESET: Remove all indexes above 'after'
func Index_Reset(after int) int {
	mu.Lock()
	defer mu.Unlock()
	if after < 0 {
		after = 0
	}
	removed := 0
	for idx := range Style.Index_to_Data {
		if idx > after {
			delete(BIN, idx)
			delete(Style.Index_to_Data, idx)
			removed++
		}
	}
	NOW = after
	return removed
}

type index_Find_retrun struct {
	Index int
	Group _types_.Style_Type
}

func Index_Find(classname string, localMap _types_.Style_ClassIndexMap) index_Find_retrun {
	mu.Lock()
	defer mu.Unlock()
	index := 0
	group := _types_.Style_Type_Null
	if idx, found := localMap[classname]; found {
		index = idx
		group = _types_.Style_Type_Local
	} else if idx, found := Style.Global___Index[classname]; found {
		index = idx
		group = _types_.Style_Type_Global
	} else if idx, found := Style.Public___Index[classname]; found {
		index = idx
		group = _types_.Style_Type_Public
	} else if idx, found := Style.Library__Index[classname]; found {
		index = idx
		group = _types_.Style_Type_Library
	} else if idx, found := Style.Artifact_Index[classname]; found {
		index = idx
		group = _types_.Style_Type_Artifact
	}
	return index_Find_retrun{
		Index: index,
		Group: group,
	}
}
