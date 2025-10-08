package order

import (
	_json_ "encoding/json"
	_types_ "main/types"
	_utils_ "main/utils"
)

func Preview_Organize(classtrace [][]int, merge bool) *_types_.Refer_SortedOutput {
	maxLen := 0
	counter := 0
	refindex := 0
	finalists := [][]int{}
	final_hashtrace := [][2]int{}
	sorted_classtrace := [][]int{}
	list_to_group := make(map[string]int)
	group_to_table := make(map[int]map[int]int)
	grouped_classtrace := make(map[string][][]int)

	lengrouped_classtrace := make(map[int][][]int)
	for _, arr := range classtrace {
		length := len(arr)
		lengrouped_classtrace[length] = append(lengrouped_classtrace[length], arr)
		if maxLen < length {
			maxLen = length
		}
	}

	for currentLen := maxLen; currentLen > 0; currentLen-- {
		if arrays, exists := lengrouped_classtrace[currentLen]; exists {
			sorted_classtrace = append(sorted_classtrace, arrays...)
		}
	}

	for _, arr := range sorted_classtrace {
		var superParent []int
		if merge {
			superParent = _utils_.Array_FindSuperParent(arr, sorted_classtrace)
		} else {
			superParent = arr
		}
		superParentJSON, _ := _json_.Marshal(superParent)
		superParentString := string(superParentJSON)
		grouped_classtrace[superParentString] = append(grouped_classtrace[superParentString], arr)
	}

	for jsonref, classlists := range grouped_classtrace {

		reftable := make(map[int]int)
		if seq, err := _utils_.Code_JsonParse[[]int](jsonref); err == nil {
			finalists = append(finalists, seq)
			for _, item := range seq {
				counter++
				reftable[item] = counter
				final_hashtrace = append(final_hashtrace, [2]int{item, counter})
			}
		}

		for _, arr := range classlists {
			arrJSON, _ := _json_.Marshal(arr)
			arrString := string(arrJSON)
			list_to_group[arrString] = refindex
		}

		group_to_table[refindex] = reftable
		refindex++
	}

	return &_types_.Refer_SortedOutput{
		Count:           counter,
		ClassLists:      finalists,
		List_to_GroupId: list_to_group,
		Group_to_Table:  group_to_table,
		Final_Hashtrace: final_hashtrace,
	}
}
