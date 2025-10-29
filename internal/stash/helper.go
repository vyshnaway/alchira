package stash

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
