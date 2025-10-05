package utils

import (
	_slices_ "slices"
)

func Array_Setback[T comparable](array []T) []T {
	lastSeen := make(map[T]int)
	for i, item := range array {
		lastSeen[item] = i
	}
	out := make([]T, 0, len(array))
	for i, item := range array {
		if lastSeen[item] == i {
			out = append(out, item)
		}
	}
	return out
}

func Array_Setfront[T comparable](array []T) []T {
	firstSeen := make(map[T]int)
	for i, item := range array {
		if _, exist := firstSeen[item]; !exist {
			firstSeen[item] = i
		}
	}
	out := make([]T, 0, len(array))
	for i, item := range array {
		if firstSeen[item] == i {
			out = append(out, item)
		}
	}
	return out
}

func Array_RemoveAt[T any](s []T, index int) []T {
	if index < 0 || index >= len(s) {
		return s // or panic, depending on your use case
	}
	return append(s[:index], s[index+1:]...)
}

func Array_FromNumberMap[T any](obj map[int][]T, maxKey int) [][]T {
	result := make([][]T, maxKey+1)
	for i := 0; i <= maxKey; i++ {
		if arr, ok := obj[i]; ok {
			result[i] = arr
		} else {
			result[i] = []T{}
		}
	}
	return result
}

func Array_LongestSubChain[T comparable](parent, child []T) []T {
	if len(parent) == 0 || len(child) == 0 {
		return nil
	}
	results := [][]T{}
	remainingChild := append([]T{}, child...)
	maxScore := 0
	resultIndex := 0

	for len(remainingChild) > 0 {
		parentInLast := -1
		currentChain := []T{}
		remainingChildNext := []T{}

		startIndex := 0
		for i, v := range child {
			if v == remainingChild[0] {
				startIndex = i
				break
			}
		}
		for index := startIndex; index < len(child); index++ {
			parentInNow := -1
			for j, v := range parent {
				if v == child[index] {
					parentInNow = j
					break
				}
			}
			if parentInNow > parentInLast {
				currentChain = append(currentChain, child[index])
				parentInLast = parentInNow
			} else {
				if _slices_.Contains(remainingChild, child[index]) {
					remainingChildNext = append(remainingChildNext, child[index])
				}
			}
		}
		if len(currentChain) > maxScore {
			maxScore = len(currentChain)
			resultIndex = len(results)
			results = append(results, currentChain)
		}
		remainingChild = remainingChildNext
	}
	if resultIndex < len(results) {
		return results[resultIndex]
	}
	return nil
}

func Array_IsSubsequence(subseq, sequence []int) bool {
	if len(subseq) == 0 {
		return true
	}
	subseqIndex := 0
	for _, element := range sequence {
		if subseqIndex < len(subseq) && element == subseq[subseqIndex] {
			subseqIndex++
			if subseqIndex == len(subseq) {
				return true
			}
		}
	}
	return subseqIndex == len(subseq)
}

func Array_FindSuperParent(array []int, findFromArrays [][]int) []int {
	for _, candidate := range findFromArrays {
		if Array_IsSubsequence(array, candidate) {
			return candidate
		}
	}
	return nil
}
