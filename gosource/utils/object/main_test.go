package utils

import (
	"fmt"
	"testing"
)

func Test(t *testing.T) {
	// --- Test ObjectSwitch ---
	fmt.Println("--- Testing ObjectSwitch ---")
	srcObj := map[string]interface{}{
		"key1": map[string]interface{}{
			"inner1": "valueA",
			"inner2": "valueB",
		},
		"key2": map[string]interface{}{
			"inner1": "valueC",
			"inner3": "valueD",
		},
		"+ignoredKey": map[string]interface{}{
			"innerX": "valueX",
		},
		"key3": "notAnObject", // This will be ignored by ObjectSwitch
	}
	switchedObj := ObjectSwitch(srcObj)
	fmt.Printf("Original: %+v\nSwitched: %+v\n\n", srcObj, switchedObj)
	// Expected:
	// Switched: map[inner1:map[key1:valueA key2:valueC] inner2:map[key1:valueB] inner3:map[key2:valueD]]

	// --- Test DeepMerge ---
	fmt.Println("--- Testing DeepMerge ---")
	target1 := map[string]interface{}{
		"a": 1,
		"b": map[string]interface{}{
			"c": 3,
			"d": 4,
		},
		"e": []interface{}{1, 2},
	}
	source1 := map[string]interface{}{
		"a": 10,
		"b": map[string]interface{}{
			"d": 40,
			"f": 60,
		},
		"e": []interface{}{3, 4},
		"g": 7,
	}
	merged1 := DeepMerge(target1, source1)
	fmt.Printf("Target: %+v\nSource: %+v\nMerged: %+v\n\n", target1, source1, merged1)
	// Expected:
	// Merged: map[a:10 b:map[c:3 d:40 f:60] e:[3 4] g:7]

	// --- Test BulkMerge ---
	fmt.Println("--- Testing BulkMerge ---")
	objArr := []map[string]interface{}{
		{"a": 1, "b": map[string]interface{}{"c": 3}, "arr": []interface{}{1}},
		{"a": 2, "b": map[string]interface{}{"d": 4}, "arr": []interface{}{2}},
		{"e": 5, "b": map[string]interface{}{"c": 30}},
	}

	// Aggressive: true, ArrayMerge: false (arrays overwritten)
	mergedBulkAggressiveNoArrayMerge := BulkMerge(objArr, true, false)
	fmt.Printf("BulkMerge (Aggressive, No Array Merge): %+v\n", mergedBulkAggressiveNoArrayMerge)
	// Expected (approx): map[a:2 b:map[c:30 d:4] arr:[2] e:5]

	// Aggressive: false, ArrayMerge: false (existing values preserved, arrays overwritten)
	mergedBulkNonAggressiveNoArrayMerge := BulkMerge(objArr, false, false)
	fmt.Printf("BulkMerge (Non-Aggressive, No Array Merge): %+v\n", mergedBulkNonAggressiveNoArrayMerge)
	// Expected (approx): map[a:1 b:map[c:3 d:4] arr:[1] e:5]

	// Aggressive: true, ArrayMerge: true (arrays appended)
	mergedBulkAggressiveWithArrayMerge := BulkMerge(objArr, true, true)
	fmt.Printf("BulkMerge (Aggressive, With Array Merge): %+v\n\n", mergedBulkAggressiveWithArrayMerge)
	// Expected (approx): map[a:2 b:map[c:30 d:4] arr:[1 2] e:5]

	// --- Test Skeleton ---
	fmt.Println("--- Testing Skeleton ---")
	fullObj := map[string]interface{}{
		"level1_key1": "value1",
		"level1_key2": map[string]interface{}{
			"level2_key1": 123,
			"level2_key2": map[string]interface{}{
				"level3_key1": true,
			},
		},
		"level1_key3": []interface{}{"a", "b"},
	}
	skeletonObj := Skeleton(fullObj)
	fmt.Printf("Original: %+v\nSkeleton: %+v\n\n", fullObj, skeletonObj)
	// Expected:
	// Skeleton: map[level1_key1:<nil> level1_key2:map[level2_key1:<nil> level2_key2:map[level3_key1:<nil>]] level1_key3:<nil>]

	// --- Test ObjectDelta ---
	fmt.Println("--- Testing ObjectDelta ---")
	objA := map[string]interface{}{
		"name": "Alice",
		"age":  30,
		"address": map[string]interface{}{
			"street": "123 Main St",
			"city":   "Anytown",
		},
		"hobbies": []interface{}{"reading", "hiking"},
		"status":  "active",
	}
	objB := map[string]interface{}{
		"name": "Bob", // Changed
		"age":  30,    // Same
		"address": map[string]interface{}{
			"street": "456 Oak Ave", // Changed
			"zip":    "12345",       // Added
		},
		"hobbies": []interface{}{"reading", "hiking"}, // Same (array not compared by value in JS)
		"newKey":  "newValue",                         // Added
		"status":  123,                                // Type changed (JS treats as difference)
	}

	deltaResult, deltaScore := ObjectDelta(objA, objB)
	fmt.Printf("Object A: %+v\nObject B: %+v\nDelta Result: %+v\nDelta Score: %d\n\n", objA, objB, deltaResult, deltaScore)
	// Expected based on JS logic (only string and object types are deeply compared/checked):
	// Delta Result: map[address:map[street:456 Oak Ave zip:12345] name:Bob newKey:newValue status:123]
	// Delta Score: 4 (name, address, newKey, status)
}
