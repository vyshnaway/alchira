package order

import (
	_json "encoding/json"
	_utils "main/package/utils"
)

type R_Preview struct {
	Count           int                 `json:"count"`
	ClassLists      [][]int             `json:"classlist"`
	List_to_GroupId map[string]int      `json:"listToGroup"`
	Group_to_Table  map[int]map[int]int `json:"groupToMap"`
	Final_Hashtrace [][][2]int          `json:"recompClasslist"`
}

func Preview(classtrace [][]int, merge bool) *R_Preview {
	maxLen := 0
	counter := 0
	refindex := 0

	lengrouped_classtrace := make(map[int][][]int)
	for _, arr := range classtrace {
		length := len(arr)
		lengrouped_classtrace[length] = append(lengrouped_classtrace[length], arr)
		if maxLen < length {
			maxLen = length
		}
	}

	sorted_classtrace := make([][]int, 0, len(classtrace))
	for currentLen := maxLen; currentLen > 0; currentLen-- {
		if arrays, exists := lengrouped_classtrace[currentLen]; exists {
			sorted_classtrace = append(sorted_classtrace, arrays...)
		}
	}

	grouped_classtrace := make(map[string][][]int)
	for _, arr := range sorted_classtrace {
		var superParent []int
		if merge {
			superParent = Array_FindSuperParent(arr, sorted_classtrace)
		} else {
			superParent = arr
		}
		superParentJSON, _ := _json.Marshal(superParent)
		superParentString := string(superParentJSON)
		if grouped_classtrace[superParentString] == nil {
			grouped_classtrace[superParentString] = [][]int{arr}
		} else {
			grouped_classtrace[superParentString] = append(grouped_classtrace[superParentString], arr)
		}
	}

	list_to_group := make(map[string]int)
	group_to_table := make(map[int]map[int]int)
	finalists := make([][]int, 0, len(grouped_classtrace))
	final_hashtrace := make([][][2]int, 0, len(grouped_classtrace))
	for jsonref, classlists := range grouped_classtrace {
		temptrace := [][2]int{}
		reftable := make(map[int]int)

		if seq, err := _utils.Code_JsoncParse[[]int](jsonref); err == nil {
			finalists = append(finalists, seq)
			for _, item := range seq {
				counter++
				reftable[item] = counter
				temptrace = append(temptrace, [2]int{item, counter})
			}
		}
		for _, arr := range classlists {
			arrJSON, _ := _json.Marshal(arr)
			arrString := string(arrJSON)
			list_to_group[arrString] = refindex
		}

		final_hashtrace = append(final_hashtrace, temptrace)
		group_to_table[refindex] = reftable
		refindex++
	}

	return &R_Preview{
		Count:           counter,
		ClassLists:      finalists,
		List_to_GroupId: list_to_group,
		Group_to_Table:  group_to_table,
		Final_Hashtrace: final_hashtrace,
	}
}
