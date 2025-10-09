package utils

import (
	_reflect "reflect"
)

// Aggressive deepcopy with flattened pointer values
func Map_DeepCopy(v any) any {
	switch vv := v.(type) {
	case map[string]any:
		m := make(map[string]any, len(vv))
		for k, val := range vv {
			m[k] = Map_DeepCopy(val)
		}
		return m
	case []any:
		s := make([]any, len(vv))
		for i, val := range vv {
			s[i] = Map_DeepCopy(val)
		}
		return s
	default:
		rv := _reflect.ValueOf(vv)
		if rv.Kind() == _reflect.Pointer && !rv.IsNil() {
			return Map_DeepCopy(rv.Elem().Interface())
		}
		return vv
	}
}

// If aggressive, overwrite non-object values. If arrayMerge, concatenate slices.
func Map_Union(target, source map[string]any, aggressive, arrayMerge bool) map[string]any {
	for key, srcVal := range source {
		tgtVal, hasTgt := target[key]
		srcType := _reflect.TypeOf(srcVal)
		tgtType := _reflect.TypeOf(tgtVal)

		if srcType != nil && srcType.Kind() == _reflect.Map && srcVal != nil {
			srcMap, srcOk := srcVal.(map[string]any)
			if srcOk {
				var tgtMap map[string]any
				if tgtType != nil && tgtType.Kind() == _reflect.Map && tgtVal != nil {
					tgtMap, _ = tgtVal.(map[string]any)
				} else {
					tgtMap = make(map[string]any)
				}
				target[key] = Map_Union(tgtMap, srcMap, aggressive, arrayMerge)
				continue
			}
		}

		if arrayMerge {
			srcSlice, srcOk := srcVal.([]any)
			tgtSlice, tgtOk := tgtVal.([]any)
			if srcOk && tgtOk {
				target[key] = append(tgtSlice, srcSlice...)
				continue
			}
		}
		
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
		copy_typed, copy_ok := Map_DeepCopy(result).(map[string]any)
		if copy_ok {
			result = Map_Union(copy_typed, obj, aggressive, arrayMerge)
		}
	}
	return result
}

// Generate Object skeletton without normal [string]string values
func Map_Skeleton(object map[string]any) map[string]any {
	result := make(map[string]any)
	for k, v := range object {
		if sub, ok := v.(map[string]any); ok {
			result[k] = Map_Skeleton(sub)
		}
	}
	return result
}

type r_Map_Difference struct {
	Result map[string]any
	Score int
}

func Map_Difference(A, B map[string]any) r_Map_Difference {
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
				Map_Difference_ := Map_Difference(Asub, Btyped)
				if Map_Difference_.Score > 0 {
					result[Bkey] = Map_Difference_.Result
					score += Map_Difference_.Score
				}
			} else {
				result[Bkey] = Bvalue
				score++
			}
		}
	}
	return r_Map_Difference{
		Result: result, 
		Score: score,
	}
}

func Map_CollectKeyStrings(object any) []string {
	collected := []string{}
	switch obj := object.(type) {
	case map[string]string:
		for k := range obj {
			collected = append(collected, k)
		}
	case map[string]any:
		for _, inner := range obj {
			collected = append(collected, Map_CollectKeyStrings(inner)...)
		}
	}
	return collected
}