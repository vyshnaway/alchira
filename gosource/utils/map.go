package utils

import(
	_strings_ "strings"
)

import (
    "reflect"
)

// Deep copy for map[string]any (does not support all types)
func Map_DeepCopy(src map[string]any) map[string]any {
    b := make(map[string]any, len(src))
    for k, v := range src {
        switch vv := v.(type) {
        case map[string]any:
            b[k] = Map_DeepCopy(vv)
        case []any:
            c := make([]any, len(vv))
            copy(c, vv)
            b[k] = c
        default:
            b[k] = v
        }
    }
    return b
}

// Recursively merges keys and values from source into target.
// If aggressive, overwrite non-object values. If arrayMerge, concatenate slices.
func Map_Union(target, source map[string]any, aggressive, arrayMerge bool) map[string]any {
    for key, srcVal := range source {
        tgtVal, hasTgt := target[key]
        srcType := reflect.TypeOf(srcVal)
        tgtType := reflect.TypeOf(tgtVal)

        // If both are non-nil maps
        if srcType != nil && srcType.Kind() == reflect.Map && srcVal != nil {
            srcMap, srcOk := srcVal.(map[string]any)
            if srcOk {
                var tgtMap map[string]any
                if tgtType != nil && tgtType.Kind() == reflect.Map && tgtVal != nil {
                    tgtMap, _ = tgtVal.(map[string]any)
                } else {
                    tgtMap = make(map[string]any)
                }
                target[key] = Map_Union(tgtMap, srcMap, aggressive, arrayMerge)
                continue
            }
        }
        // If both are slices (arrays)
        if arrayMerge {
            srcSlice, srcOk := srcVal.([]any)
            tgtSlice, tgtOk := tgtVal.([]any)
            if srcOk && tgtOk {
                target[key] = append(tgtSlice, srcSlice...)
                continue
            }
        }
        // Otherwise: aggressive overwrite or copy if key not present
        if aggressive || !hasTgt {
            target[key] = srcVal
        }
    }
    return target
}

// Merges a slice of map[string]any with options
func Map_BulkMerge(objectArray []map[string]any, aggressive, arrayMerge bool) map[string]any {
    if len(objectArray) == 0 {
        return map[string]any{}
    }
    result := make(map[string]any)
    for _, obj := range objectArray {
        // deep copy utility for the accumulator
        accCopy := Map_DeepCopy(result)
        result = Map_Union(accCopy, obj, aggressive, arrayMerge)
    }
    return result
}

// Generate Object skeletton without normal [string]string values
func Map_Skeleton(object map[string]any) map[string]any {
	result := make(map[string]any)
	for k, v := range object {
		if sub, ok := v.(map[string]any); ok {
			result[k] = Map_Skeleton(sub)
		} else if _strings_.HasPrefix(k, "--") {
			if strVal, ok := v.(string); ok {
				result[k] = strVal
			}
		}
	}
	return result
}

func Map_Difference(A, B map[string]any) (map[string]any, int) {
	score := 0
	result := make(map[string]any)
	for Bkey, Bvalue := range B {
		switch Btyped := Bvalue.(type) {
		case string, float64, bool, nil:
			if A[Bkey] != Bvalue {
				result[Bkey] = Bvalue
				score++
			}
		case map[string]any:
			if Asub, ok := A[Bkey].(map[string]any); ok {
				subobj, subscore := Map_Difference(Asub, Btyped)
				if subscore > 0 {
					result[Bkey] = subobj
					score += subscore
				}
			} else {
				result[Bkey] = Bvalue
				score++
			}
		}
	}
	return result, score
}
