package array

import (
	"fmt"
	"testing"
)

// Main function for testing the utility functions.
func Test(t *testing.T) {
	utils := NewUtils()

	// --- Test Setback ---
	fmt.Println("--- Testing Setback ---")
	arr1 := []interface{}{1, 2, 3, 2, 4, 1, 5}
	fmt.Printf("Original: %v, Setback: %v\n", arr1, utils.Array.Setback(arr1)) // Expected: [3 4 5]

	arr2 := []interface{}{"a", "b", "c", "a", "d"}
	fmt.Printf("Original: %v, Setback: %v\n", arr2, utils.Array.Setback(arr2)) // Expected: [b c d]

	arr3 := []interface{}{1, 1, 1, 1}
	fmt.Printf("Original: %v, Setback: %v\n", arr3, utils.Array.Setback(arr3)) // Expected: [1]
	fmt.Println()

	// --- Test FromNumberedObject ---
	fmt.Println("--- Testing FromNumberedObject ---")
	obj1 := map[string]interface{}{
		"0": "apple",
		"2": "banana",
		"4": "cherry",
	}
	fmt.Printf("Object: %v, MaxKey: %v, Array: %v\n", obj1, 4, utils.Array.FromNumberedObject(obj1, 4))
	// Expected: [apple [] banana [] cherry]

	obj2 := map[string]interface{}{
		"1": []string{"item1"},
		"3": []int{10, 20},
	}
	fmt.Printf("Object: %v, MaxKey: %v3, Array: %v\n", obj2, 3, utils.Array.FromNumberedObject(obj2, 3))
	// Expected: [[] [item1] [] [10 20]]
	fmt.Println()

	// --- Test LongestSubChain ---
	fmt.Println("--- Testing LongestSubChain ---")
	parent1 := []interface{}{1, 5, 2, 6, 3, 7, 4}
	child1 := []interface{}{1, 2, 3, 4}
	fmt.Printf("Parent: %v, Child: %v, Longest Subchain: %v\n", parent1, child1, utils.Array.LongestSubChain(parent1, child1))
	// Expected: [1 2 3 4]

	parent2 := []interface{}{"a", "x", "b", "y", "c"}
	child2 := []interface{}{"a", "b", "c"}
	fmt.Printf("Parent: %v, Child: %v, Longest Subchain: %v\n", parent2, child2, utils.Array.LongestSubChain(parent2, child2))
	// Expected: [a b c]

	parent3 := []interface{}{10, 20, 30, 40, 50}
	child3 := []interface{}{10, 30, 20, 40} // 20 is out of order for the first chain
	fmt.Printf("Parent: %v, Child: %v, Longest Subchain: %v\n", parent3, child3, utils.Array.LongestSubChain(parent3, child3))
	// Expected: [10 30 40] (or [10 20 40] if 20 is picked first, but the JS logic suggests [10 30 40] due to `remainingChild` handling)

	parent4 := []interface{}{1, 2, 3, 4, 5}
	child4 := []interface{}{5, 4, 3, 2, 1}
	fmt.Printf("Parent: %v, Child: %v, Longest Subchain: %v\n", parent4, child4, utils.Array.LongestSubChain(parent4, child4))
	// Expected: [5] (or [4] or [3] etc. - any single element as no increasing sequence)

	parent5 := []interface{}{"apple", "orange", "banana", "grape"}
	child5 := []interface{}{"orange", "grape"}
	fmt.Printf("Parent: %v, Child: %v, Longest Subchain: %v\n", parent5, child5, utils.Array.LongestSubChain(parent5, child5))
	// Expected: [orange grape]

	parent6 := []interface{}{"a", "b", "c", "d", "e"}
	child6 := []interface{}{"a", "c", "b", "d"}
	fmt.Printf("Parent: %v, Child: %v, Longest Subchain: %v\n", parent6, child6, utils.Array.LongestSubChain(parent6, child6))
	// Expected: [a c d] (from "a", "c", then "d")
}
