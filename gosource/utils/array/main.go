package array

import (
	"reflect" // Used for deep equality checks and type introspection for `indexOf` and `contains`
	"strconv" // For converting int keys to string for map access in fromNumberedObject
)

// ArrayUtils provides utility functions for array (slice) manipulation.
type ArrayUtils struct{}

// setback removes duplicate elements from a slice, keeping only the last occurrence of each element.
// It works for slices of comparable types. For non-comparable types (like structs or slices),
// it relies on reflect.DeepEqual which might not be what's intended for all use cases.
func (au *ArrayUtils) Setback(arr []interface{}) []interface{} {
	lastSeen := make(map[interface{}]int)
	// Populate lastSeen map with the last index of each item
	for i, item := range arr {
		lastSeen[item] = i
	}

	var result []interface{}
	// Filter the array, keeping only items whose current index is their last seen index
	for i, item := range arr {
		if lastSeen[item] == i {
			result = append(result, item)
		}
	}
	return result
}

// fromNumberedObject converts a map with string keys (representing numbers) into a slice.
// It populates the slice up to maxKey, using values from the map.
// If a key is missing in the map, the corresponding slice element defaults to an empty slice ([]interface{}).
func (au *ArrayUtils) FromNumberedObject(obj map[string]interface{}, maxKey int) []interface{} {
	if maxKey < 0 {
		return []interface{}{}
	}

	result := make([]interface{}, maxKey+1)
	for i := 0; i <= maxKey; i++ {
		keyStr := strconv.Itoa(i)
		if val, ok := obj[keyStr]; ok {
			result[i] = val
		} else {
			result[i] = []interface{}{} // Default to empty slice if key is missing
		}
	}
	return result
}

// indexOf is a helper function to find the index of an element in a slice.
// It uses reflect.DeepEqual for comparison, allowing it to work with various types.
func indexOf(slice []interface{}, item interface{}) int {
	for i, v := range slice {
		if reflect.DeepEqual(v, item) {
			return i
		}
	}
	return -1
}

// contains is a helper function to check if an element is present in a slice.
// It uses reflect.DeepEqual for comparison.
func contains(slice []interface{}, item interface{}) bool {
	return indexOf(slice, item) != -1
}

// LongestSubChain finds the longest subsequence of `child` that also appears in `parent`
// in the same relative order. This is a greedy approach.
func (au *ArrayUtils) LongestSubChain(parent, child []interface{}) []interface{} {
	if len(parent) == 0 || len(child) == 0 {
		return []interface{}{}
	}

	var results [][]interface{}
	var remainingChild []interface{}
	// Initialize remainingChild with all elements of child that are also in parent
	for _, cItem := range child {
		if contains(parent, cItem) {
			remainingChild = append(remainingChild, cItem)
		}
	}

	maxScore := 0
	resultIndex := 0

	// Loop as long as there are potential elements to form a chain
	for len(remainingChild) > 0 {
		parentInLast := -1 // Tracks the last seen index in the parent array for the current chain
		var currentChain []interface{}
		var nextRemainingChild []interface{} // Elements for the next iteration of remainingChild

		// Find the starting point for the current chain in the original child array
		startIndexInChild := indexOf(child, remainingChild[0])
		if startIndexInChild == -1 { // Should not happen if remainingChild is correctly populated
			remainingChild = []interface{}{} // Break loop if start element not found
			continue
		}

		// Iterate through the child array from the determined start index
		for i := startIndexInChild; i < len(child); i++ {
			childItem := child[i]
			parentInNow := indexOf(parent, childItem) // Get index of childItem in parent

			// If childItem is found in parent and its index is greater than the last seen parent index,
			// it extends the current chain.
			if parentInNow != -1 && parentInLast < parentInNow {
				currentChain = append(currentChain, childItem)
				parentInLast = parentInNow
			} else if contains(remainingChild, childItem) && contains(parent, childItem) {
				// If childItem doesn't extend the current chain but is still a candidate for future chains,
				// add it to nextRemainingChild.
				nextRemainingChild = append(nextRemainingChild, childItem)
			}
		}

		// Update maxScore and store the longest chain found so far
		if len(currentChain) > maxScore {
			maxScore = len(currentChain)
			resultIndex = len(results) // Store index where this chain will be added
			results = append(results, currentChain)
		} else {
			// If currentChain is not longer, still add it if it's a valid chain,
			// but it won't be the `resultIndex` unless it's the first.
			// The JS code only pushes if it's the longest, but `resultIndex` is updated based on `results.length`.
			// To strictly match JS, we only push if it's the longest, or if it's the first.
			if len(results) == 0 || len(currentChain) == maxScore { // Add if it's the first or equally long
				results = append(results, currentChain)
			}
		}

		// Prepare for the next iteration
		remainingChild = nextRemainingChild
	}

	if len(results) == 0 {
		return []interface{}{}
	}
	return results[resultIndex]
}

// Exported struct to hold all utility functions, similar to JavaScript's default export.
type Utils struct {
	Array *ArrayUtils
}

// NewUtils creates and returns a new Utils instance.
func NewUtils() *Utils {
	return &Utils{
		Array: &ArrayUtils{},
	}
}