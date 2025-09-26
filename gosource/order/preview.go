package order

import (
	_json_ "encoding/json"
	_types_ "main/types"
	_utils_ "main/utils"
	_sort_ "sort"
)

func preview_Organize(arrarr [][]int, merge bool) *_types_.Refer_SortedOutput {
	maxLen := 0

	// Group arrays by length (equivalent to lenmap_arrarr)
	lenmapArrarr := make(map[int][][]int)
	for _, arr := range arrarr {
		length := len(arr)
		lenmapArrarr[length] = append(lenmapArrarr[length], arr)
		if maxLen < length {
			maxLen = length
		}
	}

	// // Sort arrays by length (longest first) - equivalent to sorted_arrarr
	// var sortedArrarr [][]int
	// for currentLen := maxLen; currentLen > 0; currentLen-- {
	// 	if arrays, exists := lenmapArrarr[currentLen]; exists {
	// 		sortedArrarr = append(sortedArrarr, arrays...)
	// 	}
	// }

	// Sort by length using Go's sort package
	var sortedArrarr [][]int
	lengths := make([]int, 0, len(lenmapArrarr))
	for length := range lenmapArrarr {
		lengths = append(lengths, length)
	}

	// Sort lengths in descending order
	_sort_.Sort(_sort_.Reverse(_sort_.IntSlice(lengths)))

	for _, length := range lengths {
		sortedArrarr = append(sortedArrarr, lenmapArrarr[length]...)
	}

	// Rest of the logic remains the same
	shortlistedArrays := make(map[string][][]int)
	for _, arr := range sortedArrarr {
		var superParent []int
		if merge {
			superParent = _utils_.Array_FindSuperParent(arr, sortedArrarr)
		} else {
			superParent = arr
		}

		superParentJSON, _ := _json_.Marshal(superParent)
		superParentString := string(superParentJSON)

		shortlistedArrays[superParentString] = append(shortlistedArrays[superParentString], arr)
	}

	// Create reference map and recomp class list
	counted := 0
	var recompClasslist [][2]int
	referenceMap := make(map[string]map[int]int)

	for key, arrarr := range shortlistedArrays {
		var templateArray []int
		_json_.Unmarshal([]byte(key), &templateArray)

		indexMapFragment := make(map[int]int)
		for _, item := range templateArray {
			counted++
			indexMapFragment[item] = counted
			recompClasslist = append(recompClasslist, [2]int{item, counted})
		}

		for _, arr := range arrarr {
			arrJSON, _ := _json_.Marshal(arr)
			arrString := string(arrJSON)
			referenceMap[arrString] = indexMapFragment
		}
	}

	return &_types_.Refer_SortedOutput{
		Count:           counted,
		ReferenceMap:    referenceMap,
		RecompClasslist: recompClasslist,
	}
}
