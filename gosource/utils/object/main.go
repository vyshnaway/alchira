// utils/math.go
package utils

import (
	"reflect" // Used for deep equality checks and type introspection
)

// ObjectSwitch inverts the keys of a nested object.
// Outer keys become inner values, and inner keys become new outer keys.
// Keys in the source object starting with "+" are ignored.
func ObjectSwitch(srcObject map[string]interface{}) map[string]interface{} {
	if srcObject == nil {
		return make(map[string]interface{})
	}

	output := make(map[string]interface{})

	for outerKey, outerVal := range srcObject {
		// Skip keys starting with "+" as per JS logic
		if len(outerKey) > 0 && outerKey[0] == '+' {
			continue
		}

		// Ensure the value is a map (object)
		if innerObject, ok := outerVal.(map[string]interface{}); ok {
			for innerKey, innerVal := range innerObject {
				// Initialize the inner map if it doesn't exist
				if _, exists := output[innerKey]; !exists {
					output[innerKey] = make(map[string]interface{})
				}

				// Type assert to map[string]interface{} for assignment
				if outputMap, ok := output[innerKey].(map[string]interface{}); ok {
					outputMap[outerKey] = innerVal
				}
			}
		}
	}
	return output
}

// DeepMerge recursively merges a source map into a target map.
// Values from the source map overwrite values in the target map.
// If both values are maps, they are merged recursively. Arrays are overwritten, not merged.
func DeepMerge(target, source map[string]interface{}) map[string]interface{} {
	if source == nil {
		return target
	}

	if target == nil {
		target = make(map[string]interface{})
	}

	for key, sourceValue := range source {
		// Skip undefined values (Go's nil is equivalent to JS's undefined in this context for map values)
		if sourceValue == nil {
			continue
		}

		targetValue, targetHasKey := target[key]

		// Check if both target and source values are maps (objects) and not arrays
		if targetHasKey &&
			reflect.TypeOf(targetValue).Kind() == reflect.Map &&
			reflect.TypeOf(sourceValue).Kind() == reflect.Map &&
			reflect.TypeOf(targetValue).Elem().Kind() == reflect.Interface && // Ensure it's map[string]interface{}
			reflect.TypeOf(sourceValue).Elem().Kind() == reflect.Interface { // Ensure it's map[string]interface{}
			// Recursively merge nested maps
			targetMap, _ := targetValue.(map[string]interface{})
			sourceMap, _ := sourceValue.(map[string]interface{})
			target[key] = DeepMerge(targetMap, sourceMap)
		} else {
			// Overwrite primitive values, arrays, or if types don't match for recursive merge
			target[key] = sourceValue
		}
	}
	return target
}

// deepCopyMap creates a deep copy of a map[string]interface{}.
// This is necessary because Go's maps are reference types, and direct assignment
// would lead to modifications in the original map.
func deepCopyMap(m map[string]interface{}) map[string]interface{} {
	if m == nil {
		return nil
	}
	cp := make(map[string]interface{}, len(m))
	for k, v := range m {
		// If the value is a map, recursively copy it
		if valMap, ok := v.(map[string]interface{}); ok {
			cp[k] = deepCopyMap(valMap)
		} else if valSlice, ok := v.([]interface{}); ok {
			// If the value is a slice, copy its elements
			newSlice := make([]interface{}, len(valSlice))
			copy(newSlice, valSlice)
			cp[k] = newSlice
		} else {
			// For other types, assign directly
			cp[k] = v
		}
	}
	return cp
}

// BulkMerge merges an array of maps into a single map.
// aggressive: if true, new values overwrite existing ones. If false, existing values are preserved.
// arrayMerge: if true, arrays are appended; otherwise, they are overwritten.
func BulkMerge(objectArray []map[string]interface{}, aggressive bool, arrayMerge bool) map[string]interface{} {
	if objectArray == nil || len(objectArray) == 0 {
		return make(map[string]interface{})
	}

	// Internal deepMerge function for BulkMerge, adapted from the JS version's internal helper.
	// This helper handles aggressive and arrayMerge flags.
	var bulkDeepMerge func(target, source map[string]interface{}) map[string]interface{}
	bulkDeepMerge = func(target, source map[string]interface{}) map[string]interface{} {
		if source == nil {
			return target
		}
		if target == nil {
			target = make(map[string]interface{})
		}

		for key, sourceValue := range source {
			// Check if source has the key (equivalent to hasOwnProperty in JS)
			// Go's map iteration only includes existing keys.
			targetValue, targetHasKey := target[key]

			// Handle nested objects (non-arrays)
			if sourceMap, ok := sourceValue.(map[string]interface{}); ok {
				if targetMap, ok := targetValue.(map[string]interface{}); ok {
					// Recursively merge into existing object
					target[key] = bulkDeepMerge(targetMap, sourceMap)
				} else {
					// Create a shallow copy if target[key] isn't an object
					// In Go, map assignment copies the reference, so we need a deep copy if we want independence.
					target[key] = deepCopyMap(sourceMap)
				}
			} else if sourceSlice, ok := sourceValue.([]interface{}); ok && arrayMerge {
				// Handle arrays when arrayMerge is true
				if targetSlice, ok := targetValue.([]interface{}); ok {
					// Append elements to existing array
					target[key] = append(targetSlice, sourceSlice...)
				} else {
					// If target value is not an array, just set it
					target[key] = sourceSlice
				}
			} else {
				// Handle primitives and arrays when arrayMerge is false or aggressive is true
				if aggressive || !targetHasKey {
					target[key] = sourceValue
				}
			}
		}
		return target
	}

	result := make(map[string]interface{})
	for _, obj := range objectArray {
		// Deep copy the result before merging to avoid modifying previous iterations' results
		// when `reduce` equivalent is used.
		result = bulkDeepMerge(deepCopyMap(result), obj)
	}

	return result
}

// Skeleton creates a "skeleton" of an object, preserving only the structure
// (keys of nested objects) and setting all leaf values to nil.
func Skeleton(object map[string]interface{}) map[string]interface{} {
	if object == nil {
		return make(map[string]interface{})
	}

	result := make(map[string]interface{})
	for k, o := range object {
		if _, ok := o.(map[string]interface{}); ok {
			result[k] = Skeleton(o.(map[string]interface{}))
		} else {
			// For non-object values, set to nil (Go's equivalent of an empty value for an interface)
			result[k] = nil
		}
	}
	return result
}

// ObjectDelta compares two maps (A and B) and returns a new map containing
// only the keys from B that have different values compared to A, along with a score
// representing the number of differences.
// It only compares string and nested object types as per the JS logic.
func ObjectDelta(A, B map[string]interface{}) (map[string]interface{}, int) {
	score := 0
	result := make(map[string]interface{})

	if B == nil {
		return result, score
	}

	for Bkey, Bvalue := range B {
		switch Bval := Bvalue.(type) {
		case string:
			if Aval, ok := A[Bkey].(string); !ok || Aval != Bval {
				score++
				result[Bkey] = Bvalue
			}
		case map[string]interface{}:
			if Aval, ok := A[Bkey].(map[string]interface{}); ok {
				subResult, subScore := ObjectDelta(Aval, Bval)
				if subScore > 0 {
					result[Bkey] = subResult
				}
				score += subScore
			} else {
				// If A[Bkey] is not an object or doesn't exist, consider Bvalue as a difference
				score++ // This counts the entire object as a difference
				result[Bkey] = Bvalue
			}
		// The original JS only handles 'string' and 'object'.
		// For other types, they are implicitly ignored if they don't match 'string' or 'object' case.
		// To match JS behavior, we explicitly do nothing for other types.
		default:
			// Do nothing for other types if they are not explicitly handled in JS switch
			// If you want to compare other types (e.g., numbers, booleans), add cases here.
			// For now, mirroring JS, which only checks string and object.
		}
	}
	return result, score
}
