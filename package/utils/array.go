package utils

import (
	_slices "slices"
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

func Array_AppendUnique[T comparable](array []T, items ...T) []T {
	out := append([]T{}, array...)

	for _, item := range items {
		if !_slices.Contains(array, item) {
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
